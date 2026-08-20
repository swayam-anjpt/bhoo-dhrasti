import React from 'react';
import { CandidateSiteScore, DistrictMetrics, Language, Parcel, SuitabilityWeights } from '../types';
import {
  X,
  Printer,
  Download,
  FileSpreadsheet,
  FileCode,
  CheckCircle2,
  Building,
  Building2,
  Scale,
  Compass,
} from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  site: CandidateSiteScore;
  district: DistrictMetrics;
  weights: SuitabilityWeights;
  candidateSites: CandidateSiteScore[];
  language: Language;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  site,
  district,
  weights,
  candidateSites,
  language,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = 'Rank,SiteName,ProposedType,CompositeScore,AreaAcres,CapExCr,ServedCatchment,EquityContribution,RoadAccessContribution\n';
    const rows = candidateSites
      .map(
        (s) =>
          `${s.rank},"${s.siteName}","${s.proposedType}",${s.compositeScore},${s.areaAcres},${s.estimatedCapitalExpenditureCr},${s.servedPopulationCatchment},${s.weightedContributions.socioEconomicNeed},${s.weightedContributions.accessibility}`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `GLIS_Siting_Dossier_${district.name}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const payload = {
      dossierRef: `GLIS-GOV-${district.name.toUpperCase()}-${new Date().getFullYear()}-0091`,
      generatedAt: new Date().toISOString(),
      districtProfile: district,
      policyWeights: weights,
      recommendedSite: site,
      allEvaluatedCandidateSites: candidateSites,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `GLIS_Dossier_${district.name}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white text-slate-900 rounded-2xl shadow-2xl p-8 space-y-6 print:p-0 print:shadow-none">
        {/* Floating Top Controls (Hidden on Print) */}
        <div className="flex items-center justify-between border-b pb-4 no-print">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-sky-100 text-sky-900 font-bold text-xs">
              Official Geospatial Dossier
            </span>
            <span className="text-slate-500 text-xs font-mono">Ref: GLIS-GOV-{district.name.toUpperCase()}-2026-0091</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors border"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>CSV</span>
            </button>

            <button
              type="button"
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors border"
            >
              <FileCode className="w-3.5 h-3.5 text-sky-600" />
              <span>JSON</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Government Header */}
        <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-black text-xl shadow-inner">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">
                Government of India &bull; State Infrastructure Planning Board
              </div>
              <h1 className="text-xl font-extrabold text-slate-950">
                GLIS Geospatial Infrastructure Decision Dossier
              </h1>
              <div className="text-xs text-slate-600">
                A Comprehensive Multi-Criteria Spatial & Socio-Economic Siting Analysis
              </div>
            </div>
          </div>

          <div className="text-right text-xs text-slate-600 font-mono">
            <div><b>Date:</b> {new Date().toLocaleDateString('en-IN')}</div>
            <div><b>Classification:</b> Official / Public Record</div>
            <div><b>Jurisdiction:</b> {district.name} District ({district.state})</div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-slate-950 uppercase tracking-wide border-b pb-1">
            1. Executive Summary & Siting Mandate
          </h2>
          <p className="text-xs text-slate-700 leading-relaxed">
            This dossier records the deterministic site selection for a proposed <b>{site.proposedType}</b> in <b>{district.name} District</b>. Using the GLIS spatial Multi-Criteria Decision Analysis (MCDA) framework, <b>{site.siteName}</b> has been selected as the <b>Rank #1 Recommended Siting Location</b> with an overall composite score of <b>{site.compositeScore}/100</b>.
          </p>
        </div>

        {/* District Deprivation Index */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-slate-950 uppercase tracking-wide border-b pb-1">
            2. District Deprivation & Socio-Economic Need Baseline
          </h2>
          <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg border text-xs">
            <div>
              <span className="text-slate-500">Development Need Index:</span>
              <div className="font-extrabold text-sm text-red-600">{district.developmentNeedIndex} / 100</div>
            </div>
            <div>
              <span className="text-slate-500">Marginalized Population (ST/SC):</span>
              <div className="font-bold text-slate-900">{district.marginalizedPopulationPercent}%</div>
            </div>
            <div>
              <span className="text-slate-500">Healthcare Deficit Score:</span>
              <div className="font-bold text-red-600">{district.healthcareDeficitScore} / 100</div>
            </div>
          </div>
        </div>

        {/* Mathematical Siting Evaluation Table */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-slate-950 uppercase tracking-wide border-b pb-1">
            3. Multi-Criteria Evaluation & Candidate Rankings
          </h2>
          <table className="w-full text-left text-xs border">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b">
              <tr>
                <th className="p-2 border-r">Rank</th>
                <th className="p-2 border-r">Candidate Site</th>
                <th className="p-2 border-r">Composite Score</th>
                <th className="p-2 border-r">Area (Acres)</th>
                <th className="p-2 border-r">CapEx (₹ Cr)</th>
                <th className="p-2 border-r">Served Catchment</th>
                <th className="p-2">Equity Points</th>
              </tr>
            </thead>
            <tbody className="divide-y text-slate-800">
              {candidateSites.map((cs) => (
                <tr key={cs.siteId} className={cs.rank === 1 ? 'bg-amber-50/70 font-semibold' : ''}>
                  <td className="p-2 border-r">#{cs.rank}</td>
                  <td className="p-2 border-r">{cs.siteName}</td>
                  <td className="p-2 border-r font-bold text-emerald-700">{cs.compositeScore}</td>
                  <td className="p-2 border-r">{cs.areaAcres}</td>
                  <td className="p-2 border-r">₹{cs.estimatedCapitalExpenditureCr}</td>
                  <td className="p-2 border-r">{cs.servedPopulationCatchment.toLocaleString()}</td>
                  <td className="p-2 font-bold text-amber-700">+{cs.weightedContributions.socioEconomicNeed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Explainable Trade-Off Justification */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-slate-950 uppercase tracking-wide border-b pb-1">
            4. Explainable AI Siting Narrative & Trade-Off Analysis
          </h2>
          <div className="p-4 bg-slate-50 rounded-lg border text-xs text-slate-800 leading-relaxed">
            {site.justificationSummary}
          </div>
        </div>

        {/* Approval & Signatures */}
        <div className="pt-6 border-t-2 border-slate-900 grid grid-cols-3 gap-6 text-center text-xs">
          <div className="space-y-8">
            <div className="font-semibold text-slate-900">Dr. Rajeshwar Sharma, IAS</div>
            <div className="text-[10px] text-slate-500 border-t pt-1">District Development Officer (DDO)</div>
          </div>
          <div className="space-y-8">
            <div className="font-semibold text-slate-900">Chief Town Planner</div>
            <div className="text-[10px] text-slate-500 border-t pt-1">Urban Development & Housing Dept</div>
          </div>
          <div className="space-y-8">
            <div className="font-semibold text-slate-900">Superintending Engineer</div>
            <div className="text-[10px] text-slate-500 border-t pt-1">Public Works Department (PWD)</div>
          </div>
        </div>
      </div>
    </div>
  );
};
