import React, { useState, useMemo } from 'react';
import { UnutilizedParcel } from '../../types';
import { UNUTILIZED_PARCELS } from '../../data/unutilizedParcelsData';
import { ParcelComparisonSwipe } from './ParcelComparisonSwipe';
import { LandDossierModal } from './LandDossierModal';
import {
  Layers,
  Search,
  Filter,
  MapPin,
  FileText,
  AlertTriangle,
  Building,
  Coins,
  TrendingUp,
  ShieldCheck,
  Compass,
  CheckCircle2,
  ExternalLink,
  Eye,
  Sliders,
  ChevronRight,
  Maximize2,
  Sparkles,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

interface ExploreParcelsModuleProps {
  isDarkMode?: boolean;
  onLocateOnMap: (parcel: UnutilizedParcel) => void;
}

export const ExploreParcelsModule: React.FC<ExploreParcelsModuleProps> = ({
  isDarkMode = true,
  onLocateOnMap,
}) => {
  const [parcelsList, setParcelsList] = useState<UnutilizedParcel[]>(UNUTILIZED_PARCELS);
  const [selectedParcel, setSelectedParcel] = useState<UnutilizedParcel>(UNUTILIZED_PARCELS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMinistry, setSelectedMinistry] = useState<string>('All');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [dossierModalOpen, setDossierModalOpen] = useState(false);
  const [locatingId, setLocatingId] = useState<string | null>(null);

  // Ministries list
  const ministries = useMemo(() => {
    const list = Array.from(new Set(UNUTILIZED_PARCELS.map((p) => p.custodianMinistry)));
    return ['All', ...list];
  }, []);

  // Districts list
  const districts = useMemo(() => {
    const list = Array.from(new Set(UNUTILIZED_PARCELS.map((p) => p.district)));
    return ['All', ...list];
  }, []);

  // Filtered Parcels
  const filteredParcels = useMemo(() => {
    return parcelsList.filter((p) => {
      if (selectedMinistry !== 'All' && p.custodianMinistry !== selectedMinistry) {
        return false;
      }
      if (selectedDistrict !== 'All' && p.district !== selectedDistrict) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          p.title.toLowerCase().includes(q) ||
          p.ulpin.toLowerCase().includes(q) ||
          p.khasraNo.toLowerCase().includes(q) ||
          p.taluka.toLowerCase().includes(q) ||
          p.district.toLowerCase().includes(q) ||
          p.custodianMinistry.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [parcelsList, selectedMinistry, selectedDistrict, searchQuery]);

  // Aggregate Metrics
  const totalUnusedHectares = useMemo(
    () => parcelsList.reduce((sum, p) => sum + p.unusedAreaHa, 0).toFixed(1),
    [parcelsList]
  );
  const totalDeadCapitalCr = useMemo(
    () => parcelsList.reduce((sum, p) => sum + p.deadCapitalCr, 0).toFixed(1),
    [parcelsList]
  );
  const totalStructuresDetected = useMemo(
    () => parcelsList.reduce((sum, p) => sum + p.unauthorizedStructuresCount, 0),
    [parcelsList]
  );

  // Handle Locate Click
  const handleLocateClick = async (parcel: UnutilizedParcel, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setLocatingId(parcel.id);
    try {
      // Backend spatial pinpoint API call
      await fetch(`/api/parcels/locate/${parcel.id}`);
    } catch {
      // Fallback seamlessly
    }
    setTimeout(() => {
      setLocatingId(null);
      onLocateOnMap(parcel);
    }, 500);
  };

  return (
    <div className={`flex flex-col h-full w-full overflow-hidden transition-colors ${
      isDarkMode ? 'bg-[#0e0c0a] text-[#f4ede4]' : 'bg-[#faf8f5] text-[#1c1917]'
    }`}>
      {/* ================= TOP METRICS BANNER ================= */}
      <div className={`px-6 py-3.5 border-b shrink-0 flex flex-wrap items-center justify-between gap-4 ${
        isDarkMode ? 'bg-[#15120f] border-[#2b241d]' : 'bg-white border-[#e7e5e4] shadow-sm'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 via-rose-500/20 to-teal-500/20 border border-amber-500/40 flex items-center justify-center text-[#e5a93b] shadow-inner">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight">
                Explore Unutilized &amp; Dormant Land Parcels
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono text-[10px] font-bold animate-pulse">
                LIVE CADASTRE TELEMETRY
              </span>
            </div>
            <p className={`text-xs ${isDarkMode ? 'text-[#a89f91]' : 'text-[#78716c]'}`}>
              Comprehensive repository of public, departmental, and institutional surplus lands with AI swipe comparison.
            </p>
          </div>
        </div>

        {/* Top Summary Badges */}
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2.5 ${
            isDarkMode ? 'bg-[#1e1a16] border-[#382f25]' : 'bg-[#f5f5f4] border-[#e7e5e4]'
          }`}>
            <Coins className="w-4 h-4 text-[#e5a93b]" />
            <div>
              <div className="text-[10px] uppercase font-semibold text-slate-400 leading-none">
                Locked Dead Capital
              </div>
              <div className="text-xs font-bold font-mono text-[#e5a93b] mt-0.5">
                ₹{totalDeadCapitalCr} Cr
              </div>
            </div>
          </div>

          <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2.5 ${
            isDarkMode ? 'bg-[#1e1a16] border-[#382f25]' : 'bg-[#f5f5f4] border-[#e7e5e4]'
          }`}>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <div>
              <div className="text-[10px] uppercase font-semibold text-slate-400 leading-none">
                Unused Land Mass
              </div>
              <div className="text-xs font-bold font-mono text-rose-400 mt-0.5">
                {totalUnusedHectares} Ha ({parcelsList.length} Parcels)
              </div>
            </div>
          </div>

          <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2.5 ${
            isDarkMode ? 'bg-[#1e1a16] border-[#382f25]' : 'bg-[#f5f5f4] border-[#e7e5e4]'
          }`}>
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <div>
              <div className="text-[10px] uppercase font-semibold text-slate-400 leading-none">
                Drift / Structures
              </div>
              <div className="text-xs font-bold font-mono text-teal-400 mt-0.5">
                {totalStructuresDetected} Detected
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= FILTER & SEARCH BAR ================= */}
      <div className={`px-6 py-2.5 border-b shrink-0 flex flex-wrap items-center justify-between gap-3 ${
        isDarkMode ? 'bg-[#12100d] border-[#2b241d]' : 'bg-[#fcfbf9] border-[#e7e5e4]'
      }`}>
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Khasra, ULPIN, Village, Ministry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-3 py-1.5 rounded-lg text-xs font-medium border focus:outline-none transition-colors ${
                isDarkMode
                  ? 'bg-[#1c1916] border-[#382f25] text-white placeholder-slate-500 focus:border-[#e5a93b]'
                  : 'bg-white border-[#e7e5e4] text-[#1c1917] placeholder-slate-400 focus:border-amber-600'
              }`}
            />
          </div>

          {/* Ministry Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <Building className="w-3.5 h-3.5 text-[#e5a93b]" />
            <span className="text-slate-400 text-[11px]">Ministry:</span>
            <select
              value={selectedMinistry}
              onChange={(e) => setSelectedMinistry(e.target.value)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border outline-none cursor-pointer ${
                isDarkMode
                  ? 'bg-[#1c1916] border-[#382f25] text-white'
                  : 'bg-white border-[#e7e5e4] text-[#1c1917]'
              }`}
            >
              {ministries.map((m) => (
                <option key={m} value={m} className={isDarkMode ? 'bg-[#161412]' : 'bg-white'}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* District Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <MapPin className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-slate-400 text-[11px]">District:</span>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border outline-none cursor-pointer ${
                isDarkMode
                  ? 'bg-[#1c1916] border-[#382f25] text-white'
                  : 'bg-white border-[#e7e5e4] text-[#1c1917]'
              }`}
            >
              {districts.map((d) => (
                <option key={d} value={d} className={isDarkMode ? 'bg-[#161412]' : 'bg-white'}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Showing <strong className="text-white">{filteredParcels.length}</strong> of {parcelsList.length} Dormant Parcels
        </div>
      </div>

      {/* ================= MAIN SPLIT CONTENT AREA ================= */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT COLUMN: LIST OF UNUTILIZED PARCELS */}
        <div className={`w-full lg:w-[420px] shrink-0 border-r flex flex-col overflow-hidden ${
          isDarkMode ? 'bg-[#100e0c] border-[#2b241d]' : 'bg-[#f8f6f2] border-[#e7e5e4]'
        }`}>
          <div className="p-3 bg-slate-950/40 border-b border-slate-800/80 text-[11px] font-semibold text-slate-400 flex items-center justify-between">
            <span>AVAILABLE UNUTILIZED LAND INVENTORY</span>
            <span className="text-[10px] text-[#e5a93b]">Click card to inspect</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
            {filteredParcels.map((parcel) => {
              const isSelected = selectedParcel.id === parcel.id;
              const isLocating = locatingId === parcel.id;

              return (
                <div
                  key={parcel.id}
                  onClick={() => setSelectedParcel(parcel)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer relative group ${
                    isSelected
                      ? isDarkMode
                        ? 'bg-[#221c17] border-[#e5a93b] ring-1 ring-[#e5a93b]/40 shadow-lg'
                        : 'bg-[#fffbeb] border-amber-500 ring-1 ring-amber-400/40 shadow-md'
                      : isDarkMode
                      ? 'bg-[#161310] hover:bg-[#1d1915] border-[#2e261e] text-[#d4cbbf]'
                      : 'bg-white hover:bg-[#f5f5f4] border-[#e7e5e4] text-[#44403c]'
                  }`}
                >
                  {/* Top Bar inside Card */}
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <div className="text-[10px] font-mono text-slate-400">
                        ULPIN: <span className="text-sky-400 font-semibold">{parcel.ulpin}</span>
                      </div>
                      <h4 className={`text-xs font-bold leading-snug mt-0.5 line-clamp-1 ${
                        isSelected ? (isDarkMode ? 'text-white' : 'text-[#1c1917]') : ''
                      }`}>
                        {parcel.title}
                      </h4>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/10 border border-rose-500/30 text-rose-400 shrink-0">
                      {parcel.dormancyYears} Yrs Idle
                    </span>
                  </div>

                  {/* Khasra & Custodian info */}
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 mb-2.5">
                    <span className="font-mono text-emerald-400 font-semibold">
                      Khasra: {parcel.khasraNo}
                    </span>
                    <span>&bull;</span>
                    <span>{parcel.custodianMinistry}</span>
                    <span>&bull;</span>
                    <span>{parcel.taluka}, {parcel.district}</span>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-3 gap-1.5 py-1.5 px-2 rounded-lg bg-slate-950/40 border border-slate-800/60 font-mono text-[10px] text-slate-300 mb-2.5">
                    <div>
                      <div className="text-slate-500 text-[9px]">TOTAL AREA</div>
                      <div className="font-bold text-emerald-400">{parcel.totalAreaHa} Ha</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-[9px]">UNUSED (%)</div>
                      <div className="font-bold text-rose-400">{parcel.unusedPercentage}%</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-[9px]">DEAD CAPITAL</div>
                      <div className="font-bold text-amber-400">₹{parcel.deadCapitalCr} Cr</div>
                    </div>
                  </div>

                  {/* Card Bottom Actions: LOCATE TOGGLE / BUTTON & VIEW DOSSIER */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedParcel(parcel);
                        setDossierModalOpen(true);
                      }}
                      className="flex items-center gap-1 text-[11px] font-semibold text-sky-400 hover:text-sky-300 hover:underline"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Dossier</span>
                    </button>

                    {/* Small Toggle / Button: LOCATE */}
                    <button
                      type="button"
                      disabled={isLocating}
                      onClick={(e) => handleLocateClick(parcel, e)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all shadow-sm ${
                        isLocating
                          ? 'bg-sky-500 text-slate-950 animate-pulse'
                          : isSelected
                          ? 'bg-[#e5a93b] hover:bg-[#d4992b] text-slate-950 ring-1 ring-amber-400/50'
                          : 'bg-sky-600 hover:bg-sky-500 text-white'
                      }`}
                      title="Locate this parcel on the GIS map"
                    >
                      {isLocating ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Locating...</span>
                        </>
                      ) : (
                        <>
                          <MapPin className="w-3 h-3" />
                          <span>Locate</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: PARCEL DEEP DIVE WITH SPLIT COMPARISON SWIPER & DOSSIER */}
        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-6">
          {/* Active Parcel Header & Quick Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-mono text-xs font-bold">
                  ULPIN: {selectedParcel.ulpin}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 font-mono text-xs">
                  {selectedParcel.khasraNo}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold mt-1 text-white tracking-tight">
                {selectedParcel.title}
              </h2>
              <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>{selectedParcel.tehsilDistrict}</span>
                <span>&bull;</span>
                <Building className="w-3.5 h-3.5 text-[#e5a93b]" />
                <span>Custodian: {selectedParcel.custodianMinistry}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setDossierModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 font-bold text-xs shadow-md transition-all"
              >
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Official Legal Dossier</span>
              </button>

              <button
                type="button"
                onClick={() => handleLocateClick(selectedParcel)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-sky-500/20 transition-all"
              >
                <MapPin className="w-4 h-4" />
                <span>Locate on Map View</span>
              </button>
            </div>
          </div>

          {/* ================= INTERACTIVE SPLIT SWIPE COMPARISON (IMAGE 3 & VIDEO STYLE) ================= */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <h3 className="font-bold text-sm text-white tracking-wide">
                  Interactive Spatial Drift &amp; Unused Land Swipe Comparison
                </h3>
              </div>
              <span className="text-[11px] font-mono text-cyan-300">
                Drag horizontal split handle &bull; Baseline vs Current
              </span>
            </div>

            {/* Split Comparison Slider Canvas */}
            <div className="h-[400px] w-full">
              <ParcelComparisonSwipe parcel={selectedParcel} isDarkMode={isDarkMode} />
            </div>
          </div>

          {/* ================= FOUR-CORNER DETAILED PARCEL ATTRIBUTES ================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Cadastral & Legal Tenure */}
            <div className={`p-4 rounded-xl border space-y-3 ${
              isDarkMode ? 'bg-[#15120f] border-[#2b241d]' : 'bg-white border-[#e7e5e4] shadow-sm'
            }`}>
              <div className="text-xs font-bold text-[#e5a93b] uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#e5a93b]" />
                <span>Cadastral Identification &amp; Ownership Tenure</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Khasra / Survey</span>
                  <span className="font-mono font-bold text-white">{selectedParcel.khasraNo}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Custodian Ministry</span>
                  <span className="font-bold text-white">{selectedParcel.custodianMinistry}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Tenure Classification</span>
                  <span className="font-semibold text-slate-200">{selectedParcel.tenureClassification}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Legal Title Status</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {selectedParcel.legalTitleStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Topography & Soil */}
            <div className={`p-4 rounded-xl border space-y-3 ${
              isDarkMode ? 'bg-[#15120f] border-[#2b241d]' : 'bg-white border-[#e7e5e4] shadow-sm'
            }`}>
              <div className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-2">
                <Compass className="w-4 h-4 text-teal-400" />
                <span>Physical Topography &amp; Soil Bearing</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Total Land Area</span>
                  <span className="font-mono font-bold text-white">
                    {selectedParcel.totalAreaHa} Ha ({selectedParcel.totalAreaAcres} Acres)
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Average Slope</span>
                  <span className="font-bold text-white">{selectedParcel.averageSlope}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Soil Bearing Capacity</span>
                  <span className="font-semibold text-slate-200">{selectedParcel.soilBearingCapacity}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Flood Plain Risk</span>
                  <span className="font-bold text-emerald-400">{selectedParcel.floodPlainRisk}</span>
                </div>
              </div>
            </div>

            {/* 3. Valuation & Dead Capital */}
            <div className={`p-4 rounded-xl border space-y-3 ${
              isDarkMode ? 'bg-[#15120f] border-[#2b241d]' : 'bg-white border-[#e7e5e4] shadow-sm'
            }`}>
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                <span>Economic Valuation &amp; Dead Capital</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Current Circle Rate</span>
                  <span className="font-mono font-bold text-white">{selectedParcel.currentCircleRate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Estimated Asset Value</span>
                  <span className="font-mono font-bold text-emerald-400">{selectedParcel.estimatedAssetValue}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Locked Dead Capital</span>
                  <span className="font-mono font-bold text-amber-400">₹{selectedParcel.deadCapitalCr} Crores</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Dormancy Classification</span>
                  <span className="font-semibold text-rose-300">{selectedParcel.deadCapitalClassification}</span>
                </div>
              </div>
            </div>

            {/* 4. Connectivity & Geospatial Grid */}
            <div className={`p-4 rounded-xl border space-y-3 ${
              isDarkMode ? 'bg-[#15120f] border-[#2b241d]' : 'bg-white border-[#e7e5e4] shadow-sm'
            }`}>
              <div className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sky-400" />
                <span>Connectivity &amp; Infrastructure Proximity</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Centroid Coordinates</span>
                  <span className="font-mono font-bold text-white">
                    {selectedParcel.centroidLat.toFixed(4)}°N, {selectedParcel.centroidLng.toFixed(4)}°E
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Highway Proximity</span>
                  <span className="font-semibold text-slate-200">{selectedParcel.highwayProximity}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Substation Grid</span>
                  <span className="font-semibold text-slate-200">{selectedParcel.substationGrid}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Satellite Telemetry</span>
                  <span className="text-[11px] text-teal-300 font-mono">Sentinel-2 Ingested</span>
                </div>
              </div>
            </div>
          </div>

          {/* Priority Siting & Monetization Action Badges */}
          <div className={`p-4 rounded-xl border space-y-2.5 ${
            isDarkMode ? 'bg-[#15120f] border-[#2b241d]' : 'bg-white border-[#e7e5e4] shadow-sm'
          }`}>
            <div className="text-xs font-bold text-[#e5a93b] uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#e5a93b]" />
              <span>Recommended Infrastructure Siting &amp; Public Monetization Yield</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedParcel.potentialUse.map((use, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                  <span>{use}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Official Legal Technical Land Dossier Modal */}
      <LandDossierModal
        parcel={selectedParcel}
        isOpen={dossierModalOpen}
        onClose={() => setDossierModalOpen(false)}
        onLocateOnMap={onLocateOnMap}
      />
    </div>
  );
};
