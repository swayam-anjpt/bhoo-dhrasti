import React from 'react';
import { UnutilizedParcel } from '../../types';
import {
  ShieldCheck,
  Printer,
  X,
  FileText,
  CheckCircle,
  Building,
  MapPin,
  Compass,
  Layers,
  Coins,
  TrendingUp,
  AlertTriangle,
  Download,
} from 'lucide-react';

interface LandDossierModalProps {
  parcel: UnutilizedParcel | null;
  isOpen: boolean;
  onClose: () => void;
  onLocateOnMap?: (parcel: UnutilizedParcel) => void;
}

export const LandDossierModal: React.FC<LandDossierModalProps> = ({
  parcel,
  isOpen,
  onClose,
  onLocateOnMap,
}) => {
  if (!isOpen || !parcel) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      {/* Dossier Card Window - Styled exactly like Image 2 */}
      <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl bg-[#031317] border-2 border-emerald-500/60 text-emerald-100 shadow-[0_0_50px_rgba(16,185,129,0.25)] font-mono flex flex-col p-5 sm:p-7 relative custom-scrollbar">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-emerald-500/30 pb-3 mb-4">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm sm:text-base">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Official Legal-Technical Land Dossier Generator</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/50 text-xs text-emerald-300 font-bold transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-emerald-400 hover:text-white hover:bg-emerald-900/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub Header & ULPIN Protocol Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="text-[11px] text-emerald-400/80 tracking-wider">
              GOVERNMENT OF INDIA &bull; GLIS INDIA NETWORK
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white uppercase mt-0.5">
              LAND INTELLIGENCE &amp; TITLE VERIFICATION BRIEF
            </h2>
            <div className="text-xs text-emerald-400/70 mt-0.5">
              Generated under Bhu-Aadhaar ULPIN Protocol &bull; Evidence-Ready Spatial Dossier
            </div>
          </div>

          <div className="text-right sm:text-right border border-emerald-500/40 bg-emerald-950/40 px-3 py-1.5 rounded-lg shrink-0">
            <div className="text-xs font-extrabold text-emerald-300">
              ULPIN: {parcel.ulpin}
            </div>
            <div className="text-[10px] text-emerald-400/80 mt-0.5">
              TIMESTAMP: {new Date().toISOString().replace('T', ' ').substring(0, 19)} UTC
            </div>
          </div>
        </div>

        {/* ================= SECTION 1: CADASTRAL IDENTIFICATION & OWNERSHIP TENURE ================= */}
        <div className="mb-4">
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <span className="text-emerald-500">1.</span>
            <span>CADASTRAL IDENTIFICATION &amp; OWNERSHIP TENURE</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#021d1d]/70 p-3 rounded-xl border border-emerald-500/20">
            <div>
              <div className="text-[10px] text-emerald-400/70">Khasra / Survey No</div>
              <div className="font-bold text-xs sm:text-sm text-white mt-0.5">{parcel.khasraNo}</div>
            </div>

            <div>
              <div className="text-[10px] text-emerald-400/70">Custodian Ministry</div>
              <div className="font-bold text-xs sm:text-sm text-white mt-0.5">{parcel.custodianMinistry}</div>
            </div>

            <div>
              <div className="text-[10px] text-emerald-400/70">Tenure Classification</div>
              <div className="font-bold text-xs sm:text-sm text-white mt-0.5">{parcel.tenureClassification}</div>
            </div>

            <div>
              <div className="text-[10px] text-emerald-400/70">Legal Title Status</div>
              <div className="font-bold text-xs sm:text-sm text-emerald-400 mt-0.5 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                {parcel.legalTitleStatus}
              </div>
            </div>
          </div>
        </div>

        {/* ================= SECTION 2: PHYSICAL TOPOGRAPHY & ENVIRONMENTAL CLEARANCE ================= */}
        <div className="mb-4">
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <span className="text-emerald-500">2.</span>
            <span>PHYSICAL TOPOGRAPHY &amp; ENVIRONMENTAL CLEARANCE</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#021d1d]/70 p-3 rounded-xl border border-emerald-500/20">
            <div>
              <div className="text-[10px] text-emerald-400/70">Total Area</div>
              <div className="font-bold text-xs sm:text-sm text-white mt-0.5">
                {parcel.totalAreaHa} Hectares ({parcel.totalAreaSqM.toLocaleString()} m²)
              </div>
            </div>

            <div>
              <div className="text-[10px] text-emerald-400/70">Average Slope</div>
              <div className="font-bold text-xs sm:text-sm text-white mt-0.5">{parcel.averageSlope}</div>
            </div>

            <div>
              <div className="text-[10px] text-emerald-400/70">Soil Bearing Capacity</div>
              <div className="font-bold text-xs sm:text-sm text-white mt-0.5">{parcel.soilBearingCapacity}</div>
            </div>

            <div>
              <div className="text-[10px] text-emerald-400/70">Flood Plain Risk</div>
              <div className="font-bold text-xs sm:text-sm text-emerald-400 mt-0.5">{parcel.floodPlainRisk}</div>
            </div>
          </div>
        </div>

        {/* ================= SECTION 3: ECONOMIC VALUATION & MONETIZATION POTENTIAL ================= */}
        <div className="mb-4">
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <span className="text-emerald-500">3.</span>
            <span>ECONOMIC VALUATION &amp; MONETIZATION POTENTIAL</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-[#021d1d]/70 p-3 rounded-xl border border-emerald-500/20">
            <div>
              <div className="text-[10px] text-emerald-400/70">Current Circle Rate</div>
              <div className="font-bold text-xs sm:text-sm text-white mt-0.5">{parcel.currentCircleRate}</div>
            </div>

            <div>
              <div className="text-[10px] text-emerald-400/70">Estimated Asset Value</div>
              <div className="font-bold text-xs sm:text-sm text-emerald-400 mt-0.5">{parcel.estimatedAssetValue}</div>
            </div>

            <div>
              <div className="text-[10px] text-emerald-400/70">Dead Capital Classification</div>
              <div className="font-bold text-xs sm:text-sm text-amber-300 mt-0.5">
                {parcel.deadCapitalClassification}
              </div>
            </div>
          </div>
        </div>

        {/* ================= SECTION 4: BOUNDARY GEO-COORDINATES & SATELLITE VERIFICATION ================= */}
        <div className="mb-4">
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <span className="text-emerald-500">4.</span>
            <span>BOUNDARY GEO-COORDINATES &amp; SATELLITE VERIFICATION</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#021d1d]/70 p-3 rounded-xl border border-emerald-500/20">
            <div>
              <div className="text-[10px] text-emerald-400/70">Centroid Lat/Lng</div>
              <div className="font-bold text-xs sm:text-sm text-white mt-0.5">
                {parcel.centroidLat.toFixed(5)}°N, {parcel.centroidLng.toFixed(5)}°E
              </div>
            </div>

            <div>
              <div className="text-[10px] text-emerald-400/70">Tehsil / District</div>
              <div className="font-bold text-xs sm:text-sm text-white mt-0.5">{parcel.tehsilDistrict}</div>
            </div>

            <div>
              <div className="text-[10px] text-emerald-400/70">Highway Proximity</div>
              <div className="font-bold text-xs sm:text-sm text-white mt-0.5">{parcel.highwayProximity}</div>
            </div>

            <div>
              <div className="text-[10px] text-emerald-400/70">Substation Grid</div>
              <div className="font-bold text-xs sm:text-sm text-white mt-0.5">{parcel.substationGrid}</div>
            </div>
          </div>
        </div>

        {/* Recommended Development Interventions */}
        <div className="mb-4">
          <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
            PRIORITY DEVELOPMENT &amp; MONETIZATION RECOMMENDATIONS
          </div>
          <div className="flex flex-wrap gap-2">
            {parcel.potentialUse.map((use, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-md bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold"
              >
                ✓ {use}
              </span>
            ))}
          </div>
        </div>

        {/* Footer verification note & confidential stamp */}
        <div className="pt-3 border-t border-dashed border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-400/90 text-[11px]">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{parcel.satelliteVerification}</span>
          </div>

          <div className="flex items-center gap-3">
            {onLocateOnMap && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLocateOnMap(parcel);
                }}
                className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Locate on Map</span>
              </button>
            )}

            <div className="px-2.5 py-1 rounded bg-emerald-950/90 border border-emerald-500/70 text-emerald-300 text-[10px] font-bold tracking-wider">
              OFFICIAL SPATIAL DOSSIER &bull; CONFIDENTIAL
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
