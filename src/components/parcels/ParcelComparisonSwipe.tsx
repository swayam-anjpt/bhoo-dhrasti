import React, { useState, useRef, useEffect, useCallback } from 'react';
import { UnutilizedParcel } from '../../types';
import {
  ZoomIn,
  ZoomOut,
  Compass,
  AlertTriangle,
  Layers,
  Sparkles,
  Maximize2,
  Calendar,
  Activity,
  ShieldAlert,
} from 'lucide-react';

interface ParcelComparisonSwipeProps {
  parcel: UnutilizedParcel;
  isDarkMode?: boolean;
}

export const ParcelComparisonSwipe: React.FC<ParcelComparisonSwipeProps> = ({
  parcel,
  isDarkMode = true,
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50); // 0 to 100%
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle Dragging
  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  }, [isDragging, handleMove]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  }, [isDragging, handleMove]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, handleMouseMove, handleTouchMove, handleEnd]);

  return (
    <div className="flex flex-col h-full w-full rounded-2xl overflow-hidden border border-slate-800 bg-[#070d14] text-slate-100 shadow-2xl relative select-none">
      {/* Top Status Bar */}
      <div className="px-4 py-2 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-3">
          <span className="text-emerald-400 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            SENTINEL-2 L2A (10M) ARCHIVE
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-sky-400 font-semibold flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            CADASTRE GEO-REGISTRATION
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span>LAT: {parcel.centroidLat.toFixed(4)}°N</span>
          <span>LNG: {parcel.centroidLng.toFixed(4)}°E</span>
        </div>
      </div>

      {/* Interactive Swipe Canvas Area */}
      <div
        ref={containerRef}
        onMouseDown={(e) => {
          setIsDragging(true);
          handleMove(e.clientX);
        }}
        onTouchStart={(e) => {
          setIsDragging(true);
          handleMove(e.touches[0].clientX);
        }}
        className="relative flex-1 w-full overflow-hidden cursor-ew-resize bg-[#04080e]"
        style={{ minHeight: '380px' }}
      >
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Ambient Satellite Ground Background Simulation */}
        <div
          className="absolute inset-0 transition-transform duration-200"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* Faint road / canal vector line */}
          <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-slate-700/30 -rotate-3 blur-[0.5px]" />
          <div className="absolute top-1/3 left-1/4 bottom-0 w-2 bg-slate-700/20 rotate-12 blur-[0.5px]" />
        </div>

        {/* ================= LEFT LAYER: BASELINE / AVAILABLE LAND (GREEN) ================= */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none transition-transform duration-200"
          style={{
            clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
            transform: `scale(${zoomLevel})`,
          }}
        >
          {/* Dark Greenish Atmospheric Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 via-teal-950/10 to-transparent" />

          {/* Baseline Badge (Top-Left) */}
          <div className="absolute top-4 left-6 z-10">
            <span className="px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-mono font-bold text-[11px] flex items-center gap-1.5 shadow-lg backdrop-blur-md">
              <Calendar className="w-3 h-3 text-emerald-400" />
              ◀ {parcel.baselineYear} BASELINE (AVAILABLE LAND)
            </span>
          </div>

          {/* Green Cadastre Parcel Polygon */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 sm:w-80 h-72 sm:h-80 rounded-2xl border-2 border-dashed border-emerald-400/90 bg-emerald-500/10 shadow-[0_0_25px_rgba(16,185,129,0.25)] flex flex-col items-center justify-center p-4">
            {/* Header Badge on Green Polygon */}
            <div className="absolute -top-3.5 left-4 px-2 py-0.5 rounded-md bg-slate-900 border border-emerald-400/60 text-emerald-300 text-[10px] font-mono font-bold shadow-md">
              LEGAL CADASTRE: KHASRA {parcel.khasraNo}
            </div>

            {/* Label inside green polygon */}
            <div className="text-center space-y-1.5">
              <div className="font-extrabold text-sm sm:text-base text-emerald-400 font-mono tracking-wide leading-tight drop-shadow-md">
                VIRGIN OPEN REVENUE LAND
              </div>
              <div className="text-xs font-mono font-semibold text-emerald-300/90 bg-emerald-950/60 px-2 py-1 rounded-md border border-emerald-500/30 inline-block">
                (NDVI: {parcel.baselineNdvi}) • {parcel.totalAreaHa} HA
              </div>
              <div className="text-[11px] font-mono text-emerald-200/70 pt-1">
                {parcel.custodianMinistry} • {parcel.tenureClassification}
              </div>
            </div>

            {/* Corner Markers */}
            <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-emerald-400" />
            <div className="absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2 border-emerald-400" />
            <div className="absolute bottom-1 left-1 w-2 h-2 border-b-2 border-l-2 border-emerald-400" />
            <div className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-emerald-400" />
          </div>
        </div>

        {/* ================= RIGHT LAYER: CURRENT / UNUTILIZED & DRIFT (RED) ================= */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none transition-transform duration-200"
          style={{
            clipPath: `polygon(${sliderPosition}% 0, 100% 0, 100% 100%, ${sliderPosition}% 100%)`,
            transform: `scale(${zoomLevel})`,
          }}
        >
          {/* Dark Reddish Atmospheric Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-rose-950/20 via-red-950/10 to-transparent" />

          {/* Current Year Badge (Top-Right) */}
          <div className="absolute top-4 right-6 z-10">
            <span className="px-2.5 py-1 rounded bg-rose-950/80 border border-rose-500/40 text-rose-400 font-mono font-bold text-[11px] flex items-center gap-1.5 shadow-lg backdrop-blur-md">
              {parcel.currentYear} CURRENT (UNUTILIZED DRIFT) ▶
              <Calendar className="w-3 h-3 text-rose-400" />
            </span>
          </div>

          {/* Outer Boundary Phantom */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 sm:w-80 h-72 sm:h-80 rounded-2xl border border-dashed border-emerald-500/30 pointer-events-none" />

          {/* Red Glowing Unused / Encroached / Drift Zone */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-52 sm:w-64 h-56 sm:h-64 rounded-2xl border-2 border-rose-500 bg-rose-950/30 shadow-[0_0_35px_rgba(244,63,94,0.35)] flex flex-col items-center justify-center p-4">
            {/* Drift Header Badge */}
            <div className="absolute -top-3.5 left-4 px-2 py-0.5 rounded-md bg-slate-900 border border-rose-500/80 text-rose-400 text-[10px] font-mono font-bold shadow-md flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              DRIFT: {parcel.driftAreaHa} HA ({parcel.driftPercentage}%)
            </div>

            {/* Unauthorized Structure Warning Pill (Exact as screenshot) */}
            <div className="px-3 py-1 rounded-md bg-amber-500/10 border border-amber-500/80 text-amber-400 font-mono font-extrabold text-xs tracking-wide flex items-center gap-1.5 shadow-lg shadow-amber-500/10 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>UNAUTHORIZED STRUCTURE / IDLE</span>
            </div>

            {/* Structures & NDBI stats */}
            <div className="text-center space-y-1">
              <div className="text-xs font-mono font-bold text-rose-300">
                {parcel.unauthorizedStructuresCount} NEW STRUCTURES (NDBI: +{parcel.currentNdbi})
              </div>
              <div className="text-[11px] font-mono text-rose-400/80">
                Dead Capital: ₹{parcel.deadCapitalCr} Cr Locked
              </div>
              <div className="text-[10px] font-mono text-slate-400 pt-1">
                Area: {parcel.unusedAreaHa} HA • {parcel.deadCapitalClassification}
              </div>
            </div>

            {/* Red Pulsing Corner Markers */}
            <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-rose-400" />
            <div className="absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2 border-rose-400" />
            <div className="absolute bottom-1 left-1 w-2 h-2 border-b-2 border-l-2 border-rose-400" />
            <div className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-rose-400" />
          </div>
        </div>

        {/* ================= THE VERTICAL DRAGGABLE SPLIT LINE ================= */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white z-30 shadow-[0_0_12px_rgba(255,255,255,0.9)] cursor-ew-resize pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          {/* Circular Split Drag Handle with Arrows */}
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900 border-2 border-cyan-400 text-cyan-300 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.7)] pointer-events-auto transition-transform ${
              isDragging ? 'scale-110 ring-4 ring-cyan-400/40 bg-slate-950' : 'hover:scale-105'
            }`}
          >
            <div className="flex items-center gap-0.5 text-cyan-300 font-bold text-xs">
              <span>◀</span>
              <span>▶</span>
            </div>
          </div>
        </div>

        {/* Map View Controls Overlay (Zoom +, Zoom -, Compass) */}
        <div className="absolute right-4 top-16 z-20 flex flex-col gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 backdrop-blur-md shadow-xl">
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(2.2, z + 0.2))}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.2))}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setZoomLevel(1);
              setSliderPosition(50);
            }}
            className="p-2 rounded-lg text-cyan-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
            title="Reset View & Split"
          >
            <Compass className="w-4 h-4" />
          </button>
        </div>

        {/* Drag Helper Instructions Pill */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-400 backdrop-blur-md shadow-md pointer-events-none flex items-center gap-2">
          <span className="text-emerald-400 font-bold">Green = Available</span>
          <span>•</span>
          <span className="text-cyan-300 font-semibold">◀ Drag Slider to Compare ▶</span>
          <span>•</span>
          <span className="text-rose-400 font-bold">Red = Unused / Encroached</span>
        </div>
      </div>

      {/* Bottom Summary Bar */}
      <div className="px-4 py-3 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-slate-400 text-[11px]">Total Cadastre: </span>
            <span className="font-mono font-bold text-emerald-400">{parcel.totalAreaHa} Ha ({parcel.totalAreaAcres} Acres)</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px]">Unutilized Part: </span>
            <span className="font-mono font-bold text-rose-400">{parcel.unusedAreaHa} Ha ({parcel.unusedPercentage}%)</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px]">Dead Capital: </span>
            <span className="font-mono font-bold text-amber-400">₹{parcel.deadCapitalCr} Cr</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono text-slate-300">
            Dormancy: {parcel.dormancyYears} Years
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-600/40 text-[10px] font-mono text-emerald-300">
            {parcel.legalTitleStatus}
          </span>
        </div>
      </div>
    </div>
  );
};
