import React, { useState, useMemo } from 'react';
import {
  AreaTemporalData,
  TemporalDimensionWeights,
  TemporalFactor,
  TemporalYear,
} from '../../types/temporal';
import {
  AHMEDABAD_DISTRICT_TEMPORAL_SUMMARY,
  AHMEDABAD_TEMPORAL_AREAS,
  DEFAULT_TEMPORAL_WEIGHTS,
  TEMPORAL_YEARS,
  calculateWeightedTemporalScore,
} from '../../data/temporalData';
import { CircularPuzzleChart } from './CircularPuzzleChart';
import {
  TrendingUp,
  TrendingDown,
  Layers,
  Sparkles,
  MapPin,
  Calendar,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Info,
  Activity,
  Trees,
  Route,
  Users,
  Building,
  Building2,
  Compass,
  BarChart3,
  RotateCcw,
  Target,
  ExternalLink,
  ChevronRight,
  Navigation,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';

interface DevelopmentTrendsModuleProps {
  isDarkMode?: boolean;
  temporalAreas?: AreaTemporalData[];
  temporalSummary?: typeof AHMEDABAD_DISTRICT_TEMPORAL_SUMMARY;
  selectedYear: TemporalYear;
  onSelectYear: (year: TemporalYear) => void;
  selectedFactor: TemporalFactor;
  onSelectFactor: (factor: TemporalFactor) => void;
  selectedArea: AreaTemporalData | null;
  onSelectArea: (area: AreaTemporalData | null) => void;
  onFlyToArea?: (area: AreaTemporalData) => void;
  // Cascading Jurisdiction Props
  availableStates?: { id?: string; code?: string; name: string }[];
  selectedStateName?: string;
  onSelectState?: (stateName: string) => void;
  availableDistricts?: { id: string; name: string; state?: string }[];
  selectedDistrictId?: string;
  onSelectDistrict?: (districtId: string) => void;
  availableCities?: string[];
  selectedCityName?: string;
  onSelectCity?: (cityName: string) => void;
  aiPrompt?: string;
  onAiPromptChange?: (val: string) => void;
  onSendAiQuery?: (prompt: string) => void;
  aiLoading?: boolean;
  aiResponse?: string | null;
}

export const DevelopmentTrendsModule: React.FC<DevelopmentTrendsModuleProps> = ({
  isDarkMode = true,
  selectedYear,
  onSelectYear,
  selectedFactor,
  onSelectFactor,
  selectedArea,
  onSelectArea,
  onFlyToArea,
  availableStates = [{ code: 'GJ', id: 'gujarat', name: 'Gujarat' }],
  selectedStateName = 'Gujarat',
  onSelectState,
  availableDistricts = [{ id: 'dist-ahmedabad', name: 'Ahmedabad' }],
  selectedDistrictId = 'dist-ahmedabad',
  onSelectDistrict,
  availableCities = ['Ahmedabad City', 'Daskroi', 'Sanand', 'Bavla', 'Dholka', 'Dhandhuka', 'Dholera', 'Viramgam', 'Mandal', 'Detroj-Rampura'],
  selectedCityName = 'All',
  onSelectCity,
}) => {
  // Configurable Weights
  const [weights, setWeights] = useState<TemporalDimensionWeights>({ ...DEFAULT_TEMPORAL_WEIGHTS });
  const [showWeightsConfig, setShowWeightsConfig] = useState(false);

  // Active Deep-Dive Factor Tab
  const [activeFactorTab, setActiveFactorTab] = useState<'env' | 'access' | 'pop' | 'urban'>('env');

  const districtSummary = AHMEDABAD_DISTRICT_TEMPORAL_SUMMARY;
  const currentYearSummary = districtSummary.yearlySummaries[selectedYear];
  const baseline2022 = districtSummary.yearlySummaries[2022];

  // Dynamic Overall Score based on customizable weights
  const weightedOverallScore = useMemo(() => {
    return calculateWeightedTemporalScore(
      currentYearSummary.environmentalScore,
      currentYearSummary.accessibilityScore,
      currentYearSummary.populationPressureScore,
      currentYearSummary.urbanizationScore,
      weights
    );
  }, [currentYearSummary, weights]);

  // 5-Year Progression Data for Recharts Line Chart
  const lineChartData = useMemo(() => {
    return TEMPORAL_YEARS.map((yr) => {
      const summary = districtSummary.yearlySummaries[yr];
      const customScore = calculateWeightedTemporalScore(
        summary.environmentalScore,
        summary.accessibilityScore,
        summary.populationPressureScore,
        summary.urbanizationScore,
        weights
      );
      return {
        year: `${yr}`,
        yearNum: yr,
        score: customScore,
        env: summary.environmentalScore,
        access: summary.accessibilityScore,
        pop: summary.populationPressureScore,
        urban: summary.urbanizationScore,
        roadKm: summary.pavedRoadNetworkKm,
        phcCount: summary.primaryHealthCentersOperational,
        builtUp: summary.totalBuiltUpAreaSqKm,
      };
    });
  }, [districtSummary, weights]);

  // Overall Development Profile (Horizontal Bar Data)
  const dimensionProfileData = useMemo(() => {
    return [
      {
        name: 'Environmental Quality',
        shortName: 'Environment',
        score: currentYearSummary.environmentalScore,
        weight: `${weights.environment}%`,
        color: '#10b981', // Emerald
        bgColor: isDarkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
        benchmark: 65,
      },
      {
        name: 'Citizen Accessibility',
        shortName: 'Accessibility',
        score: currentYearSummary.accessibilityScore,
        weight: `${weights.accessibility}%`,
        color: '#0ea5e9', // Sky Blue
        bgColor: isDarkMode ? 'rgba(14, 165, 233, 0.15)' : 'rgba(14, 165, 233, 0.1)',
        benchmark: 70,
      },
      {
        name: 'Population Pressure',
        shortName: 'Population',
        score: currentYearSummary.populationPressureScore,
        weight: `${weights.population}%`,
        color: '#a855f7', // Purple
        bgColor: isDarkMode ? 'rgba(168, 85, 247, 0.15)' : 'rgba(168, 85, 247, 0.1)',
        benchmark: 60,
      },
      {
        name: 'Urbanization Level',
        shortName: 'Urbanization',
        score: currentYearSummary.urbanizationScore,
        weight: `${weights.urbanization}%`,
        color: '#f59e0b', // Amber
        bgColor: isDarkMode ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)',
        benchmark: 65,
      },
    ];
  }, [currentYearSummary, weights, isDarkMode]);

  // Supporting Factor Breakdowns for the 4 dimensions
  const environmentalFactorsData = useMemo(() => {
    // Average across areas for selected year
    const areas = AHMEDABAD_TEMPORAL_AREAS;
    const avg = (fn: (a: AreaTemporalData) => number) =>
      Number((areas.reduce((acc, a) => acc + fn(a), 0) / areas.length).toFixed(1));

    return [
      { factor: 'Green Cover %', value: avg((a) => a.yearlyMetrics[selectedYear].greenCoverPercent), max: 100, unit: '%' },
      { factor: 'Water Availability', value: avg((a) => a.yearlyMetrics[selectedYear].waterAvailabilityScore), max: 100, unit: '/100' },
      { factor: 'Water Stress Mitigation', value: avg((a) => a.yearlyMetrics[selectedYear].waterStressMitigationScore), max: 100, unit: '/100' },
      { factor: 'Agri Land Preserved', value: avg((a) => a.yearlyMetrics[selectedYear].agriculturalLandPreservedPercent), max: 100, unit: '%' },
      { factor: 'Flood Resilience', value: avg((a) => a.yearlyMetrics[selectedYear].floodResilienceScore), max: 100, unit: '/100' },
    ];
  }, [selectedYear]);

  const accessibilityFactorsData = useMemo(() => {
    const areas = AHMEDABAD_TEMPORAL_AREAS;
    const avg = (fn: (a: AreaTemporalData) => number) =>
      Number((areas.reduce((acc, a) => acc + fn(a), 0) / areas.length).toFixed(1));

    return [
      { factor: 'Road Connectivity', value: avg((a) => a.yearlyMetrics[selectedYear].roadConnectivityScore), max: 100, unit: '/100' },
      { factor: 'Healthcare Access', value: avg((a) => a.yearlyMetrics[selectedYear].healthcareAccessScore), max: 100, unit: '/100' },
      { factor: 'Education Access', value: avg((a) => a.yearlyMetrics[selectedYear].educationAccessScore), max: 100, unit: '/100' },
      { factor: 'Public Transport', value: avg((a) => a.yearlyMetrics[selectedYear].publicTransportScore), max: 100, unit: '/100' },
      { factor: 'Digital Connectivity', value: avg((a) => a.yearlyMetrics[selectedYear].digitalConnectivityScore), max: 100, unit: '/100' },
    ];
  }, [selectedYear]);

  // Ranked Priority Development Zones for Selected Year (optionally filtered by selected taluka/city)
  const rankedZones = useMemo(() => {
    let zones = [...AHMEDABAD_TEMPORAL_AREAS];
    if (selectedCityName !== 'All') {
      const filtered = zones.filter(
        (z) =>
          z.taluka.toLowerCase() === selectedCityName.toLowerCase() ||
          z.name.toLowerCase().includes(selectedCityName.toLowerCase())
      );
      if (filtered.length > 0) {
        zones = filtered;
      }
    }
    return zones.sort(
      (a, b) => b.yearlyMetrics[selectedYear].dniDeficitScore - a.yearlyMetrics[selectedYear].dniDeficitScore
    );
  }, [selectedYear, selectedCityName]);

  // Change since 2022 Baseline calculations
  const changeSinceBaseline = useMemo(() => {
    const overallDelta = Number((currentYearSummary.overallDevelopmentScore - baseline2022.overallDevelopmentScore).toFixed(1));
    const envDelta = Number((currentYearSummary.environmentalScore - baseline2022.environmentalScore).toFixed(1));
    const accDelta = Number((currentYearSummary.accessibilityScore - baseline2022.accessibilityScore).toFixed(1));
    const popDelta = Number((currentYearSummary.populationPressureScore - baseline2022.populationPressureScore).toFixed(1));
    const urbDelta = Number((currentYearSummary.urbanizationScore - baseline2022.urbanizationScore).toFixed(1));

    return {
      overall: { val: overallDelta, pct: Number(((overallDelta / baseline2022.overallDevelopmentScore) * 100).toFixed(1)) },
      env: { val: envDelta, pct: Number(((envDelta / baseline2022.environmentalScore) * 100).toFixed(1)) },
      acc: { val: accDelta, pct: Number(((accDelta / baseline2022.accessibilityScore) * 100).toFixed(1)) },
      pop: { val: popDelta, pct: Number(((popDelta / baseline2022.populationPressureScore) * 100).toFixed(1)) },
      urb: { val: urbDelta, pct: Number(((urbDelta / baseline2022.urbanizationScore) * 100).toFixed(1)) },
    };
  }, [currentYearSummary, baseline2022]);

  return (
    <div className="space-y-4">
      {/* 1. SELECT JURISDICTION CARD (Top Level) */}
      <div className={`rounded-lg p-3.5 border transition-all space-y-2.5 ${
        isDarkMode ? 'bg-[#181512] border-[#2e2720]' : 'bg-[#fafaf9] border-[#e7e5e4]'
      }`}>
        <div className={`text-xs font-bold tracking-wide uppercase pb-1.5 border-b flex items-center justify-between ${
          isDarkMode ? 'text-[#e5dfd7] border-[#282119]' : 'text-[#292524] border-[#e7e5e4]'
        }`}>
          <span>SELECT JURISDICTION</span>
        </div>

        <div className="space-y-2 text-xs">
          {/* Step 1: State Selection */}
          <div className="space-y-1">
            <label htmlFor="analytics-select-state" className={`flex items-center gap-1 font-semibold text-[11px] ${
              isDarkMode ? 'text-[#a8a195]' : 'text-[#57534e]'
            }`}>
              <Building className="w-3.5 h-3.5 text-[#e5a93b]" />
              <span>STATE :</span>
            </label>
            <select
              id="analytics-select-state"
              value={selectedStateName}
              onChange={(e) => onSelectState?.(e.target.value)}
              className={`w-full px-2.5 py-1.5 rounded border text-xs font-semibold outline-none cursor-pointer transition-colors ${
                isDarkMode
                  ? 'bg-[#14110e] border-[#2e2720] text-[#f4ede4] focus:border-[#e5a93b]'
                  : 'bg-white border-[#e7e5e4] text-[#1c1917] focus:border-[#d97706]'
              }`}
            >
              {availableStates.map((st) => (
                <option key={st.code || st.id || st.name} value={st.name} className={isDarkMode ? 'bg-[#181512] text-white' : 'bg-white text-black'}>
                  {st.name}
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: District Selection */}
          <div className="space-y-1">
            <label htmlFor="analytics-select-district" className={`flex items-center gap-1 font-semibold text-[11px] ${
              isDarkMode ? 'text-[#a8a195]' : 'text-[#57534e]'
            }`}>
              <MapPin className="w-3.5 h-3.5 text-[#e5a93b]" />
              <span>DISTRICT :</span>
            </label>
            <select
              id="analytics-select-district"
              value={selectedDistrictId}
              onChange={(e) => onSelectDistrict?.(e.target.value)}
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
            <label htmlFor="analytics-select-city" className={`flex items-center gap-1 font-semibold text-[11px] ${
              isDarkMode ? 'text-[#a8a195]' : 'text-[#57534e]'
            }`}>
              <Navigation className="w-3.5 h-3.5 text-[#e5a93b]" />
              <span>CITY / TALUKA :</span>
            </label>
            <select
              id="analytics-select-city"
              value={selectedCityName}
              onChange={(e) => onSelectCity?.(e.target.value)}
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

      {/* 2. TEMPORAL YEAR SELECTION & FACTOR CONTROLS (Directly following Jurisdiction) */}
      <div className={`p-4 rounded-xl border transition-all ${
        isDarkMode ? 'bg-[#181512] border-[#2e2720]' : 'bg-[#fafaf9] border-[#e7e5e4] shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className={`text-sm font-extrabold uppercase tracking-wider ${
              isDarkMode ? 'text-white' : 'text-[#1c1917]'
            }`}>
              DEVELOPMENT TRENDS
            </h2>
          </div>

          {/* 5 Compact Year Toggle Buttons */}
          <div className="flex items-center gap-1.5 p-1 rounded-lg border shrink-0 self-start sm:self-auto bg-inherit">
            {TEMPORAL_YEARS.map((year) => {
              const isSelected = selectedYear === year;
              return (
                <button
                  key={year}
                  type="button"
                  onClick={() => onSelectYear(year)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-[#e5a93b] text-[#141210] shadow-sm ring-1 ring-[#e5a93b]/50'
                      : isDarkMode
                      ? 'text-[#a89f91] hover:text-white hover:bg-[#26201a]'
                      : 'text-[#78716c] hover:text-[#1c1917] hover:bg-[#f5f5f4]'
                  }`}
                >
                  {year}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Visual Circular Puzzle Chart & Executive Dimensional KPI View */}
      <CircularPuzzleChart
        selectedFactor={selectedFactor}
        onSelectFactor={onSelectFactor}
        selectedYear={selectedYear}
        weightedOverallScore={weightedOverallScore}
        currentYearSummary={currentYearSummary}
        changeSinceBaseline={changeSinceBaseline}
        isDarkMode={isDarkMode}
      />

      {/* 3. Main Chart Module: 5-Year Progression Line Chart */}
      <div className={`p-4 rounded-xl border transition-all ${
        isDarkMode ? 'bg-[#181512] border-[#2e2720]' : 'bg-[#fafaf9] border-[#e7e5e4]'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-inherit">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#e5a93b]" />
              <h3 className={`text-xs font-bold uppercase tracking-wider ${
                isDarkMode ? 'text-white' : 'text-[#1c1917]'
              }`}>
                5-Year Development Score Progression (2022 &ndash; 2026)
              </h3>
            </div>
            <p className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-[#8e8577]' : 'text-[#78716c]'}`}>
              Temporal line chart tracking overall development trajectory and active year marker.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 font-semibold text-[#e5a93b]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#e5a93b]" />
              Overall Score
            </span>
            <span className={`flex items-center gap-1 font-medium ${isDarkMode ? 'text-[#8e8577]' : 'text-[#78716c]'}`}>
              <span className="w-2.5 h-0.5 bg-sky-500" />
              Accessibility
            </span>
            <span className={`flex items-center gap-1 font-medium ${isDarkMode ? 'text-[#8e8577]' : 'text-[#78716c]'}`}>
              <span className="w-2.5 h-0.5 bg-emerald-500" />
              Environment
            </span>
          </div>
        </div>

        {/* Recharts Line Chart */}
        <div className="h-56 w-full pt-3">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#282119' : '#e7e5e4'} vertical={false} />
              <XAxis
                dataKey="year"
                stroke={isDarkMode ? '#8e8577' : '#a8a29e'}
                fontSize={11}
                tickLine={false}
              />
              <YAxis
                domain={[20, 100]}
                stroke={isDarkMode ? '#8e8577' : '#a8a29e'}
                fontSize={11}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className={`p-2.5 rounded-lg border shadow-xl text-xs font-sans space-y-1 ${
                        isDarkMode ? 'bg-[#141210] border-[#3d3328] text-[#f4ede4]' : 'bg-white border-[#e7e5e4] text-[#1c1917]'
                      }`}>
                        <div className="font-bold border-b pb-1 border-inherit flex items-center justify-between gap-4">
                          <span>Year {label}</span>
                          <span className="text-[#e5a93b] font-mono">{data.score}/100</span>
                        </div>
                        <div className="space-y-0.5 text-[11px] pt-0.5">
                          <div className="flex justify-between gap-3 text-sky-400">
                            <span>Accessibility:</span>
                            <span className="font-mono font-bold">{data.access}/100</span>
                          </div>
                          <div className="flex justify-between gap-3 text-emerald-400">
                            <span>Environmental:</span>
                            <span className="font-mono font-bold">{data.env}/100</span>
                          </div>
                          <div className="flex justify-between gap-3 text-purple-400">
                            <span>Population Pressure:</span>
                            <span className="font-mono font-bold">{data.pop}/100</span>
                          </div>
                          <div className="flex justify-between gap-3 text-amber-400">
                            <span>Urbanization:</span>
                            <span className="font-mono font-bold">{data.urban}/100</span>
                          </div>
                          <div className="flex justify-between gap-3 text-stone-400 pt-1 border-t border-inherit">
                            <span>Paved Roads:</span>
                            <span className="font-mono">{data.roadKm} km</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine
                x={`${selectedYear}`}
                stroke="#e5a93b"
                strokeDasharray="4 4"
                label={{
                  value: `Selected (${selectedYear})`,
                  position: 'top',
                  fill: '#e5a93b',
                  fontSize: 10,
                  fontWeight: 'bold',
                }}
              />
              <Line
                type="monotone"
                dataKey="access"
                stroke="#0ea5e9"
                strokeWidth={1.8}
                strokeDasharray="3 3"
                dot={{ r: 2.5, fill: '#0ea5e9' }}
              />
              <Line
                type="monotone"
                dataKey="env"
                stroke="#10b981"
                strokeWidth={1.8}
                strokeDasharray="3 3"
                dot={{ r: 2.5, fill: '#10b981' }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#e5a93b"
                strokeWidth={3.5}
                dot={{ r: 5, fill: '#e5a93b', stroke: isDarkMode ? '#181512' : '#ffffff', strokeWidth: 2 }}
                activeDot={{ r: 7, fill: '#f59e0b' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Dynamic Improvement Narrative */}
        <div className={`mt-2 p-2.5 rounded-lg border text-xs leading-relaxed flex items-center gap-2 ${
          isDarkMode ? 'bg-[#141210] border-[#2a241e] text-[#d4cbbf]' : 'bg-white border-[#e7e5e4] text-[#44403c]'
        }`}>
          <Info className="w-4 h-4 text-[#e5a93b] shrink-0" />
          <span>
            Overall development in Ahmedabad improved by <b className="text-[#e5a93b]">+{districtSummary.fiveYearGrowth.overallImprovementPercent}%</b> from 2022 (52.4) to 2026 (81.4), driven by <b className={isDarkMode ? 'text-white' : 'text-[#1c1917]'}>{districtSummary.fiveYearGrowth.fastestGrowingSector}</b> (+104.8% connectivity gain).
          </span>
        </div>
      </div>

      {/* 4. Overall Development Profile (Horizontal Bar Chart + Weighting Methodology) */}
      <div className={`p-4 rounded-xl border transition-all ${
        isDarkMode ? 'bg-[#181512] border-[#2e2720]' : 'bg-[#fafaf9] border-[#e7e5e4]'
      }`}>
        <div className="flex items-center justify-between pb-3 border-b border-inherit">
          <div>
            <h3 className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-[#1c1917]'}`}>
              Overall Development Profile & Dimension Weighting ({selectedYear})
            </h3>
            <p className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-[#8e8577]' : 'text-[#78716c]'}`}>
              Horizontal score distribution across the four core developmental pillars.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowWeightsConfig(!showWeightsConfig)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold transition-colors border ${
              showWeightsConfig
                ? 'bg-[#e5a93b] text-[#141210] border-[#e5a93b]'
                : isDarkMode
                ? 'bg-[#241f1a] text-[#c7bcaf] border-[#3d3328] hover:text-white'
                : 'bg-white text-[#44403c] border-[#e7e5e4] hover:bg-[#f5f5f4]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-[#e5a93b]" />
            <span>Configure Weights</span>
          </button>
        </div>

        {/* Weights Configurator Dropdown */}
        {showWeightsConfig && (
          <div className={`p-3 my-3 rounded-lg border space-y-3 animate-in fade-in duration-150 ${
            isDarkMode ? 'bg-[#141210] border-[#332b22]' : 'bg-white border-[#e7e5e4]'
          }`}>
            <div className="flex items-center justify-between text-xs font-bold">
              <span className={isDarkMode ? 'text-white' : 'text-[#1c1917]'}>Custom MCDA Dimension Weights</span>
              <button
                type="button"
                onClick={() => setWeights({ ...DEFAULT_TEMPORAL_WEIGHTS })}
                className="text-[11px] text-[#e5a93b] hover:underline flex items-center gap-1 font-semibold"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Defaults (25 / 30 / 20 / 25)
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className={`text-[10px] font-bold block ${isDarkMode ? 'text-[#8e8577]' : 'text-[#78716c]'}`}>
                  Environment ({weights.environment}%)
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={weights.environment}
                  onChange={(e) => setWeights({ ...weights, environment: Number(e.target.value) })}
                  className="w-full h-1.5 bg-[#2a241e] rounded-lg appearance-none cursor-pointer accent-[#10b981]"
                />
              </div>

              <div>
                <label className={`text-[10px] font-bold block ${isDarkMode ? 'text-[#8e8577]' : 'text-[#78716c]'}`}>
                  Accessibility ({weights.accessibility}%)
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={weights.accessibility}
                  onChange={(e) => setWeights({ ...weights, accessibility: Number(e.target.value) })}
                  className="w-full h-1.5 bg-[#2a241e] rounded-lg appearance-none cursor-pointer accent-[#0ea5e9]"
                />
              </div>

              <div>
                <label className={`text-[10px] font-bold block ${isDarkMode ? 'text-[#8e8577]' : 'text-[#78716c]'}`}>
                  Population ({weights.population}%)
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={weights.population}
                  onChange={(e) => setWeights({ ...weights, population: Number(e.target.value) })}
                  className="w-full h-1.5 bg-[#2a241e] rounded-lg appearance-none cursor-pointer accent-[#a855f7]"
                />
              </div>

              <div>
                <label className={`text-[10px] font-bold block ${isDarkMode ? 'text-[#8e8577]' : 'text-[#78716c]'}`}>
                  Urbanization ({weights.urbanization}%)
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={weights.urbanization}
                  onChange={(e) => setWeights({ ...weights, urbanization: Number(e.target.value) })}
                  className="w-full h-1.5 bg-[#2a241e] rounded-lg appearance-none cursor-pointer accent-[#f59e0b]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Horizontal Progress Bars */}
        <div className="space-y-3 pt-3">
          {dimensionProfileData.map((dim) => (
            <div key={dim.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className={`font-semibold ${isDarkMode ? 'text-[#f4ede4]' : 'text-[#1c1917]'}`}>
                  {dim.name} <span className={`text-[10px] ${isDarkMode ? 'text-[#8e8577]' : 'text-[#a8a29e]'}`}>({dim.weight} weight)</span>
                </span>
                <span className="font-mono font-bold" style={{ color: dim.color }}>
                  {dim.score} / 100
                </span>
              </div>
              <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-[#241f1a]' : 'bg-[#e7e5e4]'}`}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${dim.score}%`,
                    backgroundColor: dim.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Factor Analysis Deep-Dive (Environmental, Accessibility, Population, Urbanization) */}
      <div className={`p-4 rounded-xl border transition-all ${
        isDarkMode ? 'bg-[#181512] border-[#2e2720]' : 'bg-[#fafaf9] border-[#e7e5e4]'
      }`}>
        {/* Factor Tabs */}
        <div className="flex items-center gap-2 border-b border-inherit pb-2">
          {[
            { id: 'env' as const, label: 'Environmental Factor', color: 'emerald' },
            { id: 'access' as const, label: 'Citizen Accessibility', color: 'sky' },
            { id: 'pop' as const, label: 'Population & Demographics', color: 'purple' },
            { id: 'urban' as const, label: 'Urbanization Analysis', color: 'amber' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFactorTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeFactorTab === tab.id
                  ? 'bg-[#e5a93b] text-[#141210] shadow-sm'
                  : isDarkMode
                  ? 'text-[#a89f91] hover:text-white hover:bg-[#241f1a]'
                  : 'text-[#78716c] hover:text-[#1c1917] hover:bg-[#f5f5f4]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content: Environmental */}
        {activeFactorTab === 'env' && (
          <div className="pt-3 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Supporting Factors Bar Chart */}
              <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-[#141210] border-[#2a241e]' : 'bg-white border-[#e7e5e4]'}`}>
                <div className="text-xs font-bold uppercase tracking-wider mb-2 text-emerald-500">
                  Supporting Environmental Factors ({selectedYear})
                </div>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={environmentalFactorsData} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="2 2" stroke={isDarkMode ? '#241f1a' : '#f5f5f4'} horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} stroke={isDarkMode ? '#8e8577' : '#a8a29e'} fontSize={10} />
                      <YAxis type="category" dataKey="factor" stroke={isDarkMode ? '#8e8577' : '#a8a29e'} fontSize={10} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            return (
                              <div className={`p-2 rounded border text-xs shadow-lg ${isDarkMode ? 'bg-[#1c1916] border-[#3d3328] text-white' : 'bg-white border-[#e7e5e4]'}`}>
                                <span className="font-bold">{d.factor}: </span>
                                <span className="text-emerald-400 font-mono font-bold">{d.value}{d.unit}</span>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Environmental Stats & Insights */}
              <div className="space-y-2 text-xs">
                <div className={`p-2.5 rounded-lg border ${isDarkMode ? 'bg-[#141210] border-[#2a241e]' : 'bg-white border-[#e7e5e4]'}`}>
                  <span className={`text-[10px] uppercase font-bold block ${isDarkMode ? 'text-[#8e8577]' : 'text-[#78716c]'}`}>
                    Total Forest Cover
                  </span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-[#1c1917]'}`}>
                      {currentYearSummary.totalForestCoverSqKm} sq.km ({currentYearSummary.forestCoverPercent}%)
                    </span>
                    <span className="text-[11px] text-amber-500 font-semibold">-22.4 km² (-2.7%) vs '22</span>
                  </div>
                </div>

                <div className={`p-2.5 rounded-lg border ${isDarkMode ? 'bg-[#141210] border-[#2a241e]' : 'bg-white border-[#e7e5e4]'}`}>
                  <span className={`text-[10px] uppercase font-bold block ${isDarkMode ? 'text-[#8e8577]' : 'text-[#78716c]'}`}>
                    Water Catchment & Reservoirs
                  </span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-[#1c1917]'}`}>
                      {currentYearSummary.waterCatchmentCapacityMCM} MCM ({currentYearSummary.waterBodyCount} bodies)
                    </span>
                    <span className="text-[11px] text-emerald-500 font-semibold">+107.5 MCM (+51.0%)</span>
                  </div>
                </div>

                <div className={`p-2.5 rounded-lg border ${isDarkMode ? 'bg-[#141210] border-[#2a241e]' : 'bg-white border-[#e7e5e4]'}`}>
                  <span className={`text-[10px] uppercase font-bold block ${isDarkMode ? 'text-[#8e8577]' : 'text-[#78716c]'}`}>
                    Critical Ecological Vulnerability
                  </span>
                  <p className={`mt-0.5 leading-tight ${isDarkMode ? 'text-[#d4cbbf]' : 'text-[#44403c]'}`}>
                    Devgadh Baria & Dhanpur foothill boundaries face moderate grazing and built-up encroachment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Accessibility */}
        {activeFactorTab === 'access' && (
          <div className="pt-3 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Supporting Accessibility Bar Chart */}
              <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-[#141210] border-[#2a241e]' : 'bg-white border-[#e7e5e4]'}`}>
                <div className="text-xs font-bold uppercase tracking-wider mb-2 text-sky-500">
                  Citizen Accessibility Breakdown ({selectedYear})
                </div>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={accessibilityFactorsData} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="2 2" stroke={isDarkMode ? '#241f1a' : '#f5f5f4'} horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} stroke={isDarkMode ? '#8e8577' : '#a8a29e'} fontSize={10} />
                      <YAxis type="category" dataKey="factor" stroke={isDarkMode ? '#8e8577' : '#a8a29e'} fontSize={10} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            return (
                              <div className={`p-2 rounded border text-xs shadow-lg ${isDarkMode ? 'bg-[#1c1916] border-[#3d3328] text-white' : 'bg-white border-[#e7e5e4]'}`}>
                                <span className="font-bold">{d.factor}: </span>
                                <span className="text-sky-400 font-mono font-bold">{d.value}{d.unit}</span>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="value" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Key Connectivity Milestones */}
              <div className="space-y-2 text-xs">
                <div className={`p-2.5 rounded-lg border ${isDarkMode ? 'bg-[#141210] border-[#2a241e]' : 'bg-white border-[#e7e5e4]'}`}>
                  <span className={`text-[10px] uppercase font-bold block ${isDarkMode ? 'text-[#8e8577]' : 'text-[#78716c]'}`}>
                    Paved Road Network (PMGSY / State Hwy)
                  </span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-[#1c1917]'}`}>
                      {currentYearSummary.pavedRoadNetworkKm} km ({currentYearSummary.villagesWithAllWeatherRoadsPercent}% villages)
                    </span>
                    <span className="text-[11px] text-emerald-500 font-semibold">+1,050 km (+57.1%)</span>
                  </div>
                </div>

                <div className={`p-2.5 rounded-lg border ${isDarkMode ? 'bg-[#141210] border-[#2a241e]' : 'bg-white border-[#e7e5e4]'}`}>
                  <span className={`text-[10px] uppercase font-bold block ${isDarkMode ? 'text-[#8e8577]' : 'text-[#78716c]'}`}>
                    Healthcare Facility Density
                  </span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-[#1c1917]'}`}>
                      {currentYearSummary.hospitalsOperational} Hospitals &bull; {currentYearSummary.primaryHealthCentersOperational} PHCs
                    </span>
                    <span className="text-[11px] text-emerald-500 font-semibold">+12 Hos / +28 PHCs</span>
                  </div>
                </div>

                <div className={`p-2.5 rounded-lg border ${isDarkMode ? 'bg-[#141210] border-[#2a241e]' : 'bg-white border-[#e7e5e4]'}`}>
                  <span className={`text-[10px] uppercase font-bold block ${isDarkMode ? 'text-[#8e8577]' : 'text-[#78716c]'}`}>
                    Avg Travel to Emergency Trauma Care
                  </span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className={`text-base font-bold text-emerald-500`}>
                      {currentYearSummary.avgDistanceToEmergencyCareKm} km
                    </span>
                    <span className="text-[11px] text-emerald-500 font-semibold">Reduced from 28.5 km (2022)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Population & Demographics */}
        {activeFactorTab === 'pop' && (
          <div className="pt-3 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-[#141210] border-[#2a241e]' : 'bg-white border-[#e7e5e4]'}`}>
                <span className={`text-[10px] uppercase font-bold block ${isDarkMode ? 'text-[#8e8577]' : 'text-[#78716c]'}`}>
                  Total Inhabitants
                </span>
                <div className="text-xl font-bold mt-1 text-purple-400">
                  {currentYearSummary.totalPopulation.toLocaleString()}
                </div>
                <div className="text-[11px] text-emerald-500 mt-1">
                  +188,000 citizens (+8.8% growth since 2022)
                </div>
              </div>

              <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-[#141210] border-[#2a241e]' : 'bg-white border-[#e7e5e4]'}`}>
                <span className={`text-[10px] uppercase font-bold block ${isDarkMode ? 'text-[#8e8577]' : 'text-[#78716c]'}`}>
                  Rural vs Urban Split
                </span>
                <div className="text-xl font-bold mt-1 text-sky-400">
                  {currentYearSummary.ruralPopulationPercent}% / {currentYearSummary.urbanPopulationPercent}%
                </div>
                <div className="text-[11px] text-amber-500 mt-1">
                  Urban share rose from 12.8% to 19.5%
                </div>
              </div>

              <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-[#141210] border-[#2a241e]' : 'bg-white border-[#e7e5e4]'}`}>
                <span className={`text-[10px] uppercase font-bold block ${isDarkMode ? 'text-[#8e8577]' : 'text-[#78716c]'}`}>
                  Tribal Demographics (ST)
                </span>
                <div className="text-xl font-bold mt-1 text-emerald-400">
                  74.3%
                </div>
                <div className="text-[11px] text-emerald-500 mt-1">
                  Corridor priority target for equity welfare
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Urbanization */}
        {activeFactorTab === 'urban' && (
          <div className="pt-3 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-[#141210] border-[#2a241e]' : 'bg-white border-[#e7e5e4]'}`}>
                <span className={`text-[10px] uppercase font-bold block ${isDarkMode ? 'text-[#8e8577]' : 'text-[#78716c]'}`}>
                  Built-Up Spatial Footprint
                </span>
                <div className="text-xl font-bold mt-1 text-amber-400">
                  {currentYearSummary.totalBuiltUpAreaSqKm} sq.km
                </div>
                <div className="text-[11px] text-emerald-500 mt-1">
                  +154 sq.km (+63.6%) spatial footprint
                </div>
              </div>

              <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-[#141210] border-[#2a241e]' : 'bg-white border-[#e7e5e4]'}`}>
                <span className={`text-[10px] uppercase font-bold block ${isDarkMode ? 'text-[#8e8577]' : 'text-[#78716c]'}`}>
                  Cumulative CapEx Investment
                </span>
                <div className="text-xl font-bold mt-1 text-emerald-400">
                  ₹{currentYearSummary.infrastructureInvestmentCr} Cr
                </div>
                <div className="text-[11px] text-emerald-500 mt-1">
                  Smart City, PMGSY & Tribal Development Outlay
                </div>
              </div>

              <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-[#141210] border-[#2a241e]' : 'bg-white border-[#e7e5e4]'}`}>
                <span className={`text-[10px] uppercase font-bold block ${isDarkMode ? 'text-[#8e8577]' : 'text-[#78716c]'}`}>
                  Commercial Growth Index
                </span>
                <div className="text-xl font-bold mt-1 text-purple-400">
                  {currentYearSummary.commercialGrowthIndex} / 100
                </div>
                <div className="text-[11px] text-emerald-500 mt-1">
                  Doubled from 42.0 (2022) to 88.0 (2026)
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 6. Ranked Priority Development Zones & Area-Level Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left: Ranked Priority Zones (7 cols) */}
        <div className={`lg:col-span-7 p-4 rounded-xl border transition-all ${
          isDarkMode ? 'bg-[#181512] border-[#2e2720]' : 'bg-[#fafaf9] border-[#e7e5e4]'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-inherit">
            <div>
              <div className="flex items-center gap-1.5">
                <Target className="w-4 h-4 text-[#e5a93b]" />
                <h3 className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-[#1c1917]'}`}>
                  Priority Development Zones ({selectedYear})
                </h3>
              </div>
              <p className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-[#8e8577]' : 'text-[#78716c]'}`}>
                Click any zone to fly map & inspect temporal indicators.
              </p>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${
              isDarkMode ? 'bg-[#221c17] text-[#e5a93b] border-[#3d3328]' : 'bg-[#fef3c7] text-[#b45309] border-[#fde68a]'
            }`}>
              {rankedZones.length} Zones Tracked
            </span>
          </div>

          {/* List of Zones */}
          <div className="space-y-2 pt-3 max-h-80 overflow-y-auto custom-scrollbar pr-1">
            {rankedZones.map((zone, index) => {
              const metrics = zone.yearlyMetrics[selectedYear];
              const isSelected = selectedArea?.id === zone.id;
              return (
                <div
                  key={zone.id}
                  onClick={() => {
                    onSelectArea(zone);
                    if (onFlyToArea) onFlyToArea(zone);
                  }}
                  className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? isDarkMode
                        ? 'bg-[#2b241d] border-[#e5a93b] ring-1 ring-[#e5a93b]/50'
                        : 'bg-[#fef3c7] border-[#d97706] ring-1 ring-[#d97706]/40'
                      : isDarkMode
                      ? 'bg-[#141210] border-[#2a241e] hover:border-[#3d3328]'
                      : 'bg-white border-[#e7e5e4] hover:border-[#d6d3d1]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs shrink-0 ${
                        index === 0
                          ? 'bg-[#e5a93b] text-[#141210]'
                          : isDarkMode
                          ? 'bg-[#241f1a] text-[#c7bcaf] border border-[#3d3328]'
                          : 'bg-[#f5f5f4] text-[#44403c] border border-[#e7e5e4]'
                      }`}>
                        #{zone.badgeNumber}
                      </span>
                      <div>
                        <div className={`font-bold text-xs ${isDarkMode ? 'text-white' : 'text-[#1c1917]'}`}>
                          {zone.name}
                        </div>
                        <div className={`text-[10px] ${isDarkMode ? 'text-[#8e8577]' : 'text-[#78716c]'}`}>
                          Taluka: <b>{zone.taluka}</b> &bull; Pop: {(metrics.totalPopulation / 1000).toFixed(0)}k ({metrics.tribalConcentrationPercent}% ST)
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold text-[#e5a93b]">
                        Score: {metrics.overallScore}/100
                      </span>
                      <div className="text-[10px] text-rose-500 font-semibold">
                        DNI Deficit: {metrics.dniDeficitScore}
                      </div>
                    </div>
                  </div>

                  <div className={`mt-2 pt-1.5 border-t flex items-center justify-between text-[10px] ${
                    isDarkMode ? 'border-[#241f1a] text-[#a89f91]' : 'border-[#f5f5f4] text-[#78716c]'
                  }`}>
                    <span className="truncate max-w-[280px]">
                      <b>Gap:</b> {metrics.primaryDeficitCategory}
                    </span>
                    <span className="text-[#e5a93b] font-semibold flex items-center gap-0.5">
                      Locate <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Area-Level Analytics Inspector (5 cols) */}
        <div className={`lg:col-span-5 p-4 rounded-xl border transition-all ${
          isDarkMode ? 'bg-[#181512] border-[#2e2720]' : 'bg-[#fafaf9] border-[#e7e5e4]'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-inherit">
            <div className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-[#e5a93b]" />
              <h3 className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-[#1c1917]'}`}>
                Area-Level Analytics Inspector
              </h3>
            </div>
            {selectedArea && (
              <button
                type="button"
                onClick={() => onSelectArea(null)}
                className="text-[10px] text-[#e5a93b] hover:underline font-semibold"
              >
                Clear
              </button>
            )}
          </div>

          {selectedArea ? (
            (() => {
              const m = selectedArea.yearlyMetrics[selectedYear];
              return (
                <div className="pt-3 space-y-3 text-xs">
                  {/* Selected Area Header */}
                  <div className={`p-3 rounded-lg border ${
                    isDarkMode ? 'bg-[#141210] border-[#332b22]' : 'bg-white border-[#e7e5e4]'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#e5a93b] uppercase">Zone #{selectedArea.badgeNumber} ({selectedArea.code})</span>
                      <span className="text-xs font-mono font-bold text-emerald-400">Score {m.overallScore}/100</span>
                    </div>
                    <div className={`text-sm font-black mt-0.5 ${isDarkMode ? 'text-white' : 'text-[#1c1917]'}`}>
                      {selectedArea.name}
                    </div>
                    <div className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-[#8e8577]' : 'text-[#78716c]'}`}>
                      {selectedArea.taluka} Taluka &bull; {m.totalPopulation.toLocaleString()} citizens &bull; {m.populationDensitySqKm}/km²
                    </div>
                  </div>

                  {/* 4 Dimension Bars for this specific area */}
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className={isDarkMode ? 'text-[#a89f91]' : 'text-[#78716c]'}>Environmental Quality</span>
                        <span className="font-bold text-emerald-400">{m.environmentalScore}/100</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#241f1a] rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${m.environmentalScore}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className={isDarkMode ? 'text-[#a89f91]' : 'text-[#78716c]'}>Citizen Accessibility</span>
                        <span className="font-bold text-sky-400">{m.accessibilityScore}/100</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#241f1a] rounded-full overflow-hidden">
                        <div className="h-full bg-sky-500 rounded-full" style={{ width: `${m.accessibilityScore}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className={isDarkMode ? 'text-[#a89f91]' : 'text-[#78716c]'}>Population Pressure</span>
                        <span className="font-bold text-purple-400">{m.populationPressureScore}/100</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#241f1a] rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${m.populationPressureScore}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className={isDarkMode ? 'text-[#a89f91]' : 'text-[#78716c]'}>Urbanization Index</span>
                        <span className="font-bold text-amber-400">{m.urbanizationScore}/100</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#241f1a] rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${m.urbanizationScore}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Recommended Intervention */}
                  <div className={`p-2.5 rounded-lg border space-y-1 ${
                    isDarkMode ? 'bg-[#141210] border-[#2a241e]' : 'bg-white border-[#e7e5e4]'
                  }`}>
                    <span className="text-[10px] font-bold uppercase text-[#e5a93b] block">Target Infrastructure Intervention</span>
                    <p className={`text-[11px] leading-tight ${isDarkMode ? 'text-[#d4cbbf]' : 'text-[#44403c]'}`}>
                      {m.recommendedIntervention}
                    </p>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className={`pt-8 pb-8 text-center space-y-2 ${isDarkMode ? 'text-[#8e8577]' : 'text-[#a8a29e]'}`}>
              <MapPin className="w-8 h-8 mx-auto text-[#e5a93b]/40" />
              <div className="text-xs font-semibold">No Specific Area Selected</div>
              <p className="text-[11px] max-w-xs mx-auto">
                Click any zone marker on the tactical map or the priority list on the left to inspect its 5-year temporal dynamics.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
