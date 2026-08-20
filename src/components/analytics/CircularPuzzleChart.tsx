import React, { useState } from 'react';
import { TemporalFactor, TemporalYear } from '../../types/temporal';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface CircularPuzzleChartProps {
  selectedFactor: TemporalFactor;
  onSelectFactor: (factor: TemporalFactor) => void;
  selectedYear: TemporalYear;
  weightedOverallScore: number;
  currentYearSummary: {
    year: TemporalYear;
    overallScore: number;
    environmentalScore: number;
    accessibilityScore: number;
    populationPressureScore: number;
    urbanizationScore: number;
    totalPopulation: number;
    totalBuiltUpAreaSqKm: number;
    urbanPopulationPercent: number;
  };
  changeSinceBaseline: {
    overall: { val: number; pct: number };
    env: { val: number; pct: number };
    acc: { val: number; pct: number };
    pop: { val: number; pct: number };
    urb: { val: number; pct: number };
  };
  isDarkMode: boolean;
}

interface SegmentDef {
  id: TemporalFactor;
  label: string;
  shortLabel: string;
  valueDisplay: string;
  unit: string;
  deltaText: string;
  isPositive: boolean;
  color: string;
  activeColor: string;
  bgLight: string;
  bgDark: string;
}

export const CircularPuzzleChart: React.FC<CircularPuzzleChartProps> = ({
  selectedFactor,
  onSelectFactor,
  selectedYear,
  weightedOverallScore,
  currentYearSummary,
  changeSinceBaseline,
  isDarkMode,
}) => {
  const [hoveredFactor, setHoveredFactor] = useState<TemporalFactor | null>(null);

  // 5 Dimensional Segments
  const segments: SegmentDef[] = [
    {
      id: 'overall',
      label: 'Overall Score',
      shortLabel: 'Overall',
      valueDisplay: `${weightedOverallScore}`,
      unit: '/ 100',
      deltaText: `+${changeSinceBaseline.overall.val} pts (${changeSinceBaseline.overall.pct}%) vs '22`,
      isPositive: changeSinceBaseline.overall.val >= 0,
      color: '#e5a93b',
      activeColor: '#f59e0b',
      bgLight: '#fef3c7',
      bgDark: '#2b241d',
    },
    {
      id: 'environment',
      label: 'Environmental',
      shortLabel: 'Environment',
      valueDisplay: `${currentYearSummary.environmentalScore}`,
      unit: '/ 100',
      deltaText: `${changeSinceBaseline.env.val >= 0 ? '+' : ''}${changeSinceBaseline.env.val} pts vs '22`,
      isPositive: changeSinceBaseline.env.val >= 0,
      color: '#10b981',
      activeColor: '#059669',
      bgLight: '#d1fae5',
      bgDark: '#132e22',
    },
    {
      id: 'accessibility',
      label: 'Accessibility',
      shortLabel: 'Accessibility',
      valueDisplay: `${currentYearSummary.accessibilityScore}`,
      unit: '/ 100',
      deltaText: `+${changeSinceBaseline.acc.val} pts (${changeSinceBaseline.acc.pct}%) vs '22`,
      isPositive: changeSinceBaseline.acc.val >= 0,
      color: '#0ea5e9',
      activeColor: '#0284c7',
      bgLight: '#e0f2fe',
      bgDark: '#11293a',
    },
    {
      id: 'population',
      label: 'Population',
      shortLabel: 'Population',
      valueDisplay: `${(currentYearSummary.totalPopulation / 1000000).toFixed(2)}M`,
      unit: 'citizens',
      deltaText: `+${changeSinceBaseline.pop.pct}% growth since '22`,
      isPositive: true,
      color: '#a855f7',
      activeColor: '#9333ea',
      bgLight: '#f3e8ff',
      bgDark: '#29183b',
    },
    {
      id: 'urbanization',
      label: 'Urban Built-Up',
      shortLabel: 'Urbanization',
      valueDisplay: `${currentYearSummary.totalBuiltUpAreaSqKm}`,
      unit: `km² (${currentYearSummary.urbanPopulationPercent}%)`,
      deltaText: `+${changeSinceBaseline.urb.val} pts index`,
      isPositive: changeSinceBaseline.urb.val >= 0,
      color: '#f97316',
      activeColor: '#ea580c',
      bgLight: '#ffedd5',
      bgDark: '#351c14',
    },
  ];

  // Active or hovered factor definition for center readout
  const activeDef =
    segments.find((s) => s.id === (hoveredFactor || selectedFactor)) || segments[0];

  // Geometry Constants for the Puzzle Ring
  const cx = 160;
  const cy = 160;
  const rIn = 75;
  const rOut = 125;
  const rMid = (rIn + rOut) / 2; // 100
  const tabR = 12.5; // Radius of interlocking knob

  // Helper for polar coordinates: 0 degrees = top (12 o'clock)
  const polar = (r: number, deg: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  };

  // Generate SVG path for segment i (of 5 segments, each spanning 72 deg)
  const createPuzzlePiecePath = (index: number) => {
    const angleStep = 360 / segments.length; // 72 deg
    const a1 = index * angleStep;
    const a2 = (index + 1) * angleStep;

    // 1. Inner arc start point
    const p0 = polar(rIn, a1);
    // 2. Start of socket notch along radius at a1
    const p1 = polar(rMid - tabR, a1);
    // 3. End of socket notch along radius at a1
    const p2 = polar(rMid + tabR, a1);
    // 4. Outer arc start point
    const p3 = polar(rOut, a1);

    // 5. Outer arc end point at a2
    const p4 = polar(rOut, a2);
    // 6. Start of outward tab along radius at a2
    const p5 = polar(rMid + tabR, a2);
    // 7. End of outward tab along radius at a2
    const p6 = polar(rMid - tabR, a2);
    // 8. Inner arc end point at a2
    const p7 = polar(rIn, a2);

    return [
      `M ${p0.x.toFixed(2)} ${p0.y.toFixed(2)}`,
      `L ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`,
      // Inward socket notch curving into the segment
      `A ${tabR} ${tabR} 0 0 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`,
      `L ${p3.x.toFixed(2)} ${p3.y.toFixed(2)}`,
      // Outer arc from a1 to a2
      `A ${rOut} ${rOut} 0 0 1 ${p4.x.toFixed(2)} ${p4.y.toFixed(2)}`,
      `L ${p5.x.toFixed(2)} ${p5.y.toFixed(2)}`,
      // Outward puzzle tab sticking forward into next segment
      `A ${tabR} ${tabR} 0 0 1 ${p6.x.toFixed(2)} ${p6.y.toFixed(2)}`,
      `L ${p7.x.toFixed(2)} ${p7.y.toFixed(2)}`,
      // Inner arc from a2 back to a1
      `A ${rIn} ${rIn} 0 0 0 ${p0.x.toFixed(2)} ${p0.y.toFixed(2)}`,
      'Z',
    ].join(' ');
  };

  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        isDarkMode ? 'bg-[#181512] border-[#2e2720]' : 'bg-[#fafaf9] border-[#e7e5e4] shadow-sm'
      }`}
    >
      <div className="flex flex-col xl:flex-row items-center justify-between gap-6">
        {/* Left / Center: Interactive Puzzle Ring SVG */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg
            viewBox="0 0 320 320"
            className="w-64 h-64 sm:w-72 sm:h-72 drop-shadow-md select-none"
          >
            <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Background subtle ring shadow track */}
            <circle
              cx={cx}
              cy={cy}
              r={(rIn + rOut) / 2}
              fill="none"
              stroke={isDarkMode ? '#1f1b17' : '#f0ece9'}
              strokeWidth={rOut - rIn}
              className="opacity-40"
            />

            {/* 5 Interlocking Puzzle Segments */}
            {segments.map((seg, idx) => {
              const isSelected = selectedFactor === seg.id;
              const isHovered = hoveredFactor === seg.id;
              const pathData = createPuzzlePiecePath(idx);

              return (
                <g key={seg.id} className="cursor-pointer">
                  <path
                    d={pathData}
                    fill={seg.color}
                    fillOpacity={isSelected ? 1 : isHovered ? 0.9 : isDarkMode ? 0.72 : 0.8}
                    stroke={isDarkMode ? '#181512' : '#ffffff'}
                    strokeWidth={isSelected ? 3.5 : 2.5}
                    filter={isSelected ? 'url(#glow)' : undefined}
                    className="transition-all duration-200"
                    style={{
                      transformOrigin: `${cx}px ${cy}px`,
                      transform: isSelected ? 'scale(1.035)' : isHovered ? 'scale(1.02)' : 'scale(1)',
                    }}
                    onClick={() => onSelectFactor(seg.id)}
                    onMouseEnter={() => setHoveredFactor(seg.id)}
                    onMouseLeave={() => setHoveredFactor(null)}
                  />
                </g>
              );
            })}
          </svg>

          {/* Center Donut Readout */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4"
            style={{
              width: `${rIn * 2 - 10}px`,
              height: `${rIn * 2 - 10}px`,
              margin: 'auto',
            }}
          >
            <span
              className={`text-[9px] sm:text-[10px] uppercase font-extrabold tracking-wider truncate max-w-[120px] ${
                isDarkMode ? 'text-[#a89f91]' : 'text-[#78716c]'
              }`}
            >
              {activeDef.label}
            </span>
            <div className="flex items-baseline gap-1 my-0.5">
              <span
                className="text-xl sm:text-2xl font-black tracking-tight"
                style={{ color: activeDef.color }}
              >
                {activeDef.valueDisplay}
              </span>
              <span
                className={`text-[10px] font-semibold ${
                  isDarkMode ? 'text-[#8e8577]' : 'text-[#a8a29e]'
                }`}
              >
                {activeDef.unit}
              </span>
            </div>
            <div
              className={`flex items-center gap-1 text-[10px] font-bold ${
                activeDef.isPositive ? 'text-emerald-500' : 'text-amber-500'
              }`}
            >
              {activeDef.isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span className="truncate max-w-[115px]">{activeDef.deltaText}</span>
            </div>
          </div>
        </div>

        {/* Right / Grid: 5 Interactive Dimension Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-1 gap-2.5 w-full flex-1">
          {segments.map((seg) => {
            const isSelected = selectedFactor === seg.id;
            return (
              <button
                key={seg.id}
                type="button"
                onClick={() => onSelectFactor(seg.id)}
                onMouseEnter={() => setHoveredFactor(seg.id)}
                onMouseLeave={() => setHoveredFactor(null)}
                className={`p-2.5 rounded-lg border text-left transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? isDarkMode
                      ? 'bg-[#241f1a] border-[#e5a93b]/80 shadow-md ring-1 ring-[#e5a93b]/40'
                      : 'bg-[#fef9ee] border-[#d97706] shadow-sm ring-1 ring-[#d97706]/30'
                    : isDarkMode
                    ? 'bg-[#141210] border-[#2a241e] hover:border-[#3d3328]'
                    : 'bg-white border-[#e7e5e4] hover:bg-[#f5f5f4]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: seg.color }}
                  />
                  <div className="min-w-0">
                    <div
                      className={`text-[10px] uppercase font-bold tracking-wider truncate ${
                        isSelected
                          ? isDarkMode
                            ? 'text-[#f4ede4]'
                            : 'text-[#1c1917]'
                          : isDarkMode
                          ? 'text-[#8e8577]'
                          : 'text-[#78716c]'
                      }`}
                    >
                      {seg.label}
                    </div>
                    <div
                      className={`text-[10px] font-semibold truncate ${
                        seg.isPositive ? 'text-emerald-500' : 'text-amber-500'
                      }`}
                    >
                      {seg.deltaText}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div
                    className="text-sm font-black"
                    style={{ color: isSelected ? seg.color : isDarkMode ? '#f4ede4' : '#1c1917' }}
                  >
                    {seg.valueDisplay}
                    <span
                      className={`text-[9px] font-normal ml-0.5 ${
                        isDarkMode ? 'text-[#8e8577]' : 'text-[#a8a29e]'
                      }`}
                    >
                      {seg.unit}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
