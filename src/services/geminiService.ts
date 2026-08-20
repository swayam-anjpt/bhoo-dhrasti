import { GoogleGenAI } from '@google/genai';
import { AskGlisQuery, AskGlisResponse, CandidateSiteScore, DistrictMetrics } from '../types';
import { DISTRICTS_DATA } from '../data/mockGisData';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (aiClient) return aiClient;
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

/**
 * Explains why a specific candidate site was recommended based on structured MCDA data
 */
export async function explainSiteRecommendation(
  site: CandidateSiteScore,
  district: DistrictMetrics,
  alternativeSite?: CandidateSiteScore
): Promise<{ explanation: string; tradeOffAnalysis: string; executiveSummary: string }> {
  const fallback = {
    executiveSummary: `Site #${site.rank} (${site.siteName}) achieves a composite suitability score of ${site.compositeScore}/100, driven by an exceptional Equity Need Index of ${site.factors.socioEconomicEquityScore}/100 and direct accessibility to ${site.servedPopulationCatchment.toLocaleString()} underserved citizens.`,
    explanation: `The GLIS Geospatial Engine prioritized ${site.siteName} for a new ${site.proposedType} because ${district.name} District exhibits an elevated Development Need Index of ${district.developmentNeedIndex}/100 with ${district.marginalizedPopulationPercent}% marginalized population. With the nearest competing facility ${site.distanceToNearestCompetingAssetKm} km away, siting on this ${site.areaAcres}-acre government parcel optimizes capital efficiency while resolving a severe geographical coverage vacuum.`,
    tradeOffAnalysis: alternativeSite
      ? `Comparative Analysis: ${site.siteName} (Score: ${site.compositeScore}) vs ${alternativeSite.siteName} (Score: ${alternativeSite.compositeScore}). While ${alternativeSite.siteName} offers slightly higher transit proximity, ${site.siteName} is prioritized because it captures ${site.servedPopulationCatchment.toLocaleString()} underserved citizens in high-deprivation tribal pockets (+${(site.factors.socioEconomicEquityScore - alternativeSite.factors.socioEconomicEquityScore).toFixed(1)} equity advantage).`
      : `Trade-off Analysis: The site provides zero environmental flood risk and utilizes vacant government revenue land, saving an estimated ₹8.4 Cr in private land acquisition delays.`,
  };

  const ai = getAiClient();
  if (!ai) return fallback;

  try {
    const prompt = `You are the Chief Geospatial Policy Advisor for GLIS (Government Land & Infrastructure Intelligence Platform).
Explain why Candidate Site #${site.rank} was selected for a proposed ${site.proposedType} in ${district.name} District.

Structured Geospatial Facts (Do NOT contradict these numbers):
- District: ${district.name}, State: ${district.state}
- Development Need Index: ${district.developmentNeedIndex}/100
- Marginalized Population: ${district.marginalizedPopulationPercent}%
- Literacy Rate: ${district.literacyRate}%
- Candidate Site: ${site.siteName} (${site.areaAcres} acres)
- Composite Suitability Score: ${site.compositeScore}/100 (Rank ${site.rank})
- Accessibility Score: ${site.factors.accessibilityScore}/100
- Socio-Economic Equity Score: ${site.factors.socioEconomicEquityScore}/100
- Catchment Population Served: ${site.servedPopulationCatchment.toLocaleString()}
- Distance to Nearest Existing Facility: ${site.distanceToNearestCompetingAssetKm} km
- Estimated CapEx: ₹${site.estimatedCapitalExpenditureCr} Cr

Provide a professional, clear 3-part response:
1. Executive Summary (1 concise sentence)
2. Explainable Siting Justification (2-3 sentences explaining the socio-economic and spatial rationale)
3. Trade-off Analysis (1-2 sentences comparing equity impact vs cost/accessibility).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
    });

    const text = response.text || '';
    if (text) {
      return {
        executiveSummary: fallback.executiveSummary,
        explanation: text,
        tradeOffAnalysis: fallback.tradeOffAnalysis,
      };
    }
  } catch (err) {
    console.error('Gemini explanation fallback triggered:', err);
  }

  return fallback;
}

/**
 * Natural language "Ask GLIS" assistant query handler
 */
export async function queryAskGlis(query: AskGlisQuery): Promise<AskGlisResponse> {
  const q = query.question.toLowerCase();

  // Find relevant district context if mentioned
  const matchedDistrict = DISTRICTS_DATA.find(
    (d) => q.includes(d.name.toLowerCase()) || (query.districtContext && d.name.toLowerCase() === query.districtContext.toLowerCase())
  ) || DISTRICTS_DATA[0];

  const topNeedDistricts = [...DISTRICTS_DATA].sort((a, b) => b.developmentNeedIndex - a.developmentNeedIndex);

  // Deterministic smart fallback
  let fallbackAnswer = `Based on GLIS geospatial intelligence, **${matchedDistrict.name}** has a Development Need Index of **${matchedDistrict.developmentNeedIndex}/100** (Ranked #${topNeedDistricts.findIndex((d) => d.id === matchedDistrict.id) + 1} in priority). The primary recommended infrastructure is **${matchedDistrict.primaryRecommendedInfrastructure}** to serve its ${matchedDistrict.marginalizedPopulationPercent}% marginalized population.`;

  if (q.includes('top') || q.includes('priority') || q.includes('need')) {
    fallbackAnswer = `The top 5 development priority districts identified by the GLIS Socio-Economic Engine are:
1. **${topNeedDistricts[0].name}** (DNI: ${topNeedDistricts[0].developmentNeedIndex}/100) — Critical Healthcare Deficit
2. **${topNeedDistricts[1].name}** (DNI: ${topNeedDistricts[1].developmentNeedIndex}/100) — High Vulnerability & Deprivation
3. **${topNeedDistricts[2].name}** (DNI: ${topNeedDistricts[2].developmentNeedIndex}/100) — Arid Saline Water Deficit
4. **${topNeedDistricts[3].name}** (DNI: ${topNeedDistricts[3].developmentNeedIndex}/100) — Aspirational Tribal Education Need
5. **${topNeedDistricts[4].name}** (DNI: ${topNeedDistricts[4].developmentNeedIndex}/100) — Remote Transit Accessibility Deficit`;
  } else if (q.includes('hospital') || q.includes('health')) {
    fallbackAnswer = `Ahmedabad district exhibits severe healthcare deficits in outer talukas despite its urban core, with only 3 hospitals serving 7.2 million population (2.4 million people per hospital). The GLIS engine recommends secondary/tertiary healthcare hubs on unutilized government parcels like GLIS-GJ-AHM-2024-8891 (14.5 Acres) in Sanand or Dholera.`;
  } else if (q.includes('water') || q.includes('salin')) {
    fallbackAnswer = `Banaskantha's Vav and Tharad talukas have critical ground aquifer salinity (TDS > 3200 ppm) impacting 188,000 residents. The GLIS engine recommends siting a 5 MLD Solar-powered Water Treatment Plant in Morikha on Parcel GLIS-GJ-BAN-2024-1102.`;
  }

  const ai = getAiClient();
  if (!ai) {
    return {
      answer: fallbackAnswer,
      confidence: 0.98,
      referencedData: {
        districtsMentioned: [matchedDistrict.name],
        dniScore: matchedDistrict.developmentNeedIndex,
        recommendedType: matchedDistrict.primaryRecommendedInfrastructure,
        keyMetric: `Catchment Vulnerability: ${matchedDistrict.socioEconomicVulnerabilityScore}/100`,
      },
      suggestedAction: `View candidate sites in ${matchedDistrict.name} on the Intelligence Map.`,
    };
  }

  try {
    const prompt = `You are Ask GLIS, the AI Geospatial Decision Assistant for the Smart India Hackathon GLIS Platform.
The user asked: "${query.question}"

Use these factual geospatial analytics to compose a direct, authoritative, and helpful answer:
- Top Priority Districts: ${topNeedDistricts.map((d) => `${d.name} (DNI ${d.developmentNeedIndex})`).join(', ')}
- Current Focused District: ${matchedDistrict.name} (DNI ${matchedDistrict.developmentNeedIndex}/100, Population: ${matchedDistrict.population.toLocaleString()}, Priority Need: ${matchedDistrict.primaryRecommendedInfrastructure})
- Key Innovation: GLIS utilizes Equity-Weighted Multi-Criteria Decision Analysis (MCDA) so that infrastructure isn't just placed where land is cheapest, but where it serves the most underserved populations.

Rules:
- Be concise (2-4 paragraphs).
- Reference the exact DNI scores and district names provided.
- Do not invent fictitious numbers.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
    });

    const text = response.text || '';
    if (text) {
      return {
        answer: text,
        confidence: 0.96,
        referencedData: {
          districtsMentioned: [matchedDistrict.name],
          dniScore: matchedDistrict.developmentNeedIndex,
          recommendedType: matchedDistrict.primaryRecommendedInfrastructure,
        },
        suggestedAction: `Open ${matchedDistrict.name} in the Site Suitability Siting Engine.`,
      };
    }
  } catch (err) {
    console.error('Ask GLIS Gemini query error:', err);
  }

  return {
    answer: fallbackAnswer,
    confidence: 0.95,
    referencedData: {
      districtsMentioned: [matchedDistrict.name],
      dniScore: matchedDistrict.developmentNeedIndex,
      recommendedType: matchedDistrict.primaryRecommendedInfrastructure,
    },
    suggestedAction: `Inspect ${matchedDistrict.name} layer details.`,
  };
}
