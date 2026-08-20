export type TemporalYear = 2022 | 2023 | 2024 | 2025 | 2026;

export type TemporalFactor = 
  | 'overall' 
  | 'environment' 
  | 'accessibility' 
  | 'population' 
  | 'urbanization' 
  | 'change';

export interface AreaTemporalData {
  id: string;
  name: string;
  code: string;
  badgeNumber: number; // e.g. 7 for Limkheda #7, 5 for Garbada #5
  taluka: string;
  district: string;
  centerLat: number;
  centerLng: number;
  boundaryCoordinates: [number, number][]; // Leaflet polygon coordinates
  
  // Year-by-Year metrics for this specific zone
  yearlyMetrics: Record<TemporalYear, {
    overallScore: number; // 0-100
    environmentalScore: number; // 0-100
    accessibilityScore: number; // 0-100
    populationPressureScore: number; // 0-100
    urbanizationScore: number; // 0-100
    
    // Environmental Breakdown
    greenCoverPercent: number;
    waterAvailabilityScore: number;
    waterStressMitigationScore: number;
    agriculturalLandPreservedPercent: number;
    floodResilienceScore: number;
    
    // Accessibility Breakdown
    roadConnectivityScore: number;
    healthcareAccessScore: number;
    educationAccessScore: number;
    publicTransportScore: number;
    digitalConnectivityScore: number;
    avgTravelTimeToHospitalMins: number;
    
    // Population & Demographics
    totalPopulation: number;
    populationDensitySqKm: number;
    tribalConcentrationPercent: number;
    ruralPercentage: number;
    urbanPercentage: number;
    
    // Urbanization Breakdown
    builtUpAreaSqKm: number;
    builtUpPercentage: number;
    commercialConversionRatePercent: number;
    
    // Priority & Deficit Status
    priorityRank: number; // 1 = highest priority need
    dniDeficitScore: number;
    primaryDeficitCategory: string;
    recommendedIntervention: string;
  }>;
}

export interface DistrictTemporalSummary {
  districtId: string;
  districtName: string;
  yearlySummaries: Record<TemporalYear, {
    year: TemporalYear;
    overallDevelopmentScore: number;
    environmentalScore: number;
    accessibilityScore: number;
    populationPressureScore: number;
    urbanizationScore: number;
    
    // Environmental aggregated
    totalForestCoverSqKm: number;
    forestCoverPercent: number;
    waterBodyCount: number;
    waterCatchmentCapacityMCM: number;
    
    // Accessibility aggregated
    pavedRoadNetworkKm: number;
    villagesWithAllWeatherRoadsPercent: number;
    hospitalsOperational: number;
    primaryHealthCentersOperational: number;
    avgDistanceToEmergencyCareKm: number;
    
    // Population aggregated
    totalPopulation: number;
    growthRateYearOverYear: number;
    urbanPopulationPercent: number;
    ruralPopulationPercent: number;
    
    // Urbanization aggregated
    totalBuiltUpAreaSqKm: number;
    commercialGrowthIndex: number;
    infrastructureInvestmentCr: number;
  }>;
  
  // Overall 5-Year Progression Summary
  fiveYearGrowth: {
    overallImprovementPercent: number;
    environmentalShiftPercent: number;
    accessibilityImprovementPercent: number;
    populationGrowthPercent: number;
    urbanizationExpansionPercent: number;
    fastestGrowingSector: string;
    criticalPendingVulnerability: string;
  };
}

export interface TemporalDimensionWeights {
  environment: number; // default: 25
  accessibility: number; // default: 30
  population: number; // default: 20
  urbanization: number; // default: 25
}

export interface TemporalComparisonResult {
  fromYear: TemporalYear;
  toYear: TemporalYear;
  overallDelta: number;
  overallDeltaPercent: number;
  environmentalDelta: number;
  accessibilityDelta: number;
  populationDelta: number;
  urbanizationDelta: number;
  dimensionComparison: {
    dimension: string;
    fromValue: number;
    toValue: number;
    delta: number;
    deltaPercent: number;
    status: 'improved' | 'deteriorated' | 'stable';
  }[];
}
