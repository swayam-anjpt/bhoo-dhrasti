import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import {
  CandidateSiteScore,
  CitizenReport,
  DistrictMetrics,
  InfrastructureAsset,
  LandUseCategory,
  Parcel,
  ParcelFilterType,
  SatelliteProject,
} from '../types';
import {
  AreaTemporalData,
  TemporalFactor,
  TemporalYear,
} from '../types/temporal';
import { AHMEDABAD_TEMPORAL_AREAS } from '../data/temporalData';
import {
  Layers,
  Plus,
  Minus,
  Navigation,
  Sparkles,
  Building2,
  Eye,
  AlertTriangle,
  Info,
  Map as MapIcon,
  Globe,
  Crosshair,
  Check,
  CheckCircle2,
  Sliders,
  Filter,
  TrendingUp,
  Activity,
} from 'lucide-react';

// Fix default leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export type MapLayerMode = 'satellite' | 'terrain';

export interface LandCategoryConfig {
  id: ParcelFilterType;
  label: string;
  shortLabel: string;
  color: string;
  accentHex: string;
  description: string;
}

export const LAND_CATEGORIES: LandCategoryConfig[] = [
  {
    id: 'Agriculture',
    label: 'Agriculture',
    shortLabel: 'Agriculture',
    color: '#10b981', // Emerald Green
    accentHex: '#059669',
    description: 'Arable farmsteads, cash-crop soil belts & irrigation catchments',
  },
  {
    id: 'Residential',
    label: 'Residential',
    shortLabel: 'Residential',
    color: '#0ea5e9', // Sky Blue
    accentHex: '#0284c7',
    description: 'Urban town planning blocks, housing societies & rural gaothan',
  },
  {
    id: 'Commercial',
    label: 'Commercial',
    shortLabel: 'Commercial',
    color: '#f59e0b', // Amber Gold
    accentHex: '#d97706',
    description: 'Market plazas, highway retail arcades & logistics hubs',
  },
  {
    id: 'Government',
    label: 'Government',
    shortLabel: 'Government',
    color: '#8b5cf6', // Royal Violet
    accentHex: '#7c3aed',
    description: 'Administrative complexes, public works & revenue land reserves',
  },
  {
    id: 'Protected',
    label: 'Protected / Forest Area',
    shortLabel: 'Protected / Forest',
    color: '#047857', // Deep Forest Jade
    accentHex: '#065f46',
    description: 'Wildlife sanctuaries, reserve forests & eco-sensitive riparian buffers',
  },
  {
    id: 'Other',
    label: 'Other',
    shortLabel: 'Other',
    color: '#ec4899', // Pink / Coral
    accentHex: '#db2777',
    description: 'Water body recharge basins, mixed industrial & wasteland plots',
  },
];

interface GISMapProps {
  districts: DistrictMetrics[];
  selectedDistrict: DistrictMetrics | null;
  onSelectDistrict: (district: DistrictMetrics) => void;
  parcels: Parcel[];
  selectedParcel: Parcel | null;
  onSelectParcel: (parcel: Parcel | null) => void;
  infrastructureAssets: InfrastructureAsset[];
  candidateSites: CandidateSiteScore[];
  selectedSite: CandidateSiteScore | null;
  onSelectSite: (site: CandidateSiteScore | null) => void;
  citizenReports: CitizenReport[];
  satelliteProjects: SatelliteProject[];
  isDarkMode?: boolean;
  parcelFilter?: ParcelFilterType;
  onFilterChange?: (filter: ParcelFilterType) => void;
  showPillFilters?: boolean;
  flyToParcelTarget?: { parcel: Parcel; timestamp: number } | null;
  flyToLocationTarget?: { lat: number; lng: number; zoom?: number; timestamp: number } | null;
  // 5-Year Temporal Spatial Analytics integration props
  isTemporalMode?: boolean;
  temporalYear?: TemporalYear;
  temporalFactor?: TemporalFactor;
  temporalAreas?: AreaTemporalData[];
  selectedTemporalArea?: AreaTemporalData | null;
  onSelectTemporalArea?: (area: AreaTemporalData | null) => void;
  onTemporalFactorChange?: (factor: TemporalFactor) => void;
}

export const GISMap: React.FC<GISMapProps> = ({
  districts,
  selectedDistrict,
  onSelectDistrict,
  parcels,
  selectedParcel,
  onSelectParcel,
  infrastructureAssets,
  candidateSites,
  selectedSite,
  onSelectSite,
  citizenReports,
  satelliteProjects,
  isDarkMode = true,
  parcelFilter = 'All',
  onFilterChange,
  showPillFilters = true,
  flyToParcelTarget,
  flyToLocationTarget,
  isTemporalMode = false,
  temporalYear = 2026,
  temporalFactor = 'overall',
  temporalAreas = AHMEDABAD_TEMPORAL_AREAS,
  selectedTemporalArea = null,
  onSelectTemporalArea,
  onTemporalFactorChange,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Layer groups refs
  const baseTilesRef = useRef<L.TileLayer | null>(null);
  const districtLayerGroupRef = useRef<L.FeatureGroup | null>(null);
  const parcelLayerGroupRef = useRef<L.FeatureGroup | null>(null);
  const infraLayerGroupRef = useRef<L.FeatureGroup | null>(null);
  const sitesLayerGroupRef = useRef<L.FeatureGroup | null>(null);
  const temporalLayerGroupRef = useRef<L.FeatureGroup | null>(null);

  // Map View Mode: 'satellite' vs 'terrain'
  const [mapMode, setMapMode] = useState<MapLayerMode>('satellite');
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number }>({
    lat: selectedDistrict ? selectedDistrict.centerLat : 22.8368,
    lng: selectedDistrict ? selectedDistrict.centerLng : 74.2547,
  });

  // Fetch initial map mode preference from backend
  useEffect(() => {
    fetch('/api/maps/preference')
      .then((res) => res.json())
      .then((data) => {
        if (data?.mode === 'satellite' || data?.mode === 'terrain') {
          setMapMode(data.mode);
        }
      })
      .catch(() => {});
  }, []);

  const handleSelectMapMode = (mode: MapLayerMode) => {
    setMapMode(mode);
    fetch('/api/maps/preference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode }),
    }).catch(() => {});
  };

  // Layer visibility toggles
  const [showParcels, setShowParcels] = useState(true);
  const [showInfrastructure, setShowInfrastructure] = useState(true);
  const [showCandidateSites, setShowCandidateSites] = useState(true);
  const [layerControlOpen, setLayerControlOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ParcelFilterType>(parcelFilter);

  // Close layer dropdown when clicking outside
  const layerMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (layerMenuRef.current && !layerMenuRef.current.contains(event.target as Node)) {
        setLayerControlOpen(false);
      }
    };
    if (layerControlOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [layerControlOpen]);

  useEffect(() => {
    setActiveFilter(parcelFilter);
  }, [parcelFilter]);

  // Base Map Tile Providers: High-Resolution Satellite Imagery & Topographic Terrain
  const getTileConfig = (mode: MapLayerMode, darkMode: boolean) => {
    if (mode === 'terrain') {
      return {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
        attribution: '© Esri Topographic Terrain © OpenStreetMap',
        subdomains: ['a', 'b', 'c', 'd'],
      };
    }
    return {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '© Esri World Imagery © Mappls Satellite',
      subdomains: ['a', 'b', 'c', 'd'],
    };
  };

  // Initialize Leaflet Map Instance
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialLat = selectedDistrict ? selectedDistrict.centerLat : 22.8368;
    const initialLng = selectedDistrict ? selectedDistrict.centerLng : 74.2547;
    const initialZoom = selectedDistrict ? selectedDistrict.zoomLevel : 11;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: initialZoom,
      zoomControl: false,
      attributionControl: false,
      maxZoom: 19,
      minZoom: 5,
    });

    // Initial Base Tiles
    const activeTile = getTileConfig(mapMode, isDarkMode);
    const baseTiles = L.tileLayer(activeTile.url, {
      attribution: activeTile.attribution,
      subdomains: activeTile.subdomains,
      maxZoom: 19,
    }).addTo(map);

    baseTilesRef.current = baseTiles;

    // Feature Groups
    districtLayerGroupRef.current = L.featureGroup().addTo(map);
    parcelLayerGroupRef.current = L.featureGroup().addTo(map);
    infraLayerGroupRef.current = L.featureGroup().addTo(map);
    sitesLayerGroupRef.current = L.featureGroup().addTo(map);
    temporalLayerGroupRef.current = L.featureGroup().addTo(map);

    // Track Cursor Coordinates
    map.on('mousemove', (e) => {
      setCursorCoords({
        lat: Number(e.latlng.lat.toFixed(4)),
        lng: Number(e.latlng.lng.toFixed(4)),
      });
    });

    mapInstanceRef.current = map;

    // Invalidate map size on container resize
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Base Tiles when Map Mode or Dark Mode changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (baseTilesRef.current) {
      map.removeLayer(baseTilesRef.current);
    }

    const tileConfig = getTileConfig(mapMode, isDarkMode);
    const newBase = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      subdomains: tileConfig.subdomains,
      maxZoom: 19,
    }).addTo(map);

    baseTilesRef.current = newBase;
    newBase.bringToBack();
  }, [mapMode, isDarkMode]);

  // Center on Selected District
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedDistrict) return;

    map.flyTo([selectedDistrict.centerLat, selectedDistrict.centerLng], selectedDistrict.zoomLevel, {
      duration: 1.2,
      easeLinearity: 0.25,
    });
  }, [selectedDistrict]);

  // Smoothly Fly and Zoom into Target Parcel on Map
  useEffect(() => {
    if (!flyToParcelTarget || !mapInstanceRef.current) return;
    const target = flyToParcelTarget.parcel;
    const map = mapInstanceRef.current;

    if (target.coordinates && target.coordinates.length > 0) {
      const latLngs = target.coordinates.map((c) => [c[0], c[1]] as [number, number]);
      const bounds = L.latLngBounds(latLngs);
      map.flyToBounds(bounds.pad(0.5), {
        duration: 1.4,
        easeLinearity: 0.25,
        maxZoom: 17,
      });
    } else if (target.centerLat && target.centerLng) {
      map.flyTo([target.centerLat, target.centerLng], 17, {
        duration: 1.4,
        easeLinearity: 0.25,
      });
    }
  }, [flyToParcelTarget]);

  // Smoothly Fly and Zoom into Target City / Taluka or District on Map
  useEffect(() => {
    if (!flyToLocationTarget || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    map.flyTo([flyToLocationTarget.lat, flyToLocationTarget.lng], flyToLocationTarget.zoom || 14, {
      duration: 1.2,
      easeLinearity: 0.25,
    });
  }, [flyToLocationTarget]);

  // Helper to match parcel category
  const matchesCategory = (parcel: Parcel, catId: ParcelFilterType): boolean => {
    if (catId === 'All') return true;
    if (catId === 'Agriculture') {
      return parcel.landUse === 'Agriculture' || parcel.zoneType === 'Agricultural';
    }
    if (catId === 'Residential') {
      return parcel.landUse === 'Residential' || parcel.zoneType === 'Residential';
    }
    if (catId === 'Commercial') {
      return parcel.landUse === 'Commercial' || parcel.zoneType === 'Commercial';
    }
    if (catId === 'Government') {
      return parcel.landUse === 'Government' || parcel.ownership === 'Government Revenue Land';
    }
    if (catId === 'Protected') {
      return parcel.landUse === 'Protected' || parcel.ownership === 'Forest Dept' || parcel.zoneType === 'Protected';
    }
    if (catId === 'Other') {
      return parcel.landUse === 'Other' || parcel.landUse === 'Industrial' || parcel.landUse === 'Water Body';
    }
    return false;
  };

  // Helper for Land Use Colors
  const getLandUseColor = (landUse: LandUseCategory, isGovtOwnership = false): string => {
    if (isGovtOwnership || landUse === 'Government') return '#8b5cf6'; // Royal Purple
    switch (landUse) {
      case 'Agriculture':
        return '#10b981'; // Emerald
      case 'Residential':
        return '#0ea5e9'; // Sky Blue
      case 'Commercial':
        return '#f59e0b'; // Amber Gold
      case 'Protected':
        return '#047857'; // Forest Jade
      case 'Water Body':
        return '#06b6d4'; // Cyan
      case 'Industrial':
        return '#f97316'; // Orange
      case 'Other':
      default:
        return '#ec4899'; // Coral / Pink
    }
  };

  // Count parcels per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      All: parcels.length,
      Agriculture: 0,
      Residential: 0,
      Commercial: 0,
      Government: 0,
      Protected: 0,
      Other: 0,
    };

    parcels.forEach((p) => {
      if (p.landUse === 'Agriculture' || p.zoneType === 'Agricultural') counts.Agriculture++;
      else if (p.landUse === 'Residential' || p.zoneType === 'Residential') counts.Residential++;
      else if (p.landUse === 'Commercial' || p.zoneType === 'Commercial') counts.Commercial++;
      else if (p.landUse === 'Government' || p.ownership === 'Government Revenue Land') counts.Government++;
      else if (p.landUse === 'Protected' || p.ownership === 'Forest Dept' || p.zoneType === 'Protected') counts.Protected++;
      else counts.Other++;
    });

    return counts;
  }, [parcels]);

  // Controls Handlers
  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const handleResetNorth = () => {
    if (mapInstanceRef.current && selectedDistrict) {
      mapInstanceRef.current.flyTo(
        [selectedDistrict.centerLat, selectedDistrict.centerLng],
        selectedDistrict.zoomLevel,
        { duration: 0.8 }
      );
    }
  };

  const handleSelectFilter = (filter: ParcelFilterType) => {
    setActiveFilter(filter);
    if (onFilterChange) {
      onFilterChange(filter);
    }

    // If filtering to a specific category, center/fit the map onto the matching parcels
    if (filter !== 'All' && mapInstanceRef.current) {
      const matching = parcels.filter((p) => matchesCategory(p, filter));
      if (matching.length > 0) {
        const bounds = L.latLngBounds(
          matching.map((p) => [p.centerLat, p.centerLng] as [number, number])
        );
        mapInstanceRef.current.flyToBounds(bounds.pad(0.3), { duration: 1.0, maxZoom: 14 });
      }
    }
  };

  // Render Land Parcels with Highlighting
  useEffect(() => {
    const group = parcelLayerGroupRef.current;
    if (!group) return;
    group.clearLayers();

    if (!showParcels) return;

    parcels.forEach((parcel) => {
      const isSelected = selectedParcel?.id === parcel.id;
      const isGovt = parcel.ownership === 'Government Revenue Land' && parcel.landUse !== 'Agriculture';
      const baseColor = getLandUseColor(parcel.landUse, isGovt);
      
      const isMatch = matchesCategory(parcel, activeFilter);
      const isHighlightMode = activeFilter !== 'All';

      // When a specific category is selected, matching parcels "stand out" vividly
      let strokeColor = baseColor;
      let weight = isSelected ? 4 : isMatch && isHighlightMode ? 3.5 : isDarkMode ? 1.8 : 2.0;
      let opacity = 0.9;
      let fillOpacity = 0.28;

      if (isSelected) {
        strokeColor = '#fbbf24'; // Bright Gold
        weight = 4;
        fillOpacity = 0.55;
        opacity = 1;
      } else if (isHighlightMode) {
        if (isMatch) {
          // Highlighted Parcel: vibrant glowing borders and rich fill
          strokeColor = mapMode === 'satellite' ? '#ffffff' : baseColor;
          weight = 3.5;
          fillOpacity = mapMode === 'satellite' ? 0.45 : 0.4;
          opacity = 1.0;
        } else {
          // Non-matching parcels dimmed out so the selected category stands out
          strokeColor = isDarkMode ? '#403830' : '#d6d3d1';
          weight = 1.0;
          fillOpacity = 0.05;
          opacity = 0.25;
        }
      } else {
        // Normal View (All)
        if (mapMode === 'satellite') {
          strokeColor = '#ffffff';
          fillOpacity = 0.32;
        } else {
          fillOpacity = isDarkMode ? 0.22 : 0.28;
        }
      }

      const polygon = L.polygon(parcel.coordinates, {
        color: strokeColor,
        weight: weight,
        opacity: opacity,
        fillColor: baseColor,
        fillOpacity: fillOpacity,
      });

      // Rich interactive tooltip
      polygon.bindTooltip(
        `<div style="font-family: ui-sans-serif, system-ui, sans-serif; padding: 7px 9px; background-color: ${
          isDarkMode ? 'rgba(20, 18, 16, 0.96)' : 'rgba(255, 255, 255, 0.98)'
        }; color: ${isDarkMode ? '#f4ede4' : '#1c1917'}; border: 1px solid ${isDarkMode ? '#3d3328' : '#e7e5e4'}; border-radius: 6px; box-shadow: 0 10px 25px rgba(0,0,0,${isDarkMode ? '0.6' : '0.15'}); min-width: 140px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
            <span style="font-weight: 700; color: ${isDarkMode ? '#f4ede4' : '#1c1917'}; font-size: 13px;">${parcel.village}</span>
            <span style="font-size: 9px; padding: 1px 5px; border-radius: 4px; background: ${isDarkMode ? '#241f1a' : '#f5f5f4'}; color: ${isDarkMode ? '#d4cbbf' : '#44403c'}; font-weight: 600; border: 1px solid ${isDarkMode ? '#382e23' : '#e7e5e4'};">${parcel.landUse}</span>
          </div>
          <div style="font-size: 11px; color: ${isDarkMode ? '#a89f91' : '#78716c'}; margin-top: 2px;">${parcel.taluka} &bull; <b>${parcel.areaAcres} Acres</b></div>
          <div style="display: flex; align-items: center; gap: 6px; margin-top: 4px;">
            <span style="font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 4px; background: ${isDarkMode ? '#221c17' : '#f5f5f4'}; color: ${isDarkMode ? '#f4ede4' : '#1c1917'}; border: 1px solid ${isDarkMode ? '#3d3328' : '#d6d3d1'};">${parcel.verificationStatus || 'Verified'}</span>
            <span style="font-size: 10px; color: ${isDarkMode ? '#d4cbbf' : '#44403c'}; font-weight: 600;">₹${parcel.estimatedLandCostPerAcreLakhs} L/ac</span>
          </div>
          <div style="font-size: 9px; color: ${isDarkMode ? '#736a5e' : '#a8a29e'}; font-family: monospace; margin-top: 4px;">${parcel.parcelNumber}</div>
        </div>`,
        { sticky: true }
      );

      polygon.on('click', () => {
        onSelectParcel(parcel);
      });

      polygon.addTo(group);
    });
  }, [parcels, selectedParcel, showParcels, activeFilter, mapMode, isDarkMode]);

  // Render Infrastructure Assets
  useEffect(() => {
    const group = infraLayerGroupRef.current;
    if (!group) return;
    group.clearLayers();

    if (!showInfrastructure) return;

    infrastructureAssets.forEach((asset) => {
      let iconColor = isDarkMode ? '#10b981' : '#059669';
      if (asset.condition === 'Needs Repair') iconColor = isDarkMode ? '#f59e0b' : '#d97706';
      if (asset.condition === 'Critical') iconColor = isDarkMode ? '#ef4444' : '#dc2626';

      const customIcon = L.divIcon({
        className: 'custom-infra-icon',
        html: `<div style="
          background: ${iconColor};
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid ${isDarkMode ? '#1a1613' : '#ffffff'};
          box-shadow: 0 0 8px ${iconColor};
          color: #ffffff;
          font-size: 11px;
          font-weight: 800;
          font-family: ui-sans-serif, system-ui, sans-serif;
          letter-spacing: -0.5px;
        ">
          ${asset.type === 'Hospital' ? 'H' : asset.type === 'School' ? 'S' : asset.type === 'Water Treatment' ? 'W' : asset.type === 'Bus Stand' ? 'B' : 'G'}
        </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([asset.lat, asset.lng], { icon: customIcon });

      marker.bindPopup(
        `<div style="padding: 8px; font-family: ui-sans-serif, system-ui; background-color: ${
          isDarkMode ? '#181512' : '#ffffff'
        }; color: ${isDarkMode ? '#f4ede4' : '#1c1917'}; border-radius: 6px; border: 1px solid ${
          isDarkMode ? '#3d3328' : '#e7e5e4'
        }; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
          <div style="font-weight: bold; font-size: 13px; color: ${isDarkMode ? '#e5a93b' : '#d97706'};">${asset.name}</div>
          <div style="color: ${isDarkMode ? '#a89f91' : '#78716c'}; font-size: 11px; margin-top: 2px;">${asset.type} (${asset.taluka})</div>
          <div style="display: flex; align-items: center; gap: 6px; margin-top: 4px;">
            <span style="color: ${isDarkMode ? '#8e8577' : '#a8a29e'}; font-size: 11px;">Condition:</span>
            <span style="padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; ${
              asset.condition === 'Good'
                ? isDarkMode
                  ? 'background: #064e3b; color: #6ee7b7;'
                  : 'background: #dcfce7; color: #15803d;'
                : asset.condition === 'Needs Repair'
                ? isDarkMode
                  ? 'background: #78350f; color: #fcd34d;'
                  : 'background: #fef3c7; color: #b45309;'
                : isDarkMode
                ? 'background: #881337; color: #fda4af;'
                : 'background: #fee2e2; color: #b91c1c;'
            }">${asset.condition}</span>
          </div>
        </div>`
      );

      marker.addTo(group);
    });
  }, [infrastructureAssets, showInfrastructure, isDarkMode]);

  // Render Candidate Suitability Sites (Rank 1, 2, 3)
  useEffect(() => {
    const group = sitesLayerGroupRef.current;
    if (!group) return;
    group.clearLayers();

    if (!showCandidateSites) return;

    candidateSites.forEach((site) => {
      const isSelected = selectedSite?.siteId === site.siteId;
      const isRank1 = site.rank === 1;

      const siteIcon = L.divIcon({
        className: 'custom-site-icon',
        html: `<div style="
          background: ${isRank1 ? '#e5a93b' : isDarkMode ? '#38bdf8' : '#0284c7'};
          width: ${isRank1 ? '32px' : '26px'};
          height: ${isRank1 ? '32px' : '26px'};
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid ${isSelected ? '#ffffff' : isDarkMode ? '#1a1613' : '#ffffff'};
          box-shadow: 0 0 ${isRank1 ? '14px rgba(229, 169, 59, 0.85)' : '8px rgba(0,0,0,0.3)'};
          color: #1a1613;
          font-weight: 800;
          font-size: 12px;
          cursor: pointer;
        ">
          #${site.rank}
        </div>`,
        iconSize: isRank1 ? [32, 32] : [26, 26],
        iconAnchor: isRank1 ? [16, 16] : [13, 13],
      });

      const marker = L.marker([site.lat, site.lng], {
        icon: siteIcon,
        zIndexOffset: isRank1 ? 1000 : 500,
      });

      marker.bindPopup(
        `<div style="padding: 8px; font-family: ui-sans-serif, system-ui; background-color: ${
          isDarkMode ? '#181512' : '#ffffff'
        }; color: ${isDarkMode ? '#f4ede4' : '#1c1917'}; border-radius: 6px; border: 1px solid ${
          isDarkMode ? '#3d3328' : '#e7e5e4'
        };">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; ${
              isRank1
                ? 'background: #e5a93b; color: #1a1613;'
                : 'background: #38bdf8; color: #082f49;'
            }">Rank #${site.rank}</span>
            <span style="color: #10b981; font-weight: bold; font-size: 12px;">${site.compositeScore}/100</span>
          </div>
          <div style="font-weight: bold; font-size: 13px; color: ${isDarkMode ? '#f4ede4' : '#1c1917'}; margin-top: 4px;">${site.siteName}</div>
          <div style="font-size: 11px; color: ${isDarkMode ? '#a89f91' : '#78716c'}; margin-top: 2px;">
            ${site.proposedType} &bull; ${site.areaAcres} Acres &bull; ₹${site.estimatedCapitalExpenditureCr} Cr
          </div>
        </div>`
      );

      marker.on('click', () => {
        onSelectSite(site);
      });

      marker.addTo(group);
    });
  }, [candidateSites, selectedSite, showCandidateSites, isDarkMode]);

  // Render 5-Year Temporal Spatial Analytics Layers
  useEffect(() => {
    const group = temporalLayerGroupRef.current;
    if (!group) return;
    group.clearLayers();

    if (!isTemporalMode) return;

    temporalAreas.forEach((area) => {
      const metrics = area.yearlyMetrics[temporalYear];
      if (!metrics) return;

      const isSelected = selectedTemporalArea?.id === area.id;

      // Determine thematic color based on the selected temporal factor
      let fillColor = '#e5a93b';
      let factorValueLabel = '';

      if (temporalFactor === 'overall') {
        factorValueLabel = `Overall Score: ${metrics.overallScore}/100`;
        if (metrics.overallScore >= 75) fillColor = '#10b981';
        else if (metrics.overallScore >= 65) fillColor = '#e5a93b';
        else if (metrics.overallScore >= 50) fillColor = '#f97316';
        else fillColor = '#ef4444';
      } else if (temporalFactor === 'environment') {
        factorValueLabel = `Environmental: ${metrics.environmentalScore}/100`;
        if (metrics.environmentalScore >= 70) fillColor = '#059669';
        else if (metrics.environmentalScore >= 60) fillColor = '#10b981';
        else if (metrics.environmentalScore >= 50) fillColor = '#84cc16';
        else fillColor = '#eab308';
      } else if (temporalFactor === 'accessibility') {
        factorValueLabel = `Accessibility: ${metrics.accessibilityScore}/100`;
        if (metrics.accessibilityScore >= 75) fillColor = '#0284c7';
        else if (metrics.accessibilityScore >= 60) fillColor = '#0ea5e9';
        else if (metrics.accessibilityScore >= 45) fillColor = '#38bdf8';
        else fillColor = '#ef4444';
      } else if (temporalFactor === 'population') {
        factorValueLabel = `Pop Pressure: ${metrics.populationPressureScore}/100`;
        if (metrics.populationPressureScore >= 70) fillColor = '#7e22ce';
        else if (metrics.populationPressureScore >= 55) fillColor = '#a855f7';
        else fillColor = '#c084fc';
      } else if (temporalFactor === 'urbanization') {
        factorValueLabel = `Urbanization: ${metrics.urbanizationScore}/100`;
        if (metrics.urbanizationScore >= 70) fillColor = '#d97706';
        else if (metrics.urbanizationScore >= 50) fillColor = '#f59e0b';
        else fillColor = '#fbbf24';
      } else if (temporalFactor === 'change') {
        const growth2022to2026 = area.yearlyMetrics[2026].overallScore - area.yearlyMetrics[2022].overallScore;
        factorValueLabel = `5-Yr Growth: +${growth2022to2026.toFixed(1)} pts`;
        if (growth2022to2026 >= 35) fillColor = '#10b981';
        else if (growth2022to2026 >= 25) fillColor = '#34d399';
        else if (growth2022to2026 >= 15) fillColor = '#fbbf24';
        else fillColor = '#f97316';
      }

      // Draw Temporal Zone Polygon
      const polygon = L.polygon(area.boundaryCoordinates, {
        color: isSelected ? '#ffffff' : fillColor,
        weight: isSelected ? 3.5 : 2,
        opacity: isSelected ? 1 : 0.85,
        fillColor: fillColor,
        fillOpacity: isSelected ? 0.65 : 0.42,
        dashArray: isSelected ? undefined : '4, 4',
      });

      polygon.bindTooltip(
        `<div style="font-family: ui-sans-serif, system-ui; padding: 8px 10px; background-color: ${
          isDarkMode ? 'rgba(20, 18, 16, 0.96)' : 'rgba(255, 255, 255, 0.98)'
        }; color: ${isDarkMode ? '#f4ede4' : '#1c1917'}; border: 1px solid ${
          isDarkMode ? '#3d3328' : '#e7e5e4'
        }; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.4); min-width: 170px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
            <span style="font-weight: 800; font-size: 13px; color: ${isDarkMode ? '#f4ede4' : '#1c1917'};">#${area.badgeNumber} ${area.name}</span>
            <span style="font-size: 9px; padding: 1px 5px; border-radius: 4px; background: ${fillColor}; color: #141210; font-weight: 800;">${temporalYear}</span>
          </div>
          <div style="font-size: 11px; color: ${isDarkMode ? '#a89f91' : '#78716c'}; margin-top: 2px;">
            Taluka: <b>${area.taluka}</b> &bull; Pop: ${(metrics.totalPopulation / 1000).toFixed(0)}k
          </div>
          <div style="margin-top: 4px; font-weight: 700; font-size: 11px; color: ${fillColor};">
            ${factorValueLabel}
          </div>
          <div style="font-size: 10px; color: #ef4444; margin-top: 2px;">
            DNI Deficit: <b>${metrics.dniDeficitScore}</b> &bull; ${metrics.primaryDeficitCategory}
          </div>
        </div>`,
        { sticky: true }
      );

      polygon.on('click', () => {
        if (onSelectTemporalArea) {
          onSelectTemporalArea(area);
        }
      });

      polygon.addTo(group);

      // Add Badge Marker Pin at center
      const badgeIcon = L.divIcon({
        className: 'custom-temporal-badge-icon',
        html: `<div style="
          background: ${isSelected ? '#ffffff' : fillColor};
          width: ${isSelected ? '28px' : '24px'};
          height: ${isSelected ? '28px' : '24px'};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid ${isSelected ? fillColor : isDarkMode ? '#1a1613' : '#ffffff'};
          box-shadow: 0 0 ${isSelected ? '12px #ffffff' : '8px rgba(0,0,0,0.5)'};
          color: #141210;
          font-weight: 900;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.2s ease;
        ">
          #${area.badgeNumber}
        </div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const marker = L.marker([area.centerLat, area.centerLng], {
        icon: badgeIcon,
        zIndexOffset: isSelected ? 1200 : 600,
      });

      marker.on('click', () => {
        if (onSelectTemporalArea) {
          onSelectTemporalArea(area);
        }
      });

      marker.addTo(group);
    });
  }, [temporalAreas, temporalYear, temporalFactor, selectedTemporalArea, isTemporalMode, isDarkMode]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0 bg-[#121110]" />

      {/* Top Right Controls Group: Nav Controls & Layer Switcher */}
      <div className={`absolute top-4 right-4 ${layerControlOpen ? 'z-[5000]' : 'z-[800]'} flex items-start gap-2`}>
        {/* Vertical Nav Stack: Zoom In / Zoom Out / Reset North / Layer Switcher (Image 1) */}
        <div className="flex flex-col gap-1 relative" ref={layerMenuRef}>
          <button
            type="button"
            onClick={handleZoomIn}
            title="Zoom in"
            className={`w-8 h-8 rounded border flex items-center justify-center transition-colors shadow-md ${
              isDarkMode
                ? 'bg-[#1c1916]/95 hover:bg-[#282420] text-[#f4ede4] border-[#3d3328]'
                : 'bg-white/95 hover:bg-[#f5f5f4] text-[#1c1917] border-[#e7e5e4]'
            }`}
          >
            <Plus className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleZoomOut}
            title="Zoom out"
            className={`w-8 h-8 rounded border flex items-center justify-center transition-colors shadow-md ${
              isDarkMode
                ? 'bg-[#1c1916]/95 hover:bg-[#282420] text-[#f4ede4] border-[#3d3328]'
                : 'bg-white/95 hover:bg-[#f5f5f4] text-[#1c1917] border-[#e7e5e4]'
            }`}
          >
            <Minus className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleResetNorth}
            title="Reset North / Center"
            className={`w-8 h-8 rounded border flex items-center justify-center transition-colors shadow-md ${
              isDarkMode
                ? 'bg-[#1c1916]/95 hover:bg-[#282420] text-[#f4ede4] border-[#3d3328]'
                : 'bg-white/95 hover:bg-[#f5f5f4] text-[#1c1917] border-[#e7e5e4]'
            }`}
          >
            <span className={`text-xs font-mono font-bold ${isDarkMode ? 'text-[#e5a93b]' : 'text-[#d97706]'}`}>▲</span>
          </button>

          {/* Layer Switcher Toggle Button (Image 1) */}
          <button
            type="button"
            onClick={() => setLayerControlOpen(!layerControlOpen)}
            title="Map Type (Satellite / Terrain)"
            className={`w-8 h-8 rounded border flex items-center justify-center transition-all shadow-md ${
              layerControlOpen
                ? isDarkMode
                  ? 'bg-[#e5a93b] text-[#1a1613] border-[#e5a93b] ring-2 ring-[#e5a93b]/40'
                  : 'bg-[#d97706] text-white border-[#d97706] ring-2 ring-[#d97706]/40'
                : isDarkMode
                ? 'bg-[#1c1916]/95 hover:bg-[#282420] text-[#f4ede4] border-[#3d3328]'
                : 'bg-white/95 hover:bg-[#f5f5f4] text-[#1c1917] border-[#e7e5e4]'
            }`}
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* ================= MAP TYPE POPOVER: SATELLITE & TERRAIN OPTIONS (Image 2) ================= */}
          {layerControlOpen && (
            <div
              className={`absolute right-0 top-10 p-4 rounded-2xl border z-[9999] text-xs animate-in fade-in zoom-in-95 duration-150 ring-1 shadow-[0_20px_50px_rgba(0,0,0,0.7)] ${
                isDarkMode
                  ? 'bg-[#181512]/98 border-[#42372b] text-[#d4cbbf] ring-black/80'
                  : 'bg-white/98 border-[#e7e5e4] text-[#44403c] ring-black/10 shadow-[0_20px_40px_rgba(0,0,0,0.18)]'
              }`}
            >
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-inherit">
                <span className={`text-[11px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-[#a89f91]' : 'text-[#78716c]'}`}>
                  Map Type
                </span>
                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${
                  isDarkMode ? 'bg-[#282119] text-[#e5a93b] border-[#443627]' : 'bg-[#fef3c7] text-[#b45309] border-[#fde68a]'
                }`}>
                  GIS
                </span>
              </div>

              {/* Two Options: Satellite and Terrain (Image 2) */}
              <div className="flex items-center gap-4">
                {/* Option 1: Satellite */}
                <button
                  type="button"
                  onClick={() => handleSelectMapMode('satellite')}
                  className="flex flex-col items-center gap-2 group cursor-pointer focus:outline-none"
                >
                  <div
                    className={`w-20 h-20 rounded-2xl overflow-hidden p-1 transition-all duration-200 shadow-md ${
                      mapMode === 'satellite'
                        ? isDarkMode
                          ? 'ring-2 ring-[#e5a93b] ring-offset-2 ring-offset-[#181512] shadow-[0_0_15px_rgba(229,169,59,0.35)]'
                          : 'ring-2 ring-[#d97706] ring-offset-2 ring-offset-white shadow-[0_0_12px_rgba(217,119,6,0.3)]'
                        : 'border border-[#3d3328]/40 opacity-70 group-hover:opacity-100 group-hover:scale-105'
                    }`}
                  >
                    <div className="w-full h-full rounded-[12px] overflow-hidden relative shadow-inner">
                      {/* Satellite Illustrated Preview (Roads, canopy, highway curve) */}
                      <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
                        <rect width="80" height="80" fill="#444e3c" />
                        <path d="M0 0 L50 0 L34 38 L0 26 Z" fill="#343d2f" />
                        <path d="M50 0 L80 0 L80 36 L42 24 Z" fill="#525d48" />
                        <path d="M0 50 L36 44 L24 80 L0 80 Z" fill="#2b3326" />
                        <path d="M44 54 L80 40 L80 80 L36 80 Z" fill="#3b4634" />
                        <circle cx="16" cy="66" r="8" fill="#21281d" opacity="0.65" />
                        <circle cx="66" cy="70" r="10" fill="#21281d" opacity="0.65" />
                        <circle cx="70" cy="14" r="7" fill="#2c3527" opacity="0.5" />
                        <path d="M-5 22 Q 40 40 85 70" stroke="#565a61" strokeWidth="18" strokeLinecap="round" />
                        <path d="M-5 22 Q 40 40 85 70" stroke="#80858d" strokeWidth="13" strokeLinecap="round" />
                        <path d="M-5 22 Q 40 40 85 70" stroke="#ffffff" strokeWidth="1.6" strokeDasharray="3.5 3.5" fill="none" opacity="0.95" />
                        <path d="M22 0 Q 48 28 85 45" stroke="#464b52" strokeWidth="11" strokeLinecap="round" />
                        <path d="M22 0 Q 48 28 85 45" stroke="#6e737b" strokeWidth="8" strokeLinecap="round" />
                      </svg>
                      {mapMode === 'satellite' && (
                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#e5a93b] text-[#1a1613] flex items-center justify-center font-bold text-[9px] shadow-sm">
                          ✓
                        </div>
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-xs font-semibold tracking-wide transition-colors ${
                      mapMode === 'satellite'
                        ? isDarkMode
                          ? 'text-[#e5a93b] font-bold'
                          : 'text-[#d97706] font-bold'
                        : isDarkMode
                        ? 'text-[#d4cbbf] group-hover:text-white'
                        : 'text-[#44403c] group-hover:text-black'
                    }`}
                  >
                    Satellite
                  </span>
                </button>

                {/* Option 2: Terrain */}
                <button
                  type="button"
                  onClick={() => handleSelectMapMode('terrain')}
                  className="flex flex-col items-center gap-2 group cursor-pointer focus:outline-none"
                >
                  <div
                    className={`w-20 h-20 rounded-2xl overflow-hidden p-1 transition-all duration-200 shadow-md ${
                      mapMode === 'terrain'
                        ? isDarkMode
                          ? 'ring-2 ring-[#e5a93b] ring-offset-2 ring-offset-[#181512] shadow-[0_0_15px_rgba(229,169,59,0.35)]'
                          : 'ring-2 ring-[#d97706] ring-offset-2 ring-offset-white shadow-[0_0_12px_rgba(217,119,6,0.3)]'
                        : 'border border-[#3d3328]/40 opacity-70 group-hover:opacity-100 group-hover:scale-105'
                    }`}
                  >
                    <div className="w-full h-full rounded-[12px] overflow-hidden relative shadow-inner">
                      {/* Terrain Illustrated Preview (Contour bands, shaded relief, winding white river corridor) */}
                      <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
                        <rect width="80" height="80" fill="#d2dcd0" />
                        <path d="M0 0 L80 0 L80 38 Q 55 28 40 48 Q 25 68 0 58 Z" fill="#c0cbc0" />
                        <path d="M0 0 L38 0 Q 28 28 14 42 L0 42 Z" fill="#acb8ac" />
                        <path d="M48 0 L80 0 L80 58 Q 65 38 48 32 Z" fill="#98a498" />
                        <path d="M52 42 Q 68 48 80 78 L38 78 Q 42 58 52 42 Z" fill="#808d80" />
                        <path d="M0 52 Q 18 58 22 78 L0 78 Z" fill="#6a776a" />
                        <path d="M0 24 Q 32 24 48 42 Q 62 62 80 62" stroke="#7e8c7e" strokeWidth="1" strokeDasharray="2 2" fill="none" />
                        <path d="M0 42 Q 24 42 38 62 Q 52 82 80 82" stroke="#6e7b6e" strokeWidth="1" strokeDasharray="2 2" fill="none" />
                        <path d="M48 -5 Q 64 18 58 32 Q 52 42 68 68 Q 74 78 85 82" stroke="#ffffff" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                      </svg>
                      {mapMode === 'terrain' && (
                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#e5a93b] text-[#1a1613] flex items-center justify-center font-bold text-[9px] shadow-sm">
                          ✓
                        </div>
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-xs font-semibold tracking-wide transition-colors ${
                      mapMode === 'terrain'
                        ? isDarkMode
                          ? 'text-[#e5a93b] font-bold'
                          : 'text-[#d97706] font-bold'
                        : isDarkMode
                        ? 'text-[#d4cbbf] group-hover:text-white'
                        : 'text-[#44403c] group-hover:text-black'
                    }`}
                  >
                    Terrain
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Left: Live Coordinate & Precision Bar */}
      <div
        className={`absolute top-4 left-4 z-[400] backdrop-blur-md px-3 py-1.5 rounded-lg border shadow-xl flex items-center gap-2.5 text-xs ${
          isDarkMode
            ? 'bg-[#181512]/90 border-[#3d3328] text-[#d4cbbf]'
            : 'bg-white/95 border-[#e7e5e4] text-[#44403c]'
        }`}
      >
        <Crosshair className={`w-3.5 h-3.5 animate-pulse ${isDarkMode ? 'text-[#e5a93b]' : 'text-[#d97706]'}`} />
        <span className={`font-mono text-[11px] ${isDarkMode ? 'text-[#f4ede4]' : 'text-[#1c1917]'}`}>
          {cursorCoords.lat}° N, {cursorCoords.lng}° E
        </span>
        <span
          className={`text-[9px] px-1.5 py-0.5 rounded font-semibold border ${
            isDarkMode
              ? 'bg-[#2a231b] text-[#e5a93b] border-[#4d3d2c]'
              : 'bg-[#fef3c7] text-[#b45309] border-[#fde68a]'
          }`}
        >
          {isTemporalMode ? `Temporal GIS (${temporalYear})` : 'GPS ±3m'}
        </span>
      </div>

      {/* Bottom-Left: Dynamic Temporal Map Legend (when in Temporal Mode) */}
      {isTemporalMode && (
        <div
          className={`absolute bottom-4 left-4 z-[400] backdrop-blur-md p-3 rounded-xl border shadow-2xl text-xs space-y-1.5 transition-all max-w-[220px] pointer-events-auto ${
            isDarkMode
              ? 'bg-[#141210]/95 border-[#3d3328] text-[#f4ede4]'
              : 'bg-white/98 border-[#e7e5e4] text-[#1c1917]'
          }`}
        >
          <div className="flex items-center justify-between border-b pb-1 border-inherit">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#e5a93b]">
              {temporalFactor.toUpperCase()} ({temporalYear})
            </span>
            <span className="text-[9px] font-mono text-emerald-400">8 Zones</span>
          </div>

          <div className="space-y-1 text-[10px]">
            {temporalFactor === 'overall' && (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#10b981]" />
                  <span>High Progress (&ge;75)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#e5a93b]" />
                  <span>Moderate (65&ndash;74)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#f97316]" />
                  <span>Low / Deficit (50&ndash;64)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#ef4444]" />
                  <span>Critical Deficit (&lt;50)</span>
                </div>
              </>
            )}

            {temporalFactor === 'environment' && (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#059669]" />
                  <span>Optimal Eco (&ge;70)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#10b981]" />
                  <span>Stable Canopy (60&ndash;69)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#84cc16]" />
                  <span>Moderate Stress (50&ndash;59)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#eab308]" />
                  <span>High Vulnerability (&lt;50)</span>
                </div>
              </>
            )}

            {temporalFactor === 'accessibility' && (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#0284c7]" />
                  <span>High Connectivity (&ge;75)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#0ea5e9]" />
                  <span>Good Paved Access (60&ndash;74)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#38bdf8]" />
                  <span>Developing Feeder (45&ndash;59)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#ef4444]" />
                  <span>Isolated Tribal Habitation (&lt;45)</span>
                </div>
              </>
            )}

            {temporalFactor === 'population' && (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#7e22ce]" />
                  <span>Dense Tribal Cluster (&ge;70)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#a855f7]" />
                  <span>Moderate Settlement (55&ndash;69)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#c084fc]" />
                  <span>Dispersed Rural (&lt;55)</span>
                </div>
              </>
            )}

            {temporalFactor === 'urbanization' && (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#d97706]" />
                  <span>Active Commercial Expansion (&ge;70)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#f59e0b]" />
                  <span>Semi-Urban Growth (50&ndash;69)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#fbbf24]" />
                  <span>Rural / Agriculture (&lt;50)</span>
                </div>
              </>
            )}

            {temporalFactor === 'change' && (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#10b981]" />
                  <span>Major Expansion (&ge;+35 pts)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#34d399]" />
                  <span>Steady Growth (+25 to +34)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#fbbf24]" />
                  <span>Moderate (+15 to +24)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#f97316]" />
                  <span>Lagging (&lt;+15 pts)</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Bottom Center: Floating Filter Pills (Temporal Factors in Temporal Mode, or Land categories in Land Mode) */}
      {isTemporalMode ? (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[200] max-w-[98%] pointer-events-auto">
          <div
            className={`flex items-center gap-1.5 backdrop-blur-md px-2.5 py-1.5 rounded-full border shadow-2xl transition-all ${
              isDarkMode
                ? 'bg-[#141210]/95 border-[#3d3328] shadow-[0_8px_30px_rgba(0,0,0,0.65)] ring-1 ring-black/50'
                : 'bg-white/98 border-[#e7e5e4] shadow-[0_8px_30px_rgba(0,0,0,0.18)] ring-1 ring-black/5'
            }`}
          >
            {[
              { id: 'overall' as TemporalFactor, label: 'OVERALL SCORE' },
              { id: 'environment' as TemporalFactor, label: 'ENVIRONMENTAL' },
              { id: 'accessibility' as TemporalFactor, label: 'ACCESSIBILITY' },
              { id: 'population' as TemporalFactor, label: 'POPULATION' },
              { id: 'urbanization' as TemporalFactor, label: 'URBAN BUILT-UP' },
            ].map((f) => {
              const isSelected = temporalFactor === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onTemporalFactorChange && onTemporalFactorChange(f.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide whitespace-nowrap transition-all shrink-0 ${
                    isSelected
                      ? isDarkMode
                        ? 'bg-[#2b241d] text-[#e5a93b] border border-[#e5a93b]/70 shadow-sm'
                        : 'bg-[#fef3c7] text-[#b45309] border border-[#f59e0b] shadow-sm'
                      : isDarkMode
                      ? 'text-[#d4cbbf] hover:text-white hover:bg-[#241f1a]'
                      : 'text-[#44403c] hover:text-[#1c1917] hover:bg-[#f5f5f4]'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : showPillFilters && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[200] max-w-[98%] pointer-events-auto">
          <div
            className={`flex items-center gap-1.5 backdrop-blur-md px-2 py-1.5 rounded-full border shadow-2xl transition-all ${
              isDarkMode
                ? 'bg-[#141210]/95 border-[#3d3328] shadow-[0_8px_30px_rgba(0,0,0,0.65)] ring-1 ring-black/50'
                : 'bg-white/98 border-[#e7e5e4] shadow-[0_8px_30px_rgba(0,0,0,0.18)] ring-1 ring-black/5'
            }`}
          >
            {/* 'All Land' Button */}
            <button
              type="button"
              onClick={() => handleSelectFilter('All')}
              className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide whitespace-nowrap transition-all shrink-0 ${
                activeFilter === 'All'
                  ? isDarkMode
                    ? 'bg-[#2b241d] text-[#e5a93b] border border-[#e5a93b]/70 shadow-sm'
                    : 'bg-[#fef3c7] text-[#b45309] border border-[#f59e0b] shadow-sm'
                  : isDarkMode
                  ? 'text-[#a89f91] hover:text-white hover:bg-[#241f1a]'
                  : 'text-[#78716c] hover:text-[#1c1917] hover:bg-[#f5f5f4]'
              }`}
            >
              All Land
            </button>

            {/* All 6 Options: Agriculture, Residential, Commercial, Government, Protected / Forest, Other */}
            {LAND_CATEGORIES.map((cat) => {
              const isSelected = activeFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelectFilter(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide whitespace-nowrap transition-all shrink-0 ${
                    isSelected
                      ? isDarkMode
                        ? 'bg-[#2b241d] text-[#e5a93b] border border-[#e5a93b]/70 shadow-sm'
                        : 'bg-[#fef3c7] text-[#b45309] border border-[#f59e0b] shadow-sm'
                      : isDarkMode
                      ? 'text-[#d4cbbf] hover:text-white hover:bg-[#241f1a]'
                      : 'text-[#44403c] hover:text-[#1c1917] hover:bg-[#f5f5f4]'
                  }`}
                >
                  <span>{cat.shortLabel}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-0.5 leading-none ${
                      isSelected
                        ? isDarkMode
                          ? 'bg-[#3d3224] text-[#e5a93b]'
                          : 'bg-[#fde68a] text-[#92400e]'
                        : isDarkMode
                        ? 'bg-[#241f1a] text-[#a89f91]'
                        : 'bg-[#f0ece9] text-[#78716c]'
                    }`}
                  >
                    {categoryCounts[cat.id] || 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Right: Map Attribution */}
      <div
        className={`absolute bottom-2 right-3 z-[100] text-[10px] tracking-tight px-2 py-0.5 rounded pointer-events-none border ${
          isDarkMode
            ? 'bg-[#121110]/70 text-[#736a5e] border-[#241e18]'
            : 'bg-white/80 text-[#a8a29e] border-[#e7e5e4]'
        }`}
      >
        {mapMode === 'satellite'
          ? '© Esri Satellite Imagery © Mappls GIS'
          : '© Esri Topographic Terrain © OpenStreetMap'}
      </div>
    </div>
  );
};
