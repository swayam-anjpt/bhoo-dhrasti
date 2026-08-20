import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  AuditLog,
  CandidateSiteScore,
  CitizenReport,
  DataQualityAudit,
  DistrictMetrics,
  InfrastructureAsset,
  InfrastructureGap,
  Language,
  Parcel,
  ParcelFilterType,
  SatelliteProject,
  SuitabilityWeights,
  User,
} from '../types';
import { JURISDICTION_STATES, TALUKA_CENTROIDS } from '../data/jurisdictionData';
import { AreaTemporalData, TemporalFactor, TemporalYear } from '../types/temporal';
import { AHMEDABAD_TEMPORAL_AREAS, AHMEDABAD_DISTRICT_TEMPORAL_SUMMARY } from '../data/temporalData';
import { DevelopmentTrendsModule } from './analytics/DevelopmentTrendsModule';
import { ExploreParcelsModule } from './parcels/ExploreParcelsModule';
import { GISMap } from './GISMap';
import {
  Layers,
  Sparkles,
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  FileText,
  Sliders,
  Send,
  Building,
  Activity,
  MapPin,
  TrendingUp,
  Award,
  ChevronRight,
  Download,
  Eye,
  Settings,
  ShieldCheck,
  Compass,
  X,
  Clock,
  Maximize2,
  Minimize2,
  HelpCircle,
  LogOut,
  Cpu,
  Coins,
  ShieldAlert,
  User as UserIcon,
  FolderGit2,
  Sun,
  Moon,
  ChevronDown,
  ChevronUp,
  Briefcase,
  SlidersHorizontal,
  Navigation,
} from 'lucide-react';

interface OfficialDashboardProps {
  currentUser: User | null;
  language: Language;
  districts: DistrictMetrics[];
  selectedDistrict: DistrictMetrics;
  onSelectDistrict: (district: DistrictMetrics) => void;
  parcels: Parcel[];
  selectedParcel: Parcel | null;
  onSelectParcel: (parcel: Parcel | null) => void;
  infrastructureAssets: InfrastructureAsset[];
  candidateSites: CandidateSiteScore[];
  selectedSite: CandidateSiteScore | null;
  onSelectSite: (site: CandidateSiteScore | null) => void;
  citizenReports: CitizenReport[];
  onUpdateReportStatus: (id: string, status: any) => void;
  infrastructureGaps: InfrastructureGap[];
  satelliteProjects: SatelliteProject[];
  dataQualityAudit: DataQualityAudit;
  auditLogs: AuditLog[];
  weights: SuitabilityWeights;
  onRecalculateSuitability: (newWeights: SuitabilityWeights, type?: string) => void;
  onOpenReportModal: (site?: CandidateSiteScore) => void;
  onAskGlisQuery: (q: string) => Promise<any>;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  onLogout?: () => void;
  onNavigate?: (view: string) => void;
}

type TabType = 'land' | 'infra' | 'sites' | 'analytics' | 'explore';

export const OfficialDashboard: React.FC<OfficialDashboardProps> = ({
  currentUser,
  language,
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
  onUpdateReportStatus,
  infrastructureGaps,
  satelliteProjects,
  dataQualityAudit,
  auditLogs,
  weights,
  onRecalculateSuitability,
  onOpenReportModal,
  onAskGlisQuery,
  isDarkMode = true,
  onToggleTheme,
  onLogout,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('land');
  const [parcelFilter, setParcelFilter] = useState<ParcelFilterType>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Profile Dropdown State
  const [profileOpen, setProfileOpen] = useState(false);
  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const [settingsExpanded, setSettingsExpanded] = useState(true);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Assigned Projects for the Officer
  const officerProjects = [
    {
      id: 'proj-1',
      name: 'Sanand Sub-District 100-Bed Hospital (Phase 2)',
      category: 'Hospital & Healthcare',
      taluka: 'Sanand',
      status: 'In Progress',
      progress: 68,
      budget: '₹14.5 Cr',
      priority: 'Critical',
    },
    {
      id: 'proj-2',
      name: 'Ahmedabad Smart Potable Water SCADA Network',
      category: 'Water & Utilities',
      taluka: 'Ahmedabad City',
      status: 'In Progress',
      progress: 82,
      budget: '₹28.0 Cr',
      priority: 'High',
    },
    {
      id: 'proj-3',
      name: 'Dholera Model High School',
      category: 'Education',
      taluka: 'Dholera',
      status: 'Tendering',
      progress: 25,
      budget: '₹9.8 Cr',
      priority: 'High',
    },
    {
      id: 'proj-4',
      name: 'Viramgam-Mandal Rural Feeder Highway (PMGSY-IV)',
      category: 'Roads',
      taluka: 'Viramgam',
      status: 'In Progress',
      progress: 45,
      budget: '₹36.2 Cr',
      priority: 'High',
    },
    {
      id: 'proj-5',
      name: 'Sanjeli Solar Powered Agro Cold Storage Facility',
      category: 'Agriculture',
      taluka: 'Sanjeli',
      status: 'Under Review',
      progress: 15,
      budget: '₹7.4 Cr',
      priority: 'Medium',
    },
    {
      id: 'proj-6',
      name: 'Sabarmati East Multi-Modal Drone Cadastre Hub',
      category: 'Geospatial',
      taluka: 'Sabarmati',
      status: 'In Progress',
      progress: 90,
      budget: '₹52.0 Cr',
      priority: 'Critical',
    },
  ];

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileOpen]);

  // AI Assistant State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  // Local Suitability Sliders
  const [localWeights, setLocalWeights] = useState<SuitabilityWeights>(weights);
  const [targetInfra, setTargetInfra] = useState<string>(selectedDistrict.primaryRecommendedInfrastructure || 'Hospital');

  // Site Management Feature Set State
  const [shortlistedSiteIds, setShortlistedSiteIds] = useState<string[]>(['site-18', 'site-31']);
  const [showScenarioMode, setShowScenarioMode] = useState<boolean>(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState<boolean>(false);
  const [compareModalOpen, setCompareModalOpen] = useState<boolean>(false);
  const [createProjectModalOpen, setCreateProjectModalOpen] = useState<boolean>(false);
  const [createdProjectToast, setCreatedProjectToast] = useState<string | null>(null);
  const [filterMinArea, setFilterMinArea] = useState<number>(0);
  const [filterMaxCostCr, setFilterMaxCostCr] = useState<number>(50);
  const [projectNameInput, setProjectNameInput] = useState<string>('');
  const [projectBudgetInput, setProjectBudgetInput] = useState<string>('');

  const toggleShortlistSite = (siteId: string) => {
    setShortlistedSiteIds((prev) =>
      prev.includes(siteId) ? prev.filter((id) => id !== siteId) : [...prev, siteId]
    );
  };

  const handleCreateProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateProjectModalOpen(false);
    const activeSite = selectedSite || candidateSites[0];
    const pName = projectNameInput || (activeSite ? `${activeSite.proposedType} Development (${activeSite.district})` : 'New Infrastructure Project');
    setCreatedProjectToast(`Project "${pName}" successfully created and added to planning pipeline.`);
    setProjectNameInput('');
    setProjectBudgetInput('');
    setTimeout(() => setCreatedProjectToast(null), 4000);
  };

  // Multi-Tiered Jurisdiction Hierarchy Selection State: State -> District -> City
  const [selectedStateName, setSelectedStateName] = useState<string>(selectedDistrict.state || 'Gujarat');
  const [selectedCityName, setSelectedCityName] = useState<string>('All');
  const [flyToLocationTarget, setFlyToLocationTarget] = useState<{ lat: number; lng: number; zoom?: number; timestamp: number } | null>(null);

  // Sync selected state when selectedDistrict prop changes
  useEffect(() => {
    if (selectedDistrict?.state && selectedDistrict.state !== selectedStateName) {
      setSelectedStateName(selectedDistrict.state);
    }
  }, [selectedDistrict]);

  // Available lists for the cascading dropdowns
  const availableStates = useMemo(() => JURISDICTION_STATES, []);

  const availableDistricts = useMemo(() => {
    const list = districts.filter((d) => d.state.toLowerCase() === selectedStateName.toLowerCase());
    return list.length > 0 ? list : districts;
  }, [districts, selectedStateName]);

  const availableCities = useMemo(() => {
    const foundState = JURISDICTION_STATES.find((s) => s.name.toLowerCase() === selectedStateName.toLowerCase());
    if (!foundState) return [];
    const foundDist = foundState.districts.find(
      (d) => d.name.toLowerCase() === selectedDistrict.name.toLowerCase() || d.id === selectedDistrict.id
    );
    return foundDist ? foundDist.talukas : [];
  }, [selectedStateName, selectedDistrict]);

  // Handler for State Selection
  const handleSelectState = (stateName: string) => {
    setSelectedStateName(stateName);
    setSelectedCityName('All');
    const matchedDistricts = districts.filter((d) => d.state.toLowerCase() === stateName.toLowerCase());
    if (matchedDistricts.length > 0) {
      const firstDist = matchedDistricts[0];
      onSelectDistrict(firstDist);
      setFlyToLocationTarget({
        lat: firstDist.centerLat,
        lng: firstDist.centerLng,
        zoom: firstDist.zoomLevel,
        timestamp: Date.now(),
      });
    }
  };

  // Handler for District Selection
  const handleSelectDistrictChange = (districtId: string) => {
    const d = districts.find((dist) => dist.id === districtId);
    if (d) {
      if (d.state && d.state !== selectedStateName) {
        setSelectedStateName(d.state);
      }
      setSelectedCityName('All');
      onSelectDistrict(d);
      setFlyToLocationTarget({
        lat: d.centerLat,
        lng: d.centerLng,
        zoom: d.zoomLevel,
        timestamp: Date.now(),
      });
    }
  };

  // Handler for City / Taluka Selection
  const handleSelectCityChange = (cityName: string) => {
    setSelectedCityName(cityName);
    if (cityName === 'All') {
      if (selectedDistrict) {
        setFlyToLocationTarget({
          lat: selectedDistrict.centerLat,
          lng: selectedDistrict.centerLng,
          zoom: selectedDistrict.zoomLevel,
          timestamp: Date.now(),
        });
      }
    } else {
      const knownCentroid = TALUKA_CENTROIDS[cityName];
      if (knownCentroid) {
        setFlyToLocationTarget({
          lat: knownCentroid[0],
          lng: knownCentroid[1],
          zoom: 15,
          timestamp: Date.now(),
        });
      } else {
        const cityParcels = parcels.filter(
          (p) =>
            (p.taluka && p.taluka.toLowerCase() === cityName.toLowerCase()) ||
            (p.village && p.village.toLowerCase() === cityName.toLowerCase()) ||
            (p.city && p.city.toLowerCase() === cityName.toLowerCase())
        );
        if (cityParcels.length > 0) {
          const avgLat = cityParcels.reduce((sum, p) => sum + p.centerLat, 0) / cityParcels.length;
          const avgLng = cityParcels.reduce((sum, p) => sum + p.centerLng, 0) / cityParcels.length;
          setFlyToLocationTarget({
            lat: avgLat,
            lng: avgLng,
            zoom: 15,
            timestamp: Date.now(),
          });
        }
      }
    }
  };

  // Hierarchically Filtered Parcels (State -> District -> City / Taluka)
  const hierarchicalParcels = useMemo(() => {
    return parcels.filter((p) => {
      // 1. State check
      if (selectedStateName && selectedStateName !== 'All') {
        const pState = p.state || districts.find((d) => d.name.toLowerCase() === p.district.toLowerCase())?.state;
        if (pState && pState.toLowerCase() !== selectedStateName.toLowerCase()) {
          return false;
        }
      }
      // 2. District check
      if (selectedDistrict && selectedDistrict.name !== 'All') {
        if (p.district.toLowerCase() !== selectedDistrict.name.toLowerCase()) {
          return false;
        }
      }
      // 3. City / Taluka check
      if (selectedCityName && selectedCityName !== 'All') {
        const matchCity =
          (p.taluka && p.taluka.toLowerCase() === selectedCityName.toLowerCase()) ||
          (p.village && p.village.toLowerCase() === selectedCityName.toLowerCase()) ||
          (p.city && p.city.toLowerCase() === selectedCityName.toLowerCase());
        if (!matchCity) {
          return false;
        }
      }
      return true;
    });
  }, [parcels, selectedStateName, selectedDistrict, selectedCityName, districts]);

  // Map Navigation & Fly-To State
  const [flyToTarget, setFlyToTarget] = useState<{ parcel: Parcel; timestamp: number } | null>(null);
  const [isLocatingParcel, setIsLocatingParcel] = useState(false);

  const handleLocateParcelOnMap = async (parcel: Parcel) => {
    setIsLocatingParcel(true);
    setFlyToTarget({ parcel, timestamp: Date.now() });

    try {
      // Backend spatial sync call
      await fetch(`/api/parcels/locate/${parcel.id}`);
    } catch {
      // Graceful fallback to client-side spatial routing
    } finally {
      setTimeout(() => setIsLocatingParcel(false), 1200);
    }
  };

  useEffect(() => {
    setLocalWeights(weights);
  }, [weights]);

  // Compute Parcel Metrics for Right Sidebar using Hierarchical Parcels
  const totalParcelsCount = hierarchicalParcels.length;
  const verifiedCount = useMemo(
    () => hierarchicalParcels.filter((p) => p.verificationStatus === 'Verified').length,
    [hierarchicalParcels]
  );
  const pendingCount = useMemo(
    () => hierarchicalParcels.filter((p) => p.verificationStatus === 'Pending').length,
    [hierarchicalParcels]
  );
  const disputedCount = useMemo(
    () => hierarchicalParcels.filter((p) => p.verificationStatus === 'Disputed').length,
    [hierarchicalParcels]
  );

  // Land Use Split (5 Options + Other)
  const agriculturalCount = useMemo(
    () => hierarchicalParcels.filter((p) => p.landUse === 'Agriculture' || p.zoneType === 'Agricultural').length,
    [hierarchicalParcels]
  );
  const residentialCount = useMemo(
    () => hierarchicalParcels.filter((p) => p.landUse === 'Residential' || p.zoneType === 'Residential').length,
    [hierarchicalParcels]
  );
  const commercialCount = useMemo(
    () => hierarchicalParcels.filter((p) => p.landUse === 'Commercial' || p.zoneType === 'Commercial').length,
    [hierarchicalParcels]
  );
  const governmentCount = useMemo(
    () => hierarchicalParcels.filter((p) => p.landUse === 'Government' || p.ownership === 'Government Revenue Land').length,
    [hierarchicalParcels]
  );
  const protectedCount = useMemo(
    () => hierarchicalParcels.filter((p) => p.landUse === 'Protected' || p.ownership === 'Forest Dept' || p.zoneType === 'Protected').length,
    [hierarchicalParcels]
  );
  const otherCount = useMemo(
    () => hierarchicalParcels.filter((p) => p.landUse === 'Other' || p.landUse === 'Industrial' || p.landUse === 'Water Body').length,
    [hierarchicalParcels]
  );

  // Active Filtered Subset for Category-Specific Drilldown
  const activeFilteredParcels = useMemo(() => {
    if (parcelFilter === 'All') return hierarchicalParcels;
    if (parcelFilter === 'Agriculture') return hierarchicalParcels.filter((p) => p.landUse === 'Agriculture' || p.zoneType === 'Agricultural');
    if (parcelFilter === 'Residential') return hierarchicalParcels.filter((p) => p.landUse === 'Residential' || p.zoneType === 'Residential');
    if (parcelFilter === 'Commercial') return hierarchicalParcels.filter((p) => p.landUse === 'Commercial' || p.zoneType === 'Commercial');
    if (parcelFilter === 'Government') return hierarchicalParcels.filter((p) => p.landUse === 'Government' || p.ownership === 'Government Revenue Land');
    if (parcelFilter === 'Protected') return hierarchicalParcels.filter((p) => p.landUse === 'Protected' || p.ownership === 'Forest Dept' || p.zoneType === 'Protected');
    if (parcelFilter === 'Other') return hierarchicalParcels.filter((p) => p.landUse === 'Other' || p.landUse === 'Industrial' || p.landUse === 'Water Body');
    return hierarchicalParcels;
  }, [hierarchicalParcels, parcelFilter]);

  const activeCategoryCount = activeFilteredParcels.length;
  const activeVerifiedCount = useMemo(
    () => activeFilteredParcels.filter((p) => p.verificationStatus === 'Verified').length,
    [activeFilteredParcels]
  );
  const activePendingCount = useMemo(
    () => activeFilteredParcels.filter((p) => p.verificationStatus === 'Pending').length,
    [activeFilteredParcels]
  );
  const activeDisputedCount = useMemo(
    () => activeFilteredParcels.filter((p) => p.verificationStatus === 'Disputed').length,
    [activeFilteredParcels]
  );

  const activeTotalAcres = useMemo(
    () => Number(activeFilteredParcels.reduce((sum, p) => sum + (p.areaAcres || 0), 0).toFixed(1)),
    [activeFilteredParcels]
  );

  // Quality score: for All Land it's 69% (as shown in standard design), for specific category dynamically calculated
  const activeQualityScore = useMemo(() => {
    if (parcelFilter === 'All') return 69;
    if (activeCategoryCount === 0) return 0;
    return Math.min(100, Math.max(0, Math.round(((activeVerifiedCount * 1.0 + activePendingCount * 0.4) / activeCategoryCount) * 100)));
  }, [parcelFilter, activeCategoryCount, activeVerifiedCount, activePendingCount]);

  // Category specific taluka breakdown
  const categoryTalukaBreakdown = useMemo(() => {
    const map: Record<string, { count: number; acres: number }> = {};
    activeFilteredParcels.forEach((p) => {
      const taluka = p.taluka || selectedDistrict.name;
      if (!map[taluka]) map[taluka] = { count: 0, acres: 0 };
      map[taluka].count += 1;
      map[taluka].acres += (p.areaAcres || 0);
    });
    return Object.entries(map).sort((a, b) => b[1].count - a[1].count);
  }, [activeFilteredParcels, selectedDistrict.name]);

  // Recently updated parcels (reactive to active filter)
  const recentlyUpdatedParcels = useMemo(() => {
    return [...activeFilteredParcels].slice(0, 5);
  }, [activeFilteredParcels]);

  // Find Development Land State
  const [selectedInfraType, setSelectedInfraType] = useState<string>('Roads');
  const [requiredAreaInput, setRequiredAreaInput] = useState<number | string>(10);
  const [hoveredZoneCategory, setHoveredZoneCategory] = useState<string | null>(null);
  const [showBestAvailableLand, setShowBestAvailableLand] = useState<boolean>(false);

  const INFRA_TYPES = [
    'Roads',
    'Bridges',
    'Airports',
    'Power plants',
    'Hospital',
    'School',
    'Railway station',
  ] as const;

  // Best Available Land evaluated
  const bestAvailableLand = useMemo(() => {
    const numArea = Math.max(0.1, Number(requiredAreaInput) || 5);
    const pool = parcels.filter((p) => p.restrictionLevel !== 'Protected / Restricted');
    
    const scored = pool.map((p) => {
      let score = 70;
      const areaRatio = p.areaAcres >= numArea ? 1 : p.areaAcres / numArea;
      score += areaRatio * 15;

      if (p.ownership === 'Government Revenue Land') score += 12;
      else if (p.currentStatus === 'Vacant') score += 6;

      if (p.verificationStatus === 'Verified') score += 8;
      else if (p.verificationStatus === 'Disputed') score -= 20;

      if (p.floodRiskLevel === 'Low') score += 5;
      else if (p.floodRiskLevel === 'High') score -= 18;

      if (p.slopePercent <= 3) score += 5;
      else if (p.slopePercent > 8) score -= 12;

      const infra = selectedInfraType.toLowerCase();
      if (infra.includes('road')) {
        score += Math.max(0, 15 - p.distanceToMajorRoadKm * 3);
      } else if (infra.includes('bridge')) {
        if (p.distanceToWaterSupplyKm <= 2.5) score += 15;
      } else if (infra.includes('airport')) {
        if (p.areaAcres >= 15 && p.slopePercent <= 2.5) score += 20;
        else if (p.areaAcres < numArea) score -= 15;
      } else if (infra.includes('power')) {
        score += Math.max(0, 15 - p.distanceToPowerGridKm * 4);
      } else if (infra.includes('hospital')) {
        score += Math.max(0, 15 - p.distanceToMajorRoadKm * 5);
        if (p.floodRiskLevel === 'Low') score += 5;
      } else if (infra.includes('school')) {
        score += Math.max(0, 15 - p.distanceToMajorRoadKm * 4);
        if (p.verificationStatus === 'Verified') score += 5;
      } else if (infra.includes('railway')) {
        score += Math.max(0, 12 - p.distanceToMajorRoadKm * 3);
        if (p.areaAcres >= numArea) score += 8;
      }

      return {
        ...p,
        suitabilityScore: Math.min(100, Math.max(10, Math.round(score))),
      };
    });

    scored.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
    return scored.slice(0, 3);
  }, [parcels, selectedInfraType, requiredAreaInput]);

  // 5-Year Temporal Spatial Analytics State
  const [temporalYear, setTemporalYear] = useState<TemporalYear>(2026);
  const [temporalFactor, setTemporalFactor] = useState<TemporalFactor>('overall');
  const [selectedTemporalArea, setSelectedTemporalArea] = useState<AreaTemporalData | null>(null);

  // Direct AI query execution helper for Spatial AI Copilot and Temporal Suggestions
  const handleDirectAiQuery = async (queryText: string) => {
    if (!queryText.trim()) return;
    setAiPrompt(queryText);
    setAiLoading(true);
    setAiResponse(null);
    try {
      const res = await onAskGlisQuery(queryText);
      if (res && res.answer) {
        setAiResponse(res.answer);
      } else {
        setAiResponse(`Spatial Analysis Result: 5-Year Temporal analysis (2022-2026) shows marked progress in Ahmedabad District. Road connectivity reached 93.4% and healthcare access improved by +57.1%. Priority infrastructure interventions remain concentrated in Dholera (#7) and Viramgam (#5) industrial corridors.`);
      }
    } catch {
      setAiResponse(`Spatial Analysis Result: 5-Year Temporal analytics indicate significant expansion across rural talukas. Priority recommendations for ${selectedDistrict.primaryRecommendedInfrastructure} confirmed.`);
    } finally {
      setAiLoading(false);
    }
  };

  // Handle Ask GLIS query
  const handleSendAiQuery = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiPrompt.trim()) return;
    await handleDirectAiQuery(aiPrompt);
  };

  return (
    <div className={`flex flex-col h-screen w-screen overflow-hidden font-sans select-none transition-colors duration-200 ${
      isDarkMode ? 'bg-[#100e0c] text-[#f4ede4]' : 'bg-[#f8f6f2] text-[#1c1917]'
    }`}>
      {/* Top Header with high z-index to overlay above map and controls */}
      <header className={`h-12 border-b flex items-center justify-between px-6 relative z-[1000] shrink-0 transition-colors ${
        isDarkMode
          ? 'bg-[#161412] border-[#2e2720]'
          : 'bg-white border-[#e7e5e4] shadow-sm'
      }`}>
        {/* Left: Devanagari Brand Title */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <span className={`font-serif text-xl font-bold tracking-wide drop-shadow-sm ${
              isDarkMode ? 'text-white' : 'text-[#1c1917]'
            }`}>
              भू दृष्टि
            </span>
          </div>

          {/* Navigation Tabs with Golden Underline */}
          <nav className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setActiveTab('land')}
              className={`relative py-3.5 text-xs font-bold tracking-wider uppercase transition-colors ${
                activeTab === 'land'
                  ? isDarkMode ? 'text-white' : 'text-[#1c1917]'
                  : isDarkMode ? 'text-[#9c9489] hover:text-[#f4ede4]' : 'text-[#78716c] hover:text-[#1c1917]'
              }`}
            >
              LAND OVERVIEW
              {activeTab === 'land' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#e5a93b] rounded-t-full shadow-[0_0_8px_rgba(229,169,59,0.8)]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('infra')}
              className={`relative py-3.5 text-xs font-bold tracking-wider uppercase transition-colors ${
                activeTab === 'infra'
                  ? isDarkMode ? 'text-white' : 'text-[#1c1917]'
                  : isDarkMode ? 'text-[#9c9489] hover:text-[#f4ede4]' : 'text-[#78716c] hover:text-[#1c1917]'
              }`}
            >
              INFRASTRUCTURE MONITORING
              {activeTab === 'infra' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#e5a93b] rounded-t-full shadow-[0_0_8px_rgba(229,169,59,0.8)]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('sites')}
              className={`relative py-3.5 text-xs font-bold tracking-wider uppercase transition-colors ${
                activeTab === 'sites'
                  ? isDarkMode ? 'text-white' : 'text-[#1c1917]'
                  : isDarkMode ? 'text-[#9c9489] hover:text-[#f4ede4]' : 'text-[#78716c] hover:text-[#1c1917]'
              }`}
            >
              SITE MANAGEMENT
              {activeTab === 'sites' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#e5a93b] rounded-t-full shadow-[0_0_8px_rgba(229,169,59,0.8)]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`relative py-3.5 text-xs font-bold tracking-wider uppercase transition-colors ${
                activeTab === 'analytics'
                  ? isDarkMode ? 'text-white' : 'text-[#1c1917]'
                  : isDarkMode ? 'text-[#9c9489] hover:text-[#f4ede4]' : 'text-[#78716c] hover:text-[#1c1917]'
              }`}
            >
              ANALYTICS
              {activeTab === 'analytics' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#e5a93b] rounded-t-full shadow-[0_0_8px_rgba(229,169,59,0.8)]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('explore')}
              className={`relative py-3.5 text-xs font-bold tracking-wider uppercase transition-colors flex items-center gap-1.5 ${
                activeTab === 'explore'
                  ? isDarkMode ? 'text-white' : 'text-[#1c1917]'
                  : isDarkMode ? 'text-[#9c9489] hover:text-[#f4ede4]' : 'text-[#78716c] hover:text-[#1c1917]'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#e5a93b]" />
              <span>EXPLORE PARCELS</span>
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 font-mono text-[9px] font-bold">
                NEW
              </span>
              {activeTab === 'explore' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#e5a93b] rounded-t-full shadow-[0_0_8px_rgba(229,169,59,0.8)]" />
              )}
            </button>
          </nav>
        </div>

        {/* Right: Profile Toggle & Menu */}
        <div className="relative z-[1000]" ref={profileMenuRef}>
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all shadow-md text-xs font-semibold ${
              profileOpen
                ? isDarkMode
                  ? 'bg-[#2b241d] border-[#e5a93b] text-[#e5a93b] ring-1 ring-[#e5a93b]/40'
                  : 'bg-[#fef3c7] border-[#d97706] text-[#b45309] ring-1 ring-[#d97706]/40'
                : isDarkMode
                ? 'bg-[#1c1916] hover:bg-[#282420] border-[#3d3328] text-[#f4ede4] hover:text-white'
                : 'bg-white hover:bg-[#f5f5f4] border-[#e7e5e4] text-[#1c1917]'
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-[#e5a93b]/20 text-[#e5a93b] flex items-center justify-center font-bold text-[10px] border border-[#e5a93b]/50">
              {currentUser?.name ? currentUser.name.charAt(0) : 'R'}
            </div>
            <span>Profile</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${profileOpen ? 'rotate-180 text-[#e5a93b]' : isDarkMode ? 'text-[#a89f91]' : 'text-[#78716c]'}`} />
          </button>

          {/* Profile Dropdown Menu */}
          {profileOpen && (
            <div className={`absolute right-0 top-11 w-96 max-h-[85vh] overflow-y-auto border rounded-xl shadow-2xl z-[10000] p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-150 custom-scrollbar ring-1 ${
              isDarkMode
                ? 'bg-[#181512] border-[#3d3328] text-[#d4cbbf] ring-black/40'
                : 'bg-white border-[#e7e5e4] text-[#44403c] ring-black/10'
            }`}>
              {/* 1. Officer Profile Header */}
              <div className={`flex items-start gap-3 pb-3 border-b ${
                isDarkMode ? 'border-[#2e2720]' : 'border-[#e7e5e4]'
              }`}>
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#e5a93b]/30 to-[#e5a93b]/10 text-[#e5a93b] flex items-center justify-center font-bold text-base border border-[#e5a93b]/60 shrink-0 shadow-inner">
                  {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'RS'}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className={`font-bold text-sm truncate ${isDarkMode ? 'text-white' : 'text-[#1c1917]'}`}>
                      {currentUser?.name || 'Dr. Rajeshwar Sharma, IAS'}
                    </h3>
                    <ShieldCheck className="w-4 h-4 text-[#e5a93b] shrink-0" />
                  </div>

                  {/* Designation */}
                  <div className="text-xs font-semibold text-[#e5a93b] mt-0.5 truncate">
                    {currentUser?.designation || 'District Development Officer (DDO)'}
                  </div>

                  {/* Department */}
                  <div className={`text-[11px] mt-0.5 leading-snug ${isDarkMode ? 'text-[#a89f91]' : 'text-[#78716c]'}`}>
                    {currentUser?.department || 'Urban Development & Infrastructure Board'}
                  </div>

                  {/* Jurisdiction & Cadre Badge */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded border ${
                      isDarkMode
                        ? 'bg-[#241f1a] text-[#c7bcaf] border-[#3d3328]'
                        : 'bg-[#f5f5f4] text-[#44403c] border-[#e7e5e4]'
                    }`}>
                      {currentUser?.jurisdiction || 'Ahmedabad & Suburban Industrial Belt'}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#064e3b]/80 text-[#6ee7b7] border border-[#047857]/60 font-semibold">
                      Cadre 2014
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Officer Assigned Projects Toggle Section */}
              <div className={`rounded-lg border overflow-hidden ${
                isDarkMode ? 'bg-[#141210] border-[#2a241e]' : 'bg-[#fafaf9] border-[#e7e5e4]'
              }`}>
                <button
                  type="button"
                  onClick={() => setProjectsExpanded(!projectsExpanded)}
                  className={`w-full flex items-center justify-between p-3 transition-colors text-left ${
                    isDarkMode ? 'hover:bg-[#1d1916]' : 'hover:bg-[#f5f5f4]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-[#e5a93b]" />
                    <span className={`text-xs font-bold tracking-wide ${isDarkMode ? 'text-white' : 'text-[#1c1917]'}`}>
                      Assigned Projects
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#e5a93b]/20 text-[#e5a93b] font-bold border border-[#e5a93b]/40">
                      {officerProjects.length} Active
                    </span>
                  </div>
                  {projectsExpanded ? (
                    <ChevronUp className={`w-4 h-4 ${isDarkMode ? 'text-[#8e8577]' : 'text-[#a8a29e]'}`} />
                  ) : (
                    <ChevronDown className={`w-4 h-4 ${isDarkMode ? 'text-[#8e8577]' : 'text-[#a8a29e]'}`} />
                  )}
                </button>

                {projectsExpanded && (
                  <div className="p-3 pt-0 space-y-2.5 max-h-56 overflow-y-auto custom-scrollbar">
                    {officerProjects.map((proj) => (
                      <div
                        key={proj.id}
                        className={`p-2.5 rounded border transition-colors space-y-1.5 ${
                          isDarkMode
                            ? 'bg-[#1c1916] border-[#332b22] hover:border-[#4d3d2c]'
                            : 'bg-white border-[#e7e5e4] hover:border-[#d6d3d1] shadow-sm'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className={`font-semibold text-xs leading-tight ${isDarkMode ? 'text-white' : 'text-[#1c1917]'}`}>
                            {proj.name}
                          </div>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0 ${
                              proj.status === 'In Progress'
                                ? 'bg-[#064e3b] text-[#6ee7b7] border border-[#047857]'
                                : proj.status === 'Tendering'
                                ? 'bg-[#1e3a8a] text-[#93c5fd] border border-[#1d4ed8]'
                                : 'bg-[#78350f] text-[#fcd34d] border border-[#b45309]'
                            }`}
                          >
                            {proj.status}
                          </span>
                        </div>

                        <div className={`flex items-center justify-between text-[10px] ${isDarkMode ? 'text-[#8e8577]' : 'text-[#78716c]'}`}>
                          <span>Taluka: <b className={isDarkMode ? 'text-[#d4cbbf]' : 'text-[#1c1917]'}>{proj.taluka}</b></span>
                          <span>Budget: <b className="text-[#e5a93b]">{proj.budget}</b></span>
                        </div>

                        {/* Progress bar */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className={isDarkMode ? 'text-[#8e8577]' : 'text-[#78716c]'}>Progress</span>
                            <span className={`font-mono font-bold ${isDarkMode ? 'text-[#f4ede4]' : 'text-[#1c1917]'}`}>{proj.progress}%</span>
                          </div>
                          <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-[#26201a]' : 'bg-[#e7e5e4]'}`}>
                            <div
                              className="h-full bg-gradient-to-r from-[#e5a93b] to-[#fbbf24] rounded-full transition-all"
                              style={{ width: `${proj.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Settings Toggle Section with Light & Dark Mode */}
              <div className={`rounded-lg border overflow-hidden ${
                isDarkMode ? 'bg-[#141210] border-[#2a241e]' : 'bg-[#fafaf9] border-[#e7e5e4]'
              }`}>
                <button
                  type="button"
                  onClick={() => setSettingsExpanded(!settingsExpanded)}
                  className={`w-full flex items-center justify-between p-3 transition-colors text-left ${
                    isDarkMode ? 'hover:bg-[#1d1916]' : 'hover:bg-[#f5f5f4]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-[#e5a93b]" />
                    <span className={`text-xs font-bold tracking-wide ${isDarkMode ? 'text-white' : 'text-[#1c1917]'}`}>
                      System & Display Settings
                    </span>
                  </div>
                  {settingsExpanded ? (
                    <ChevronUp className={`w-4 h-4 ${isDarkMode ? 'text-[#8e8577]' : 'text-[#a8a29e]'}`} />
                  ) : (
                    <ChevronDown className={`w-4 h-4 ${isDarkMode ? 'text-[#8e8577]' : 'text-[#a8a29e]'}`} />
                  )}
                </button>

                {settingsExpanded && (
                  <div className="p-3 pt-0 space-y-3">
                    {/* Theme Switcher: Light vs Dark Mode */}
                    <div className="space-y-1.5">
                      <label className={`text-[11px] font-semibold block ${isDarkMode ? 'text-[#8e8577]' : 'text-[#78716c]'}`}>
                        Appearance & Theme Mode
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {/* Light Mode Button */}
                        <button
                          type="button"
                          onClick={() => {
                            if (isDarkMode && onToggleTheme) onToggleTheme();
                          }}
                          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all border ${
                            !isDarkMode
                              ? 'bg-[#e5a93b] text-[#1a1613] border-[#e5a93b] shadow-md ring-2 ring-[#e5a93b]/40'
                              : 'bg-[#1c1916] text-[#a89f91] border-[#332b22] hover:text-white hover:bg-[#26211c]'
                          }`}
                        >
                          <Sun className="w-3.5 h-3.5" />
                          <span>Light Mode</span>
                        </button>

                        {/* Dark Mode Button */}
                        <button
                          type="button"
                          onClick={() => {
                            if (!isDarkMode && onToggleTheme) onToggleTheme();
                          }}
                          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all border ${
                            isDarkMode
                              ? 'bg-[#2b241d] text-[#e5a93b] border-[#e5a93b]/70 shadow-sm ring-2 ring-[#e5a93b]/40'
                              : 'bg-white text-[#78716c] border-[#e7e5e4] hover:text-[#1c1917] hover:bg-[#f5f5f4]'
                          }`}
                        >
                          <Moon className="w-3.5 h-3.5" />
                          <span>Dark Mode</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Log Out Option */}
              <div className={`pt-2 border-t ${isDarkMode ? 'border-[#2e2720]' : 'border-[#e7e5e4]'}`}>
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    if (onLogout) onLogout();
                    else if (onNavigate) onNavigate('home');
                  }}
                  className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-xs font-bold transition-all shadow-sm group ${
                    isDarkMode
                      ? 'bg-[#241a18] hover:bg-[#381d1a] text-[#f87171] border border-[#4d2522] hover:border-[#ef4444]'
                      : 'bg-[#fef2f2] hover:bg-[#fee2e2] text-[#dc2626] border border-[#fecaca] hover:border-[#f87171]'
                  }`}
                >
                  <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Workspace: Central Map + Right Analytics Sidebar or Explore Parcels Module */}
      <div className="flex-1 flex overflow-hidden relative">
        {activeTab === 'explore' ? (
          <ExploreParcelsModule
            isDarkMode={isDarkMode}
            onLocateOnMap={(unutilizedParcel) => {
              const foundMatch = parcels.find(
                (p) =>
                  p.khasraNo === unutilizedParcel.khasraNo ||
                  p.id === unutilizedParcel.id ||
                  p.parcelNumber === unutilizedParcel.ulpin
              );
              if (foundMatch) {
                onSelectParcel(foundMatch);
                setActiveTab('land');
                handleLocateParcelOnMap(foundMatch);
              } else {
                const syntheticParcel: Parcel = {
                  id: unutilizedParcel.id,
                  parcelNumber: unutilizedParcel.ulpin,
                  khasraNo: unutilizedParcel.khasraNo,
                  ownerName: `${unutilizedParcel.custodianMinistry} (${unutilizedParcel.tenureClassification})`,
                  areaAcres: unutilizedParcel.totalAreaAcres,
                  landUse: 'Government',
                  ownership: 'Government Revenue Land',
                  currentStatus: 'Vacant',
                  suitabilityScore: 88,
                  restrictionLevel: 'Unrestricted',
                  slopePercent: unutilizedParcel.slopePercent,
                  distanceToMajorRoadKm: 0.5,
                  distanceToPowerGridKm: 0.8,
                  distanceToWaterSupplyKm: 1.2,
                  estimatedLandCostPerAcreLakhs: unutilizedParcel.circleRateNum / 1000,
                  floodRiskLevel: unutilizedParcel.floodPlainRisk === 'LOW RISK' ? 'Low' : unutilizedParcel.floodPlainRisk === 'MODERATE RISK' ? 'Moderate' : 'High',
                  environmentalSensitivity: 'Low',
                  coordinates: unutilizedParcel.cadastrePoints,
                  centerLat: unutilizedParcel.centroidLat,
                  centerLng: unutilizedParcel.centroidLng,
                  district: unutilizedParcel.district,
                  taluka: unutilizedParcel.taluka,
                  village: unutilizedParcel.village,
                  verificationStatus: 'Verified',
                  zoneType: 'Commercial',
                };
                onSelectParcel(syntheticParcel);
                setActiveTab('land');
                setFlyToLocationTarget({
                  lat: unutilizedParcel.centroidLat,
                  lng: unutilizedParcel.centroidLng,
                  zoom: 17,
                  timestamp: Date.now(),
                });
                handleLocateParcelOnMap(syntheticParcel);
              }
            }}
          />
        ) : (
          <>
            {/* Central GIS Tactical Map: 40% on Site Management, 45% on Analytics, flex-1 elsewhere */}
            <main className={`relative h-full transition-all duration-300 ${
              activeTab === 'sites' ? 'w-[40%] shrink-0' : activeTab === 'analytics' ? 'w-[45%] shrink-0' : 'flex-1'
            }`}>
          <GISMap
            districts={districts}
            selectedDistrict={selectedDistrict}
            onSelectDistrict={onSelectDistrict}
            parcels={hierarchicalParcels}
            selectedParcel={selectedParcel}
            onSelectParcel={onSelectParcel}
            infrastructureAssets={infrastructureAssets}
            candidateSites={candidateSites}
            selectedSite={selectedSite}
            onSelectSite={onSelectSite}
            citizenReports={citizenReports}
            satelliteProjects={satelliteProjects}
            isDarkMode={isDarkMode}
            parcelFilter={parcelFilter}
            onFilterChange={setParcelFilter}
            showPillFilters={activeTab === 'land'}
            flyToParcelTarget={flyToTarget}
            flyToLocationTarget={flyToLocationTarget}
            isTemporalMode={activeTab === 'analytics'}
            temporalYear={temporalYear}
            temporalFactor={temporalFactor}
            temporalAreas={AHMEDABAD_TEMPORAL_AREAS}
            selectedTemporalArea={selectedTemporalArea}
            onSelectTemporalArea={(area) => {
              setSelectedTemporalArea(area);
              if (area) {
                setFlyToLocationTarget({
                  lat: area.centerLat,
                  lng: area.centerLng,
                  zoom: 13,
                  timestamp: Date.now(),
                });
              }
            }}
            onTemporalFactorChange={setTemporalFactor}
          />
        </main>

        {/* Right Floating Analytics & Metrics Sidebar: 60% on Site Management, 55% on Analytics, w-80 elsewhere */}
        <aside className={`border-l flex flex-col p-4 overflow-y-auto z-20 shrink-0 gap-3 transition-all duration-300 ${
          activeTab === 'sites' ? 'w-[60%] flex-none' : activeTab === 'analytics' ? 'w-[55%] flex-none' : 'w-80'
        } ${
          isDarkMode
            ? 'bg-[#141210] border-[#2a241e]'
            : 'bg-white border-[#e7e5e4] shadow-sm'
        }`}>
          {activeTab === 'land' && (
            <>
              {parcelFilter === 'All' ? (
                /* Monochromatic All Land Overview - Exact specifications from diagram */
                <div className="flex flex-col gap-3">
                  {/* Land Overview Header & Total Parcels Card */}
                  <div className={`rounded-lg p-3.5 border transition-all ${
                    isDarkMode ? 'bg-[#181512] border-[#2e2720]' : 'bg-[#fafaf9] border-[#e7e5e4]'
                  }`}>
                    <div className={`text-xs font-bold tracking-wide uppercase mb-2.5 pb-1.5 border-b ${
                      isDarkMode ? 'text-[#e5dfd7] border-[#282119]' : 'text-[#292524] border-[#e7e5e4]'
                    }`}>
                      Land overview
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className={`font-semibold ${isDarkMode ? 'text-[#f4ede4]' : 'text-[#1c1917]'}`}>
                        All :
                      </div>
                      <div className="pl-3 space-y-1">
                        <div className="flex justify-between items-center py-0.5">
                          <span className={isDarkMode ? 'text-[#a8a195]' : 'text-[#57534e]'}>Total parcels :</span>
                          <span className={`font-semibold ${isDarkMode ? 'text-[#f4ede4]' : 'text-[#1c1917]'}`}>
                            {totalParcelsCount}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-0.5 pl-2">
                          <span className={isDarkMode ? 'text-[#a8a195]' : 'text-[#57534e]'}>verified :</span>
                          <span className={`font-semibold ${isDarkMode ? 'text-[#f4ede4]' : 'text-[#1c1917]'}`}>
                            {verifiedCount}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-0.5 pl-2">
                          <span className={isDarkMode ? 'text-[#a8a195]' : 'text-[#57534e]'}>pending :</span>
                          <span className={`font-semibold ${isDarkMode ? 'text-[#f4ede4]' : 'text-[#1c1917]'}`}>
                            {pendingCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3-Tier Hierarchy Selection Card: Below Land Overview and Above Land Use Zone Split */}
                  <div className={`rounded-lg p-3.5 border transition-all space-y-2.5 ${
                    isDarkMode ? 'bg-[#181512] border-[#2e2720]' : 'bg-[#fafaf9] border-[#e7e5e4]'
                  }`}>
                    <div className={`text-xs font-bold tracking-wide uppercase pb-1.5 border-b flex items-center justify-between ${
                      isDarkMode ? 'text-[#e5dfd7] border-[#282119]' : 'text-[#292524] border-[#e7e5e4]'
                    }`}>
                      <span>Select Jurisdiction</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      {/* Step 1: State Selection */}
                      <div className="space-y-1">
                        <label htmlFor="sidebar-select-state" className={`flex items-center gap-1 font-semibold text-[11px] ${
                          isDarkMode ? 'text-[#a8a195]' : 'text-[#57534e]'
                        }`}>
                          <Building className="w-3.5 h-3.5 text-[#e5a93b]" />
                          <span>STATE :</span>
                        </label>
                        <select
                          id="sidebar-select-state"
                          value={selectedStateName}
                          onChange={(e) => handleSelectState(e.target.value)}
                          className={`w-full px-2.5 py-1.5 rounded border text-xs font-semibold outline-none cursor-pointer transition-colors ${
                            isDarkMode
                              ? 'bg-[#14110e] border-[#2e2720] text-[#f4ede4] focus:border-[#e5a93b]'
                              : 'bg-white border-[#e7e5e4] text-[#1c1917] focus:border-[#d97706]'
                          }`}
                        >
                          {availableStates.map((st) => (
                            <option key={st.code || st.name} value={st.name} className={isDarkMode ? 'bg-[#181512] text-white' : 'bg-white text-black'}>
                              {st.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Step 2: District Selection */}
                      <div className="space-y-1">
                        <label htmlFor="sidebar-select-district" className={`flex items-center gap-1 font-semibold text-[11px] ${
                          isDarkMode ? 'text-[#a8a195]' : 'text-[#57534e]'
                        }`}>
                          <MapPin className="w-3.5 h-3.5 text-[#e5a93b]" />
                          <span>DISTRICT :</span>
                        </label>
                        <select
                          id="sidebar-select-district"
                          value={selectedDistrict.id}
                          onChange={(e) => handleSelectDistrictChange(e.target.value)}
                          className={`w-full px-2.5 py-1.5 rounded border text-xs font-semibold outline-none cursor-pointer transition-colors ${
                            isDarkMode
                              ? 'bg-[#14110e] border-[#2e2720] text-[#f4ede4] focus:border-[#e5a93b]'
                              : 'bg-white border-[#e7e5e4] text-[#1c1917] focus:border-[#d97706]'
                          }`}
                        >
                          {availableDistricts.map((dist) => (
                            <option key={dist.id} value={dist.id} className={isDarkMode ? 'bg-[#181512] text-white' : 'bg-white text-black'}>
                              {dist.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Step 3: City / Taluka Selection */}
                      <div className="space-y-1">
                        <label htmlFor="sidebar-select-city" className={`flex items-center gap-1 font-semibold text-[11px] ${
                          isDarkMode ? 'text-[#a8a195]' : 'text-[#57534e]'
                        }`}>
                          <Navigation className="w-3.5 h-3.5 text-[#e5a93b]" />
                          <span>CITY / TALUKA :</span>
                        </label>
                        <select
                          id="sidebar-select-city"
                          value={selectedCityName}
                          onChange={(e) => handleSelectCityChange(e.target.value)}
                          className={`w-full px-2.5 py-1.5 rounded border text-xs font-semibold outline-none cursor-pointer transition-colors ${
                            isDarkMode
                              ? 'bg-[#14110e] border-[#2e2720] text-[#f4ede4] focus:border-[#e5a93b]'
                              : 'bg-white border-[#e7e5e4] text-[#1c1917] focus:border-[#d97706]'
                          }`}
                        >
                          <option value="All" className={isDarkMode ? 'bg-[#181512] text-white' : 'bg-white text-black'}>
                            All Cities ({availableCities.length})
                          </option>
                          {availableCities.map((city) => (
                            <option key={city} value={city} className={isDarkMode ? 'bg-[#181512] text-white' : 'bg-white text-black'}>
                              {city}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Land Use Zone Split Card */}
                  <div className={`rounded-lg p-3.5 border transition-all ${
                    isDarkMode ? 'bg-[#181512] border-[#2e2720]' : 'bg-[#fafaf9] border-[#e7e5e4]'
                  }`}>
                    <div className={`text-xs font-bold tracking-wide uppercase mb-2 pb-1.5 border-b ${
                      isDarkMode ? 'text-[#e5dfd7] border-[#282119]' : 'text-[#292524] border-[#e7e5e4]'
                    }`}>
                      Land use zone split :
                    </div>

                    <div className="space-y-1 text-xs">
                      {[
                        { key: 'Agriculture', name: 'Agriculture', count: agriculturalCount },
                        { key: 'Residential', name: 'Residential', count: residentialCount },
                        { key: 'Commercial', name: 'Commercial', count: commercialCount },
                        { key: 'Government', name: 'Government', count: governmentCount },
                        { key: 'Protected', name: 'Protected/Forest', count: protectedCount },
                        { key: 'Other', name: 'Other', count: otherCount },
                      ].map((zone) => {
                        const isHovered = hoveredZoneCategory === zone.key;
                        const pct = totalParcelsCount > 0 ? Math.round((zone.count / totalParcelsCount) * 100) : 0;
                        return (
                          <div
                            key={zone.key}
                            id={`land-zone-row-${zone.key.toLowerCase()}`}
                            onMouseEnter={() => setHoveredZoneCategory(zone.key)}
                            onMouseLeave={() => setHoveredZoneCategory(null)}
                            onClick={() => setParcelFilter(zone.key as ParcelFilterType)}
                            className={`flex items-center justify-between py-1.5 px-2 rounded cursor-pointer transition-colors ${
                              isHovered
                                ? isDarkMode ? 'bg-[#26201a]' : 'bg-[#eeece8]'
                                : isDarkMode ? 'hover:bg-[#201a14]' : 'hover:bg-[#f5f5f4]'
                            }`}
                          >
                            <span className={`font-medium ${isDarkMode ? 'text-[#d4cbbf]' : 'text-[#44403c]'}`}>
                              {zone.name} :
                            </span>
                            <div className="text-right">
                              <span className={`text-xs font-bold font-mono ${isDarkMode ? 'text-[#f4ede4]' : 'text-[#1c1917]'}`}>
                                {pct}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Find Development Land Card */}
                  <div className={`rounded-lg p-3.5 border transition-all space-y-3 ${
                    isDarkMode ? 'bg-[#181512] border-[#2e2720]' : 'bg-[#fafaf9] border-[#e7e5e4]'
                  }`}>
                    <div className={`text-xs font-bold tracking-wide uppercase pb-1.5 border-b ${
                      isDarkMode ? 'text-[#e5dfd7] border-[#282119]' : 'text-[#292524] border-[#e7e5e4]'
                    }`}>
                      Find Development Land.
                    </div>

                    {/* Infrastructure Type Selection */}
                    <div className="space-y-1.5 text-xs">
                      <div className={`font-medium ${isDarkMode ? 'text-[#a8a195]' : 'text-[#57534e]'}`}>
                        Infrastructure type :
                      </div>
                      <div className={`border rounded p-1 max-h-36 overflow-y-auto space-y-0.5 ${
                        isDarkMode ? 'bg-[#14110e] border-[#282119]' : 'bg-white border-[#e7e5e4]'
                      }`}>
                        {INFRA_TYPES.map((type) => {
                          const isSelected = selectedInfraType === type;
                          return (
                            <button
                              key={type}
                              id={`infra-type-btn-${type.toLowerCase().replace(/\s+/g, '-')}`}
                              type="button"
                              onClick={() => setSelectedInfraType(type)}
                              className={`w-full text-left px-2 py-1 rounded text-xs transition-colors flex items-center justify-between ${
                                isSelected
                                  ? isDarkMode
                                    ? 'bg-[#2a231b] text-[#f4ede4] font-semibold border border-[#3e3428]'
                                    : 'bg-[#e7e5e4] text-[#1c1917] font-semibold border border-[#d6d3d1]'
                                  : isDarkMode
                                  ? 'text-[#a8a195] hover:bg-[#1e1913] hover:text-[#e5dfd7]'
                                  : 'text-[#57534e] hover:bg-[#f5f5f4] hover:text-[#1c1917]'
                              }`}
                            >
                              <span>{type}</span>
                              {isSelected && (
                                <span className={`text-[10px] font-mono ${isDarkMode ? 'text-[#d4cbbf]' : 'text-[#57534e]'}`}>
                                  Active
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Required Area Input */}
                    <div className="space-y-1 text-xs">
                      <div className={`font-medium ${isDarkMode ? 'text-[#a8a195]' : 'text-[#57534e]'}`}>
                        Required Area :
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          id="required-area-input"
                          type="number"
                          min="0.5"
                          step="0.5"
                          value={requiredAreaInput}
                          onChange={(e) => setRequiredAreaInput(e.target.value)}
                          placeholder="10"
                          className={`w-full px-2.5 py-1.5 rounded border text-xs outline-none ${
                            isDarkMode
                              ? 'bg-[#14110e] border-[#282119] text-[#f4ede4] focus:border-[#574d3f]'
                              : 'bg-white border-[#e7e5e4] text-[#1c1917] focus:border-[#a8a29e]'
                          }`}
                        />
                        <span className={`text-xs font-medium whitespace-nowrap ${isDarkMode ? 'text-[#a8a195]' : 'text-[#57534e]'}`}>
                          Acres
                        </span>
                      </div>
                    </div>

                    {/* Best Available Land Toggle & Results */}
                    <div className={`pt-2.5 border-t space-y-2 ${isDarkMode ? 'border-[#282119]' : 'border-[#e7e5e4]'}`}>
                      <div className="flex items-center justify-between">
                        <div className={`text-xs font-bold tracking-wide uppercase ${isDarkMode ? 'text-[#e5dfd7]' : 'text-[#292524]'}`}>
                          Best Available Land
                        </div>
                        {/* Toggle Button / Switch */}
                        <button
                          type="button"
                          id="toggle-best-available-land-btn"
                          onClick={() => setShowBestAvailableLand(!showBestAvailableLand)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                            showBestAvailableLand
                              ? isDarkMode ? 'bg-[#d4cbbf]' : 'bg-[#1c1917]'
                              : isDarkMode ? 'bg-[#2a231b] border border-[#44382c]' : 'bg-[#e7e5e4] border border-[#d6d3d1]'
                          }`}
                          role="switch"
                          aria-checked={showBestAvailableLand}
                          title={showBestAvailableLand ? 'Hide parcels' : 'Show best available parcels'}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full transition-transform ${
                              showBestAvailableLand
                                ? isDarkMode ? 'translate-x-4.5 bg-[#14110e]' : 'translate-x-4.5 bg-white'
                                : isDarkMode ? 'translate-x-1 bg-[#8e8577]' : 'translate-x-1 bg-[#a8a29e]'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Final Result of Different Parcels visible ONLY after clicking toggle */}
                      {showBestAvailableLand ? (
                        <div className="space-y-1.5 text-xs pt-1 animate-fadeIn">
                          {bestAvailableLand.length > 0 ? (
                            bestAvailableLand.map((p, idx) => {
                              const isSelected = selectedParcel?.id === p.id;
                              return (
                                <div
                                  key={p.id}
                                  id={`candidate-parcel-item-${p.id}`}
                                  onClick={() => onSelectParcel(p)}
                                  className={`p-2 rounded border cursor-pointer transition-colors ${
                                    isSelected
                                      ? isDarkMode
                                        ? 'bg-[#2a231b] border-[#574d3f] text-white'
                                        : 'bg-[#e7e5e4] border-[#a8a29e] text-[#1c1917]'
                                      : isDarkMode
                                      ? 'bg-[#14110e] border-[#282119] hover:bg-[#1f1913] text-[#d4cbbf]'
                                      : 'bg-white border-[#e7e5e4] hover:bg-[#fafaf9] text-[#44403c]'
                                  }`}
                                >
                                  <div className="flex justify-between items-center">
                                    <span className={`font-semibold ${isDarkMode ? 'text-[#f4ede4]' : 'text-[#1c1917]'}`}>
                                      parcel {idx + 1} : {p.parcelNumber || p.id}
                                    </span>
                                    <span className={`text-[11px] font-mono ${isDarkMode ? 'text-[#a8a195]' : 'text-[#78716c]'}`}>
                                      {p.suitabilityScore}/100
                                    </span>
                                  </div>
                                  <div className={`text-[11px] mt-0.5 flex justify-between ${isDarkMode ? 'text-[#8e8577]' : 'text-[#78716c]'}`}>
                                    <span>{p.village || p.taluka} ({p.areaAcres} Acres)</span>
                                    <span>{p.ownership}</span>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className={`text-xs italic py-2 text-center ${isDarkMode ? 'text-[#8e8577]' : 'text-[#78716c]'}`}>
                              No available parcels found
                            </div>
                          )}
                        </div>
                      ) : (
                        <button
                          type="button"
                          id="trigger-best-available-land-button"
                          onClick={() => setShowBestAvailableLand(true)}
                          className={`w-full py-1.5 px-2.5 rounded border border-dashed text-center text-xs transition-colors cursor-pointer ${
                            isDarkMode
                              ? 'border-[#3a3024] hover:border-[#574d3f] bg-[#14110e]/50 hover:bg-[#1f1913] text-[#a8a195] hover:text-[#e5dfd7]'
                              : 'border-[#d6d3d1] hover:border-[#a8a29e] bg-[#f5f5f4]/60 hover:bg-[#eae8e4] text-[#78716c] hover:text-[#1c1917]'
                          }`}
                        >
                          Click toggle to find best available parcels
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Filtered Category Specific View */
                <div className="flex flex-col gap-3">
                  {/* Category Summary Header */}
                  <div className={`rounded-lg p-3.5 border transition-all ${
                    isDarkMode ? 'bg-[#181512] border-[#2e2720]' : 'bg-[#fafaf9] border-[#e7e5e4]'
                  }`}>
                    <div className="mb-2">
                      <div className={`text-xs font-bold tracking-wide uppercase ${isDarkMode ? 'text-[#e5dfd7]' : 'text-[#292524]'}`}>
                        {parcelFilter.toUpperCase()} OVERVIEW
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between items-center py-0.5">
                        <span className={isDarkMode ? 'text-[#a8a195]' : 'text-[#57534e]'}>Total {parcelFilter} Parcels :</span>
                        <span className={`font-semibold ${isDarkMode ? 'text-[#f4ede4]' : 'text-[#1c1917]'}`}>
                          {activeCategoryCount}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-0.5 pl-2">
                        <span className={isDarkMode ? 'text-[#a8a195]' : 'text-[#57534e]'}>verified :</span>
                        <span className={`font-semibold ${isDarkMode ? 'text-[#f4ede4]' : 'text-[#1c1917]'}`}>
                          {activeVerifiedCount}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-0.5 pl-2">
                        <span className={isDarkMode ? 'text-[#a8a195]' : 'text-[#57534e]'}>pending :</span>
                        <span className={`font-semibold ${isDarkMode ? 'text-[#f4ede4]' : 'text-[#1c1917]'}`}>
                          {activePendingCount}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3-Tier Hierarchy Selection Card */}
                  <div className={`rounded-lg p-3.5 border transition-all space-y-2.5 ${
                    isDarkMode ? 'bg-[#181512] border-[#2e2720]' : 'bg-[#fafaf9] border-[#e7e5e4]'
                  }`}>
                    <div className={`text-xs font-bold tracking-wide uppercase pb-1.5 border-b flex items-center justify-between ${
                      isDarkMode ? 'text-[#e5dfd7] border-[#282119]' : 'text-[#292524] border-[#e7e5e4]'
                    }`}>
                      <span>Select Jurisdiction</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      {/* Step 1: State Selection */}
                      <div className="space-y-1">
                        <label htmlFor="cat-sidebar-select-state" className={`flex items-center gap-1 font-semibold text-[11px] ${
                          isDarkMode ? 'text-[#a8a195]' : 'text-[#57534e]'
                        }`}>
                          <Building className="w-3.5 h-3.5 text-[#e5a93b]" />
                          <span>STATE :</span>
                        </label>
                        <select
                          id="cat-sidebar-select-state"
                          value={selectedStateName}
                          onChange={(e) => handleSelectState(e.target.value)}
                          className={`w-full px-2.5 py-1.5 rounded border text-xs font-semibold outline-none cursor-pointer transition-colors ${
                            isDarkMode
                              ? 'bg-[#14110e] border-[#2e2720] text-[#f4ede4] focus:border-[#e5a93b]'
                              : 'bg-white border-[#e7e5e4] text-[#1c1917] focus:border-[#d97706]'
                          }`}
                        >
                          {availableStates.map((st) => (
                            <option key={st.code || st.name} value={st.name} className={isDarkMode ? 'bg-[#181512] text-white' : 'bg-white text-black'}>
                              {st.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Step 2: District Selection */}
                      <div className="space-y-1">
                        <label htmlFor="cat-sidebar-select-district" className={`flex items-center gap-1 font-semibold text-[11px] ${
                          isDarkMode ? 'text-[#a8a195]' : 'text-[#57534e]'
                        }`}>
                          <MapPin className="w-3.5 h-3.5 text-[#e5a93b]" />
                          <span>DISTRICT :</span>
                        </label>
                        <select
                          id="cat-sidebar-select-district"
                          value={selectedDistrict.id}
                          onChange={(e) => handleSelectDistrictChange(e.target.value)}
                          className={`w-full px-2.5 py-1.5 rounded border text-xs font-semibold outline-none cursor-pointer transition-colors ${
                            isDarkMode
                              ? 'bg-[#14110e] border-[#2e2720] text-[#f4ede4] focus:border-[#e5a93b]'
                              : 'bg-white border-[#e7e5e4] text-[#1c1917] focus:border-[#d97706]'
                          }`}
                        >
                          {availableDistricts.map((dist) => (
                            <option key={dist.id} value={dist.id} className={isDarkMode ? 'bg-[#181512] text-white' : 'bg-white text-black'}>
                              {dist.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Step 3: City / Taluka Selection */}
                      <div className="space-y-1">
                        <label htmlFor="cat-sidebar-select-city" className={`flex items-center gap-1 font-semibold text-[11px] ${
                          isDarkMode ? 'text-[#a8a195]' : 'text-[#57534e]'
                        }`}>
                          <Navigation className="w-3.5 h-3.5 text-[#e5a93b]" />
                          <span>CITY / TALUKA :</span>
                        </label>
                        <select
                          id="cat-sidebar-select-city"
                          value={selectedCityName}
                          onChange={(e) => handleSelectCityChange(e.target.value)}
                          className={`w-full px-2.5 py-1.5 rounded border text-xs font-semibold outline-none cursor-pointer transition-colors ${
                            isDarkMode
                              ? 'bg-[#14110e] border-[#2e2720] text-[#f4ede4] focus:border-[#e5a93b]'
                              : 'bg-white border-[#e7e5e4] text-[#1c1917] focus:border-[#d97706]'
                          }`}
                        >
                          <option value="All" className={isDarkMode ? 'bg-[#181512] text-white' : 'bg-white text-black'}>
                            All Cities ({availableCities.length})
                          </option>
                          {availableCities.map((city) => (
                            <option key={city} value={city} className={isDarkMode ? 'bg-[#181512] text-white' : 'bg-white text-black'}>
                              {city}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Taluka Distribution */}
                  <div className={`rounded-lg p-3.5 border transition-all ${
                    isDarkMode ? 'bg-[#181512] border-[#2e2720]' : 'bg-[#fafaf9] border-[#e7e5e4]'
                  }`}>
                    <div className={`flex items-center justify-between mb-2 pb-1 border-b ${
                      isDarkMode ? 'text-[#e5dfd7] border-[#282119]' : 'text-[#292524] border-[#e7e5e4]'
                    }`}>
                      <div className={`text-xs font-bold tracking-wide uppercase ${
                        isDarkMode ? 'text-[#e5dfd7]' : 'text-[#292524]'
                      }`}>
                        Taluka Distribution
                      </div>
                      {selectedCityName !== 'All' && (
                        <button
                          type="button"
                          onClick={() => handleSelectCityChange('All')}
                          className={`text-[10px] underline font-medium cursor-pointer ${
                            isDarkMode ? 'text-[#e5a93b]' : 'text-[#d97706]'
                          }`}
                        >
                          Clear ({selectedCityName})
                        </button>
                      )}
                    </div>
                    <div className="space-y-1 text-xs">
                      {categoryTalukaBreakdown.length > 0 ? (
                        categoryTalukaBreakdown.map(([talukaName, data]) => {
                          const pct = activeCategoryCount > 0 ? Math.round((data.count / activeCategoryCount) * 100) : 0;
                          const isTalukaSelected = selectedCityName.toLowerCase() === talukaName.toLowerCase();
                          return (
                            <button
                              key={talukaName}
                              type="button"
                              onClick={() => handleSelectCityChange(isTalukaSelected ? 'All' : talukaName)}
                              className={`w-full flex justify-between items-center px-2 py-1 rounded transition-colors text-left cursor-pointer ${
                                isTalukaSelected
                                  ? isDarkMode
                                    ? 'bg-[#2b241d] text-[#e5a93b] border border-[#e5a93b]/40 font-semibold'
                                    : 'bg-[#fef3c7] text-[#92400e] border border-[#f59e0b]/40 font-semibold'
                                  : isDarkMode
                                  ? 'hover:bg-[#221c15] text-[#d4cbbf]'
                                  : 'hover:bg-[#f5f5f4] text-[#44403c]'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <span className={`w-1.5 h-1.5 rounded-full ${isTalukaSelected ? 'bg-[#e5a93b]' : 'bg-[#78716c]'}`} />
                                <span className="truncate">{talukaName}</span>
                              </div>
                              <span className={`font-mono text-[11px] shrink-0 ${
                                isTalukaSelected
                                  ? isDarkMode ? 'text-[#e5a93b]' : 'text-[#92400e]'
                                  : isDarkMode ? 'text-[#a8a195]' : 'text-[#78716c]'
                              }`}>
                                {data.count} ({pct}%)
                              </span>
                            </button>
                          );
                        })
                      ) : (
                        <div className={`text-xs italic py-2 text-center ${isDarkMode ? 'text-[#8e8577]' : 'text-[#78716c]'}`}>
                          No records found
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Parcels in Category */}
                  <div className={`rounded-lg p-3.5 border flex-1 transition-all ${
                    isDarkMode ? 'bg-[#181512] border-[#2e2720]' : 'bg-[#fafaf9] border-[#e7e5e4]'
                  }`}>
                    <div className={`text-xs font-bold tracking-wide uppercase mb-2 pb-1 border-b ${
                      isDarkMode ? 'text-[#e5dfd7] border-[#282119]' : 'text-[#292524] border-[#e7e5e4]'
                    }`}>
                      {parcelFilter} Parcels List
                    </div>
                    <div className="space-y-1.5 text-xs">
                      {recentlyUpdatedParcels.map((p) => {
                        const isSelected = selectedParcel?.id === p.id;
                        return (
                          <div
                            key={p.id}
                            onClick={() => onSelectParcel(p)}
                            className={`p-2 rounded border cursor-pointer transition-colors ${
                              isSelected
                                ? isDarkMode
                                  ? 'bg-[#2a231b] border-[#574d3f] text-white'
                                  : 'bg-[#e7e5e4] border-[#a8a29e] text-[#1c1917]'
                                : isDarkMode
                                ? 'bg-[#14110e] border-[#282119] hover:bg-[#1f1913] text-[#d4cbbf]'
                                : 'bg-white border-[#e7e5e4] hover:bg-[#fafaf9] text-[#44403c]'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className={`font-semibold ${isDarkMode ? 'text-[#f4ede4]' : 'text-[#1c1917]'}`}>
                                {p.parcelNumber || p.id}
                              </span>
                              <span className={`text-[11px] font-mono ${isDarkMode ? 'text-[#a8a195]' : 'text-[#78716c]'}`}>
                                {p.areaAcres} Acres
                              </span>
                            </div>
                            <div className={`text-[11px] mt-0.5 flex justify-between ${isDarkMode ? 'text-[#8e8577]' : 'text-[#78716c]'}`}>
                              <span>{p.village} ({p.taluka})</span>
                              <span>{p.verificationStatus || 'Verified'}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Infrastructure Monitoring Tab Controls */}
          {activeTab === 'infra' && (
            <div className="space-y-3">
              <div className={`rounded-lg p-3.5 shadow-md border ${
                isDarkMode ? 'bg-[#1a1714] border-[#2e2720]' : 'bg-[#fafaf9] border-[#e7e5e4]'
              }`}>
                <div className={`text-[11px] font-bold tracking-wider uppercase mb-1 ${isDarkMode ? 'text-[#8e8577]' : 'text-[#78716c]'}`}>
                  CRITICAL INFRASTRUCTURE ASSETS
                </div>
                <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-[#1c1917]'}`}>
                  {infrastructureAssets.length} Active Facilities
                </div>
                <div className={`grid grid-cols-2 gap-2 mt-2 pt-2 border-t text-xs ${isDarkMode ? 'border-[#26201a]' : 'border-[#e7e5e4]'}`}>
                  <div>
                    <span className={`block text-[10px] ${isDarkMode ? 'text-[#8e8577]' : 'text-[#78716c]'}`}>Good Condition</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {infrastructureAssets.filter((a) => a.condition === 'Good').length}
                    </span>
                  </div>
                  <div>
                    <span className={`block text-[10px] ${isDarkMode ? 'text-[#8e8577]' : 'text-[#78716c]'}`}>Needs Repair / Critical</span>
                    <span className="text-rose-600 dark:text-rose-400 font-bold">
                      {infrastructureAssets.filter((a) => a.condition !== 'Good').length}
                    </span>
                  </div>
                </div>
              </div>

              <div className={`rounded-lg p-3.5 shadow-md border ${
                isDarkMode ? 'bg-[#1a1714] border-[#2e2720]' : 'bg-[#fafaf9] border-[#e7e5e4]'
              }`}>
                <div className={`text-[11px] font-bold tracking-wider uppercase mb-2 ${isDarkMode ? 'text-[#8e8577]' : 'text-[#78716c]'}`}>
                  INFRASTRUCTURE ASSET LIST
                </div>
                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                  {infrastructureAssets.map((asset) => (
                    <div
                      key={asset.id}
                      className={`p-2 rounded border text-xs flex justify-between items-center ${
                        isDarkMode ? 'bg-[#151311] border-[#241e18]' : 'bg-white border-[#e7e5e4]'
                      }`}
                    >
                      <div>
                        <div className={`font-bold ${isDarkMode ? 'text-[#f4ede4]' : 'text-[#1c1917]'}`}>{asset.name}</div>
                        <div className={`text-[10px] ${isDarkMode ? 'text-[#8e8577]' : 'text-[#78716c]'}`}>
                          {asset.type} &bull; {asset.taluka}
                        </div>
                      </div>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          asset.condition === 'Good'
                            ? isDarkMode ? 'bg-emerald-950 text-emerald-300' : 'bg-emerald-100 text-emerald-800'
                            : isDarkMode ? 'bg-rose-950 text-rose-300' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {asset.condition}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Site Management Tab Controls */}
          {activeTab === 'sites' && (
            <div className="space-y-3">
              {/* Site Management Control Header Card */}
              <div className={`p-4 rounded-xl border transition-all ${
                isDarkMode ? 'bg-[#181512] border-[#2e2720]' : 'bg-[#fafaf9] border-[#e7e5e4]'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className={`text-xs font-bold tracking-wider uppercase flex items-center gap-2 ${
                    isDarkMode ? 'text-[#f4ede4]' : 'text-[#1c1917]'
                  }`}>
                    <Building className="w-4 h-4 text-[#e5a93b]" />
                    <span>SITE MANAGEMENT</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 mb-3 text-xs">
                  {/* Infrastructure Dropdown */}
                  <div className="space-y-1">
                    <label htmlFor="site-infra-select" className={`block text-[10px] font-bold uppercase tracking-wider ${
                      isDarkMode ? 'text-[#a8a195]' : 'text-[#78716c]'
                    }`}>
                      Infrastructure :
                    </label>
                    <select
                      id="site-infra-select"
                      value={targetInfra}
                      onChange={(e) => {
                        setTargetInfra(e.target.value);
                        onRecalculateSuitability(localWeights, e.target.value);
                      }}
                      className={`w-full px-2.5 py-1.5 rounded border text-xs font-semibold outline-none cursor-pointer ${
                        isDarkMode
                          ? 'bg-[#14110e] border-[#2e2720] text-[#f4ede4] focus:border-[#e5a93b]'
                          : 'bg-white border-[#e7e5e4] text-[#1c1917] focus:border-[#d97706]'
                      }`}
                    >
                      <option value="Hospital">Hospital</option>
                      <option value="Primary School">Primary School</option>
                      <option value="Water Treatment">Water Treatment Plant</option>
                      <option value="College">College / Technical Inst.</option>
                      <option value="Bus Stand">Bus Stand / Transit Hub</option>
                      <option value="Police Station">Police Station</option>
                    </select>
                  </div>

                  {/* Region Dropdown */}
                  <div className="space-y-1">
                    <label htmlFor="site-region-select" className={`block text-[10px] font-bold uppercase tracking-wider ${
                      isDarkMode ? 'text-[#a8a195]' : 'text-[#78716c]'
                    }`}>
                      Region :
                    </label>
                    <select
                      id="site-region-select"
                      value={selectedDistrict.id}
                      onChange={(e) => handleSelectDistrictChange(e.target.value)}
                      className={`w-full px-2.5 py-1.5 rounded border text-xs font-semibold outline-none cursor-pointer ${
                        isDarkMode
                          ? 'bg-[#14110e] border-[#2e2720] text-[#f4ede4] focus:border-[#e5a93b]'
                          : 'bg-white border-[#e7e5e4] text-[#1c1917] focus:border-[#d97706]'
                      }`}
                    >
                      {availableDistricts.map((dist) => (
                        <option key={dist.id} value={dist.id}>
                          {dist.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Actions Row: [Find Optimal Sites] [Filters] [Scenario Mode] */}
                <div className={`flex items-center gap-2 pt-2.5 border-t ${
                  isDarkMode ? 'border-[#2e2720]' : 'border-[#e7e5e4]'
                }`}>
                  <button
                    type="button"
                    onClick={() => onRecalculateSuitability(localWeights, targetInfra)}
                    className="flex-1 py-1.5 px-3 bg-[#e5a93b] hover:bg-[#d97706] text-[#141210] font-bold rounded text-xs transition-colors flex items-center justify-center gap-1.5 shadow cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Find Optimal Sites</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                    className={`py-1.5 px-3 rounded text-xs font-semibold border transition-colors flex items-center gap-1 cursor-pointer ${
                      showFiltersPanel
                        ? isDarkMode
                          ? 'bg-[#2e251a] border-[#e5a93b] text-[#e5a93b]'
                          : 'bg-[#fef3c7] border-[#d97706] text-[#b45309]'
                        : isDarkMode
                        ? 'bg-[#14110e] border-[#2e2720] text-[#d4cbbf] hover:text-white hover:bg-[#1f1b17]'
                        : 'bg-white border-[#e7e5e4] text-[#44403c] hover:text-[#1c1917] hover:bg-[#f5f5f4]'
                    }`}
                  >
                    <Filter className="w-3.5 h-3.5" />
                    <span>Filters</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowScenarioMode(!showScenarioMode)}
                    className={`py-1.5 px-3 rounded text-xs font-semibold border transition-colors flex items-center gap-1 cursor-pointer ${
                      showScenarioMode
                        ? isDarkMode
                          ? 'bg-[#2e251a] border-[#e5a93b] text-[#e5a93b]'
                          : 'bg-[#fef3c7] border-[#d97706] text-[#b45309]'
                        : isDarkMode
                        ? 'bg-[#14110e] border-[#2e2720] text-[#d4cbbf] hover:text-white hover:bg-[#1f1b17]'
                        : 'bg-white border-[#e7e5e4] text-[#44403c] hover:text-[#1c1917] hover:bg-[#f5f5f4]'
                    }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Scenario Mode</span>
                  </button>
                </div>
              </div>

              {/* Collapsible Filters Panel */}
              {showFiltersPanel && (
                <div className={`p-3 rounded-lg border text-xs space-y-2.5 transition-all ${
                  isDarkMode ? 'bg-[#151210] border-[#2e2720]' : 'bg-[#fafaf9] border-[#e7e5e4]'
                }`}>
                  <div className="font-bold uppercase tracking-wider text-[10px] text-[#e5a93b] flex items-center justify-between">
                    <span>Spatial Filters & Constraints</span>
                    <button
                      type="button"
                      onClick={() => setShowFiltersPanel(false)}
                      className="text-stone-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <div className="flex justify-between text-[10px] text-stone-400 mb-1">
                        <span>Min Area</span>
                        <span className="font-bold text-[#e5a93b]">{filterMinArea} Acres</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        value={filterMinArea}
                        onChange={(e) => setFilterMinArea(Number(e.target.value))}
                        className="w-full accent-[#e5a93b]"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] text-stone-400 mb-1">
                        <span>Max Land Cost</span>
                        <span className="font-bold text-[#e5a93b]">₹{filterMaxCostCr} Cr</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="100"
                        value={filterMaxCostCr}
                        onChange={(e) => setFilterMaxCostCr(Number(e.target.value))}
                        className="w-full accent-[#e5a93b]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Collapsible Scenario Mode Panel */}
              {showScenarioMode && (
                <div className={`p-3.5 rounded-lg border text-xs space-y-3 transition-all ${
                  isDarkMode ? 'bg-[#151210] border-[#2e2720]' : 'bg-[#fafaf9] border-[#e7e5e4]'
                }`}>
                  <div className="font-bold uppercase tracking-wider text-[10px] text-[#e5a93b] flex items-center justify-between">
                    <span>Scenario Multi-Criteria Weight Simulation</span>
                    <button
                      type="button"
                      onClick={() => setShowScenarioMode(false)}
                      className="text-stone-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    <div>
                      <div className={`flex justify-between mb-1 ${isDarkMode ? 'text-[#d4cbbf]' : 'text-[#44403c]'}`}>
                        <span>Equity & Deficit Priority</span>
                        <span className="font-bold text-[#e5a93b]">
                          {localWeights.socioEconomicNeed ?? 15}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        step="1"
                        value={localWeights.socioEconomicNeed ?? 15}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          setLocalWeights({ ...localWeights, socioEconomicNeed: val });
                        }}
                        className="w-full accent-[#e5a93b]"
                      />
                    </div>

                    <div>
                      <div className={`flex justify-between mb-1 ${isDarkMode ? 'text-[#d4cbbf]' : 'text-[#44403c]'}`}>
                        <span>Road & Grid Proximity</span>
                        <span className="font-bold text-[#e5a93b]">
                          {localWeights.accessibility ?? 20}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        step="1"
                        value={localWeights.accessibility ?? 20}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          setLocalWeights({ ...localWeights, accessibility: val });
                        }}
                        className="w-full accent-[#e5a93b]"
                      />
                    </div>

                    <div>
                      <div className={`flex justify-between mb-1 ${isDarkMode ? 'text-[#d4cbbf]' : 'text-[#44403c]'}`}>
                        <span>Land Acquisition Economy</span>
                        <span className="font-bold text-[#e5a93b]">
                          {localWeights.estimatedCost ?? 10}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        step="1"
                        value={localWeights.estimatedCost ?? 10}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          setLocalWeights({ ...localWeights, estimatedCost: val });
                        }}
                        className="w-full accent-[#e5a93b]"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => onRecalculateSuitability(localWeights, targetInfra)}
                      className="w-full py-1.5 bg-[#e5a93b] hover:bg-[#d97706] text-[#141210] font-bold rounded text-xs transition-colors shadow cursor-pointer"
                    >
                      Recalculate Optimal Sites
                    </button>
                  </div>
                </div>
              )}

              {/* Toast Feedback */}
              {createdProjectToast && (
                <div className="p-3 rounded-lg bg-emerald-950/90 border border-emerald-600/60 text-emerald-300 text-xs flex items-center gap-2 shadow-lg animate-fade-in">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{createdProjectToast}</span>
                </div>
              )}

              {/* SITE SUMMARY Box */}
              <div className={`p-3.5 rounded-xl border transition-all ${
                isDarkMode ? 'bg-[#181512] border-[#2e2720]' : 'bg-[#fafaf9] border-[#e7e5e4]'
              }`}>
                <div className={`text-xs font-bold tracking-wider uppercase mb-2.5 pb-1.5 border-b ${
                  isDarkMode ? 'text-[#e5dfd7] border-[#282119]' : 'text-[#292524] border-[#e7e5e4]'
                }`}>
                  SITE SUMMARY
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className={`p-2.5 rounded-lg border ${
                    isDarkMode ? 'bg-[#14110e] border-[#241e18]' : 'bg-white border-[#e7e5e4]'
                  }`}>
                    <span className={`block text-[10px] font-semibold ${isDarkMode ? 'text-[#8e8577]' : 'text-[#78716c]'}`}>
                      Candidates
                    </span>
                    <span className={`text-lg font-bold font-mono ${isDarkMode ? 'text-[#f4ede4]' : 'text-[#1c1917]'}`}>
                      {candidateSites.length || 12}
                    </span>
                  </div>
                  <div className={`p-2.5 rounded-lg border ${
                    isDarkMode ? 'bg-[#14110e] border-[#241e18]' : 'bg-white border-[#e7e5e4]'
                  }`}>
                    <span className={`block text-[10px] font-semibold ${isDarkMode ? 'text-[#8e8577]' : 'text-[#78716c]'}`}>
                      Restricted
                    </span>
                    <span className={`text-lg font-bold font-mono ${isDarkMode ? 'text-[#f4ede4]' : 'text-[#1c1917]'}`}>
                      4
                    </span>
                  </div>
                  <div className={`p-2.5 rounded-lg border ${
                    isDarkMode ? 'bg-[#14110e] border-[#241e18]' : 'bg-white border-[#e7e5e4]'
                  }`}>
                    <span className={`block text-[10px] font-semibold ${isDarkMode ? 'text-[#8e8577]' : 'text-[#78716c]'}`}>
                      Best Score
                    </span>
                    <span className="text-lg font-bold font-mono text-emerald-500">
                      {candidateSites[0]?.compositeScore || 92}
                    </span>
                  </div>
                </div>
              </div>

              {/* TOP RECOMMENDED SITES Box */}
              <div className={`p-3.5 rounded-xl border transition-all space-y-2.5 ${
                isDarkMode ? 'bg-[#181512] border-[#2e2720]' : 'bg-[#fafaf9] border-[#e7e5e4]'
              }`}>
                <div className={`text-xs font-bold tracking-wider uppercase pb-1.5 border-b flex items-center justify-between ${
                  isDarkMode ? 'text-[#e5dfd7] border-[#282119]' : 'text-[#292524] border-[#e7e5e4]'
                }`}>
                  <span>TOP RECOMMENDED SITES</span>
                  <span className="text-[10px] font-normal text-stone-400">Ranked by Multi-Criteria AI</span>
                </div>

                <div className="space-y-2 text-xs">
                  {candidateSites.slice(0, 3).map((site, index) => {
                    const isSelected = selectedSite?.siteId === site.siteId;
                    const siteDisplayNum = index === 0 ? '18' : index === 1 ? '31' : '07';
                    const needBadge = site.compositeScore >= 88 ? 'HIGH NEED' : 'MODERATE';

                    return (
                      <div
                        key={site.siteId}
                        className={`p-3 rounded-lg border transition-all flex items-center justify-between gap-3 ${
                          isSelected
                            ? isDarkMode
                              ? 'bg-[#282119] border-[#e5a93b] text-white shadow-sm'
                              : 'bg-[#fef3c7] border-[#d97706] text-[#1c1917] shadow-sm'
                            : isDarkMode
                            ? 'bg-[#14110e] border-[#241e18] hover:bg-[#1a1714] text-[#d4cbbf]'
                            : 'bg-white border-[#e7e5e4] hover:bg-[#f5f5f4] text-[#44403c]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs">Site #{siteDisplayNum}</span>
                              <span className="font-mono text-xs font-semibold">{site.compositeScore}/100</span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase border ${
                                isDarkMode
                                  ? 'bg-[#1f1b17] text-[#c4bcaf] border-[#382f25]'
                                  : 'bg-stone-100 text-stone-700 border-stone-200'
                              }`}>
                                {needBadge}
                              </span>
                            </div>
                            <div className="text-[10px] text-stone-400 truncate mt-0.5">
                              {site.siteName} &bull; {site.areaAcres} ac &bull; ₹{site.estimatedCapitalExpenditureCr} Cr
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              onSelectSite(site);
                              setFlyToLocationTarget({
                                lat: site.lat,
                                lng: site.lng,
                                zoom: 16,
                                timestamp: Date.now(),
                              });
                            }}
                            className={`px-3 py-1.5 rounded text-xs font-bold transition-colors border cursor-pointer whitespace-nowrap ${
                              isSelected
                                ? 'bg-[#e5a93b] text-[#141210] border-[#e5a93b] shadow-sm'
                                : isDarkMode
                                ? 'bg-[#241f1a] hover:bg-[#332b22] text-[#f4ede4] border-[#382f25]'
                                : 'bg-[#f5f5f4] hover:bg-[#e7e5e4] text-[#1c1917] border-[#d6d3d1]'
                            }`}
                          >
                            Locate on Map
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SITE INTELLIGENCE Box */}
              {(() => {
                const activeSite = selectedSite || candidateSites[0] || null;
                const factors = activeSite?.factors;

                const popVal = factors ? Math.round((factors.populationDemandScore / 100) * 20) : 18;
                const accVal = factors ? Math.round((factors.accessibilityScore / 100) * 20) : 19;
                const landVal = factors ? Math.round((factors.landSuitabilityScore / 100) * 15) : 14;
                const envVal = factors ? Math.round((factors.environmentalSafetyScore / 100) * 10) : 10;
                const costVal = factors ? Math.round((factors.costFeasibilityScore / 100) * 10) : 8;
                const needVal = factors ? Math.round((factors.socioEconomicEquityScore / 100) * 15) : 14;

                return (
                  <div className={`p-3.5 rounded-xl border transition-all space-y-3 ${
                    isDarkMode ? 'bg-[#181512] border-[#2e2720]' : 'bg-[#fafaf9] border-[#e7e5e4]'
                  }`}>
                    <div className={`text-xs font-bold tracking-wider uppercase pb-1.5 border-b flex items-center justify-between ${
                      isDarkMode ? 'text-[#e5dfd7] border-[#282119]' : 'text-[#292524] border-[#e7e5e4]'
                    }`}>
                      <span>SITE INTELLIGENCE</span>
                      <span className="text-[10px] text-[#e5a93b] font-mono font-bold">
                        {activeSite ? activeSite.siteName : 'Candidate Selection'}
                      </span>
                    </div>

                    {/* Metric Factor Scores */}
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-center text-xs">
                      <div className={`p-2 rounded-lg border ${isDarkMode ? 'bg-[#14110e] border-[#241e18]' : 'bg-white border-[#e7e5e4]'}`}>
                        <span className={`block text-[10px] font-semibold ${isDarkMode ? 'text-[#8e8577]' : 'text-[#78716c]'}`}>
                          Population
                        </span>
                        <span className={`font-bold font-mono text-xs ${isDarkMode ? 'text-[#f4ede4]' : 'text-[#1c1917]'}`}>
                          {popVal}/20
                        </span>
                      </div>
                      <div className={`p-2 rounded-lg border ${isDarkMode ? 'bg-[#14110e] border-[#241e18]' : 'bg-white border-[#e7e5e4]'}`}>
                        <span className={`block text-[10px] font-semibold ${isDarkMode ? 'text-[#8e8577]' : 'text-[#78716c]'}`}>
                          Accessibility
                        </span>
                        <span className={`font-bold font-mono text-xs ${isDarkMode ? 'text-[#f4ede4]' : 'text-[#1c1917]'}`}>
                          {accVal}/20
                        </span>
                      </div>
                      <div className={`p-2 rounded-lg border ${isDarkMode ? 'bg-[#14110e] border-[#241e18]' : 'bg-white border-[#e7e5e4]'}`}>
                        <span className={`block text-[10px] font-semibold ${isDarkMode ? 'text-[#8e8577]' : 'text-[#78716c]'}`}>
                          Land
                        </span>
                        <span className={`font-bold font-mono text-xs ${isDarkMode ? 'text-[#f4ede4]' : 'text-[#1c1917]'}`}>
                          {landVal}/15
                        </span>
                      </div>
                      <div className={`p-2 rounded-lg border ${isDarkMode ? 'bg-[#14110e] border-[#241e18]' : 'bg-white border-[#e7e5e4]'}`}>
                        <span className={`block text-[10px] font-semibold ${isDarkMode ? 'text-[#8e8577]' : 'text-[#78716c]'}`}>
                          Environment
                        </span>
                        <span className={`font-bold font-mono text-xs ${isDarkMode ? 'text-[#f4ede4]' : 'text-[#1c1917]'}`}>
                          {envVal}/10
                        </span>
                      </div>
                      <div className={`p-2 rounded-lg border ${isDarkMode ? 'bg-[#14110e] border-[#241e18]' : 'bg-white border-[#e7e5e4]'}`}>
                        <span className={`block text-[10px] font-semibold ${isDarkMode ? 'text-[#8e8577]' : 'text-[#78716c]'}`}>
                          Cost
                        </span>
                        <span className={`font-bold font-mono text-xs ${isDarkMode ? 'text-[#f4ede4]' : 'text-[#1c1917]'}`}>
                          {costVal}/10
                        </span>
                      </div>
                      <div className={`p-2 rounded-lg border ${isDarkMode ? 'bg-[#14110e] border-[#241e18]' : 'bg-white border-[#e7e5e4]'}`}>
                        <span className={`block text-[10px] font-semibold ${isDarkMode ? 'text-[#8e8577]' : 'text-[#78716c]'}`}>
                          Need
                        </span>
                        <span className={`font-bold font-mono text-xs ${isDarkMode ? 'text-[#f4ede4]' : 'text-[#1c1917]'}`}>
                          {needVal}/15
                        </span>
                      </div>
                    </div>

                    {/* WHY THIS SITE? */}
                    <div className={`p-3 rounded-lg border space-y-1.5 ${
                      isDarkMode ? 'bg-[#14110e] border-[#2e2720]' : 'bg-white border-[#e7e5e4]'
                    }`}>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#e5a93b]">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>WHY THIS SITE?</span>
                      </div>
                      <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-[#d4cbbf]' : 'text-[#44403c]'}`}>
                        {activeSite?.justificationSummary ||
                          'AI-generated explanation based on structured GIS results: Optimal location situated along major arterial connector with zero flood zone vulnerability, serving an underserved rural catchment of 48,000 tribal citizens with critical healthcare deficit.'}
                      </p>
                    </div>

                    {/* Bottom Action Row: Compare, Generate Report, Create Project */}
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setCompareModalOpen(true)}
                        className={`py-2 px-2 rounded-lg text-xs font-semibold border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                          isDarkMode
                            ? 'bg-[#14110e] hover:bg-[#241f1a] text-[#f4ede4] border-[#2e2720]'
                            : 'bg-white hover:bg-[#f5f5f4] text-[#1c1917] border-[#e7e5e4]'
                        }`}
                      >
                        <Sliders className="w-3.5 h-3.5 text-[#e5a93b]" />
                        <span>Compare</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenReportModal(activeSite || undefined)}
                        className={`py-2 px-2 rounded-lg text-xs font-semibold border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                          isDarkMode
                            ? 'bg-[#14110e] hover:bg-[#241f1a] text-[#f4ede4] border-[#2e2720]'
                            : 'bg-white hover:bg-[#f5f5f4] text-[#1c1917] border-[#e7e5e4]'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5 text-[#e5a93b]" />
                        <span>Generate Report</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCreateProjectModalOpen(true)}
                        className="py-2 px-2 rounded-lg text-xs font-bold bg-[#e5a93b] hover:bg-[#d97706] text-[#141210] transition-colors flex items-center justify-center gap-1.5 shadow cursor-pointer"
                      >
                        <Building className="w-3.5 h-3.5" />
                        <span>Create Project</span>
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Analytics Tab Controls (5-Year Development Trends & Temporal Spatial Analytics) */}
          {activeTab === 'analytics' && (
            <div className="space-y-4">
              <DevelopmentTrendsModule
                isDarkMode={isDarkMode}
                temporalAreas={AHMEDABAD_TEMPORAL_AREAS}
                temporalSummary={AHMEDABAD_DISTRICT_TEMPORAL_SUMMARY}
                selectedYear={temporalYear}
                onSelectYear={setTemporalYear}
                selectedFactor={temporalFactor}
                onSelectFactor={setTemporalFactor}
                selectedArea={selectedTemporalArea}
                onSelectArea={setSelectedTemporalArea}
                onFlyToArea={(area) => {
                  setSelectedTemporalArea(area);
                  setFlyToLocationTarget({
                    lat: area.centerLat,
                    lng: area.centerLng,
                    zoom: 13,
                    timestamp: Date.now(),
                  });
                }}
                availableStates={availableStates}
                selectedStateName={selectedStateName}
                onSelectState={handleSelectState}
                availableDistricts={availableDistricts}
                selectedDistrictId={selectedDistrict.id}
                onSelectDistrict={handleSelectDistrictChange}
                availableCities={availableCities}
                selectedCityName={selectedCityName}
                onSelectCity={handleSelectCityChange}
              />
            </div>
          )}
        </aside>
          </>
        )}
      </div>

      {/* Selected Parcel Inspector Side Drawer (overlaps everything on top) */}
      {selectedParcel && (
        <div
          id="parcel-inspector-card"
          className={`absolute right-84 top-14 bottom-4 w-84 backdrop-blur-md border rounded-lg shadow-[0_25px_60px_rgba(0,0,0,0.85)] p-4 z-[9999] overflow-y-auto flex flex-col justify-between transition-all ${
            isDarkMode
              ? 'bg-[#14110e]/98 border-[#3d3328] text-[#f4ede4] ring-1 ring-black/80'
              : 'bg-white/98 border-[#e7e5e4] text-[#1c1917] shadow-2xl ring-1 ring-black/5'
          }`}
        >
          <div>
            <div className={`flex items-center justify-between pb-2 border-b ${isDarkMode ? 'border-[#282119]' : 'border-[#e7e5e4]'}`}>
              <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-[#f4ede4]' : 'text-[#1c1917]'}`}>
                PARCEL INSPECTOR
              </span>
              <button
                type="button"
                id="close-parcel-inspector-btn"
                onClick={() => onSelectParcel(null)}
                className={`p-1 rounded transition-colors ${
                  isDarkMode ? 'text-[#a8a195] hover:text-white hover:bg-[#241f1a]' : 'text-[#78716c] hover:text-[#1c1917] hover:bg-[#f5f5f4]'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 space-y-2 text-xs">
              <div>
                <span className={`text-[10px] uppercase block font-semibold ${isDarkMode ? 'text-[#8e8577]' : 'text-[#78716c]'}`}>
                  Survey / Parcel ID
                </span>
                <span className={`font-mono text-sm font-bold ${isDarkMode ? 'text-[#f4ede4]' : 'text-[#1c1917]'}`}>
                  {selectedParcel.parcelNumber}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className={`text-[10px] uppercase block font-semibold ${isDarkMode ? 'text-[#8e8577]' : 'text-[#78716c]'}`}>
                    Village & Taluka
                  </span>
                  <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-[#1c1917]'}`}>{selectedParcel.village}</span>
                  <span className={`text-[10px] block ${isDarkMode ? 'text-[#a89f91]' : 'text-[#78716c]'}`}>{selectedParcel.taluka}</span>
                </div>
                <div>
                  <span className={`text-[10px] uppercase block font-semibold ${isDarkMode ? 'text-[#8e8577]' : 'text-[#78716c]'}`}>Area</span>
                  <span className={`font-bold text-sm ${isDarkMode ? 'text-[#f4ede4]' : 'text-[#1c1917]'}`}>{selectedParcel.areaAcres} Acres</span>
                </div>
              </div>

              <div className="pt-1">
                <span className={`text-[10px] uppercase block font-semibold ${isDarkMode ? 'text-[#8e8577]' : 'text-[#78716c]'}`}>
                  Zoning & Ownership
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium border ${
                    isDarkMode ? 'bg-[#221c17] text-[#d4cbbf] border-[#382d22]' : 'bg-[#f5f5f4] text-[#44403c] border-[#e7e5e4]'
                  }`}>
                    {selectedParcel.landUse}
                  </span>
                  <span className={isDarkMode ? 'text-[#a89f91]' : 'text-[#78716c]'}>{selectedParcel.ownership}</span>
                </div>
              </div>



              <div className="pt-2">
                <span className={`text-[10px] uppercase block font-semibold mb-1 ${isDarkMode ? 'text-[#8e8577]' : 'text-[#78716c]'}`}>
                  Verification Status
                </span>
                <span
                  className={`inline-block px-2.5 py-1 rounded text-xs font-semibold border ${
                    isDarkMode
                      ? 'bg-[#221c17] text-[#f4ede4] border-[#3d3328]'
                      : 'bg-[#f5f5f4] text-[#1c1917] border-[#d6d3d1]'
                  }`}
                >
                  {selectedParcel.verificationStatus || 'Verified'}
                </span>
              </div>
            </div>
          </div>

          <div className={`pt-3 border-t flex gap-2 ${isDarkMode ? 'border-[#2e2720]' : 'border-[#e7e5e4]'}`}>
            <button
              type="button"
              id="locate-parcel-on-map-btn"
              onClick={() => handleLocateParcelOnMap(selectedParcel)}
              disabled={isLocatingParcel}
              className={`flex-1 py-1.5 px-3 font-bold rounded text-xs transition-all flex items-center justify-center gap-1.5 border shadow-sm ${
                isDarkMode
                  ? 'bg-[#282119] hover:bg-[#382e23] active:bg-[#47392c] text-[#f4ede4] border-[#47392c]'
                  : 'bg-[#1c1917] hover:bg-[#292524] active:bg-[#44403c] text-white border-[#1c1917]'
              } ${isLocatingParcel ? 'opacity-70 animate-pulse' : ''}`}
            >
              <Navigation className={`w-3.5 h-3.5 ${isLocatingParcel ? 'animate-spin' : ''}`} />
              <span>{isLocatingParcel ? 'Centering Map...' : 'Locate on Map'}</span>
            </button>
            <button
              type="button"
              id="close-parcel-action-btn"
              onClick={() => onSelectParcel(null)}
              className={`px-3 py-1.5 rounded text-xs transition-colors border ${
                isDarkMode
                  ? 'bg-[#181512] hover:bg-[#241f1a] text-[#a8a195] hover:text-white border-[#2e2720]'
                  : 'bg-[#f5f5f4] hover:bg-[#e7e5e4] text-[#44403c] border-[#e7e5e4]'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Compare Sites Modal */}
      {compareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className={`w-full max-w-2xl rounded-xl border p-5 shadow-2xl transition-all ${
            isDarkMode ? 'bg-[#181512] border-[#382e23] text-[#f4ede4]' : 'bg-white border-[#e7e5e4] text-[#1c1917]'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-[#382e23]/40 mb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#e5a93b]" />
                <h3 className="font-bold text-sm uppercase tracking-wider">Top Candidate Sites Comparison</h3>
              </div>
              <button
                type="button"
                onClick={() => setCompareModalOpen(false)}
                className="p-1 rounded text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className={`border-b ${isDarkMode ? 'border-[#2e2720] text-stone-400' : 'border-stone-200 text-stone-600'}`}>
                    <th className="py-2 px-3 font-semibold">Factor / Metric</th>
                    {candidateSites.slice(0, 3).map((s, idx) => (
                      <th key={s.siteId} className="py-2 px-3 font-bold text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span>Site #{idx === 0 ? '18' : idx === 1 ? '31' : '07'}</span>
                        </div>
                        <div className="text-[10px] font-mono font-semibold">{s.compositeScore}/100</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2e2720]/50">
                  <tr>
                    <td className="py-2.5 px-3 font-medium">Site Name</td>
                    {candidateSites.slice(0, 3).map((s) => (
                      <td key={s.siteId} className="py-2.5 px-3 text-center truncate max-w-[140px]">{s.siteName}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-medium">Population Catchment</td>
                    {candidateSites.slice(0, 3).map((s) => (
                      <td key={s.siteId} className="py-2.5 px-3 text-center font-mono">{s.servedPopulationCatchment.toLocaleString()} citizens</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-medium">Road / Grid Access</td>
                    {candidateSites.slice(0, 3).map((s) => (
                      <td key={s.siteId} className="py-2.5 px-3 text-center font-mono font-bold text-[#e5a93b]">{s.factors?.accessibilityScore || 85}%</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-medium">Land Parcel Area</td>
                    {candidateSites.slice(0, 3).map((s) => (
                      <td key={s.siteId} className="py-2.5 px-3 text-center font-mono">{s.areaAcres} Acres</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-medium">Estimated Capital Cost</td>
                    {candidateSites.slice(0, 3).map((s) => (
                      <td key={s.siteId} className="py-2.5 px-3 text-center font-mono font-semibold">₹{s.estimatedCapitalExpenditureCr} Cr</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-medium">Environmental Safety</td>
                    {candidateSites.slice(0, 3).map((s) => (
                      <td key={s.siteId} className="py-2.5 px-3 text-center font-mono text-emerald-400">{s.factors?.environmentalSafetyScore || 90}%</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCompareModalOpen(false)}
                className={`py-1.5 px-4 rounded text-xs font-semibold border ${
                  isDarkMode ? 'bg-[#241f1a] hover:bg-[#332b22] text-[#f4ede4] border-[#382f25]' : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300'
                }`}
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {createProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateProjectSubmit}
            className={`w-full max-w-md rounded-xl border p-5 shadow-2xl transition-all space-y-4 ${
              isDarkMode ? 'bg-[#181512] border-[#382e23] text-[#f4ede4]' : 'bg-white border-[#e7e5e4] text-[#1c1917]'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#382e23]/40">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-[#e5a93b]" />
                <h3 className="font-bold text-sm uppercase tracking-wider">Initialize Infrastructure Project</h3>
              </div>
              <button
                type="button"
                onClick={() => setCreateProjectModalOpen(false)}
                className="p-1 rounded text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-stone-400">Project Title</label>
                <input
                  type="text"
                  required
                  placeholder={selectedSite ? `${selectedSite.proposedType} at ${selectedSite.siteName}` : 'New Community Hospital'}
                  value={projectNameInput}
                  onChange={(e) => setProjectNameInput(e.target.value)}
                  className={`w-full p-2 rounded border outline-none ${
                    isDarkMode ? 'bg-[#12100e] border-[#2e2720] text-white focus:border-[#e5a93b]' : 'bg-white border-stone-300 text-stone-900 focus:border-amber-600'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1 text-stone-400">Infrastructure Type</label>
                  <input
                    type="text"
                    readOnly
                    value={selectedSite?.proposedType || targetInfra}
                    className={`w-full p-2 rounded border opacity-80 cursor-not-allowed ${
                      isDarkMode ? 'bg-[#12100e] border-[#2e2720] text-white' : 'bg-stone-100 border-stone-300 text-stone-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-stone-400">Estimated Budget (Cr)</label>
                  <input
                    type="number"
                    placeholder={selectedSite ? String(selectedSite.estimatedCapitalExpenditureCr) : '15'}
                    value={projectBudgetInput}
                    onChange={(e) => setProjectBudgetInput(e.target.value)}
                    className={`w-full p-2 rounded border outline-none ${
                      isDarkMode ? 'bg-[#12100e] border-[#2e2720] text-white focus:border-[#e5a93b]' : 'bg-white border-stone-300 text-stone-900 focus:border-amber-600'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-stone-400">Target Region & District</label>
                <input
                  type="text"
                  readOnly
                  value={`${selectedDistrict.name}, ${selectedDistrict.state}`}
                  className={`w-full p-2 rounded border opacity-80 cursor-not-allowed ${
                    isDarkMode ? 'bg-[#12100e] border-[#2e2720] text-white' : 'bg-stone-100 border-stone-300 text-stone-900'
                  }`}
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCreateProjectModalOpen(false)}
                className={`py-1.5 px-3 rounded text-xs font-semibold border ${
                  isDarkMode ? 'bg-[#241f1a] hover:bg-[#332b22] text-[#f4ede4] border-[#382f25]' : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-1.5 px-4 rounded text-xs font-bold bg-[#e5a93b] hover:bg-[#d97706] text-[#141210] shadow transition-colors"
              >
                Confirm Project Creation
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
