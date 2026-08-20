export type UserRole = 'citizen' | 'official' | 'admin';

export type UserGender = 'Male' | 'Female' | 'Other';

export const OFFICIAL_DOMAINS = [
  'District Administration / Collectorate',
  'Land & Revenue Officer',
  'Town / Urban Planning Officer',
  'Rural Development Officer',
  'Infrastructure / PWD Officer',
  'Environment & Forest Officer',
  'Disaster Management Officer',
  'Agriculture & Rural Resources Officer',
  'GIS / Geospatial Officer',
  'Policy & Planning Officer',
  'Other',
] as const;

export type OfficialDomain = (typeof OFFICIAL_DOMAINS)[number];

export const GENDER_OPTIONS: UserGender[] = ['Male', 'Female', 'Other'];

export type Language = 'en' | 'hi' | 'gu';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  gender?: UserGender | string;
  phone?: string;
  domain?: string;
  customDomain?: string;
  designation?: string;
  department?: string;
  jurisdiction?: string;
  district?: string;
  state?: string;
  address?: string;
  avatar?: string;
}

export type LandUseCategory = 
  | 'Government'
  | 'Residential'
  | 'Commercial'
  | 'Agriculture'
  | 'Protected'
  | 'Industrial'
  | 'Water Body'
  | 'Other';

export type ParcelFilterType =
  | 'All'
  | 'Agriculture'
  | 'Residential'
  | 'Commercial'
  | 'Government'
  | 'Protected'
  | 'Other';

export type InfrastructureType =
  | 'Hospital'
  | 'Primary Health Center'
  | 'School'
  | 'College'
  | 'Police Station'
  | 'Fire Station'
  | 'Bus Stand'
  | 'Railway Station'
  | 'Airport'
  | 'Water Treatment'
  | 'Power Substation'
  | 'Road Network';

export type AssetCondition = 'Good' | 'Needs Repair' | 'Critical';
export type AssetStatus = 'Operational' | 'Under Maintenance' | 'Non-operational' | 'Planned';

export interface InfrastructureAsset {
  id: string;
  name: string;
  type: InfrastructureType;
  district: string;
  taluka: string;
  lat: number;
  lng: number;
  condition: AssetCondition;
  status: AssetStatus;
  capacity?: string;
  lastInspectionDate: string;
  currentUse: string;
  reportedIssuesCount: number;
  contactDepartment: string;
  yearBuilt: number;
}

export interface Parcel {
  id: string;
  parcelNumber: string;
  khasraNo?: string;
  ownerName?: string;
  suitabilityScore?: number;
  state?: string;
  district: string;
  taluka: string;
  village: string;
  city?: string;
  landUse: LandUseCategory;
  areaAcres: number;
  coordinates: [number, number][]; // Polygon coords [lat, lng]
  centerLat: number;
  centerLng: number;
  ownership: 'Government Revenue Land' | 'Private' | 'Forest Dept' | 'Panchayat' | 'Industrial Corp';
  restrictionLevel: 'Unrestricted' | 'Requires Environmental Assessment' | 'Protected / Restricted' | 'Context-Dependent';
  slopePercent: number;
  distanceToMajorRoadKm: number;
  distanceToPowerGridKm: number;
  distanceToWaterSupplyKm: number;
  estimatedLandCostPerAcreLakhs: number;
  floodRiskLevel: 'Low' | 'Moderate' | 'High';
  environmentalSensitivity: 'Low' | 'Medium' | 'High' | 'Critical';
  currentStatus: 'Vacant' | 'Partially Occupied' | 'Disputed' | 'Allotted';
  verificationStatus?: 'Verified' | 'Pending' | 'Disputed';
  zoneType?: 'Agricultural' | 'Residential' | 'Commercial' | 'Protected';
  lastUpdated?: string;
}

export interface JurisdictionState {
  code: string;
  name: string;
  districts: {
    id: string;
    name: string;
    talukas: string[];
  }[];
}

export interface DistrictMetrics {
  id: string;
  name: string;
  state: string;
  hq: string;
  centerLat: number;
  centerLng: number;
  zoomLevel: number;
  boundaryCoordinates: [number, number][]; // Polygon
  population: number;
  areaSqKm: number;
  populationDensity: number; // per sq km
  
  // Need & Deprivation Indices (0-100)
  developmentNeedIndex: number; // 0-100 overall score
  socioEconomicVulnerabilityScore: number; // 0-100
  healthcareDeficitScore: number; // 0-100 (high means lacking)
  educationDeficitScore: number; // 0-100
  roadAccessibilityScore: number; // 0-100 (high means poor access)
  economicDeprivationRate: number; // Percentage
  marginalizedPopulationPercent: number; // SC/ST/BPL %
  literacyRate: number; // %
  
  // Infrastructure Inventory
  totalHospitals: number;
  totalSchools: number;
  totalColleges: number;
  totalPoliceStations: number;
  totalBusStands: number;
  totalWaterPlants: number;
  criticalAssetsCount: number;
  needsRepairCount: number;
  
  // Land Use Breakdown (in %)
  landUseBreakdown: {
    agriculture: number;
    forest: number;
    governmentVacant: number;
    residential: number;
    commercial: number;
    industrial: number;
    waterBody: number;
  };
  
  primaryRecommendedInfrastructure: InfrastructureType;
  recommendedReasoning: string;
}

export interface SuitabilityWeights {
  accessibility: number; // default: 20
  populationDemand: number; // default: 20
  landSuitability: number; // default: 15
  existingInfrastructure: number; // default: 10
  estimatedCost: number; // default: 10
  environmentalRisk: number; // default: 10
  socioEconomicNeed: number; // default: 15 (Equity Weighting)
}

export interface CandidateSiteScore {
  siteId: string;
  parcelId: string;
  siteName: string;
  district: string;
  taluka: string;
  lat: number;
  lng: number;
  areaAcres: number;
  proposedType: InfrastructureType;
  
  // Final calculated score 0-100
  compositeScore: number;
  rank: number;
  
  // Raw sub-scores (0-100 each)
  factors: {
    accessibilityScore: number;
    populationDemandScore: number;
    landSuitabilityScore: number;
    existingInfrastructureScore: number;
    costFeasibilityScore: number;
    environmentalSafetyScore: number;
    socioEconomicEquityScore: number;
  };
  
  // Weighted contribution to total score (sums to compositeScore)
  weightedContributions: {
    accessibility: number;
    populationDemand: number;
    landSuitability: number;
    existingInfrastructure: number;
    estimatedCost: number;
    environmentalRisk: number;
    socioEconomicNeed: number;
  };
  
  servedPopulationCatchment: number;
  distanceToNearestCompetingAssetKm: number;
  estimatedCapitalExpenditureCr: number;
  justificationSummary: string;
  tradeOffNarrative: string;
  environmentalNotes: string;
}

export type ReportSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type ReportStatus = 'Submitted' | 'Under Review' | 'Verified' | 'Assigned' | 'In Progress' | 'Resolved';

export interface CitizenReport {
  id: string;
  citizenId: string;
  citizenName: string;
  citizenPhone?: string;
  category: InfrastructureType | 'Roads' | 'Water Supply' | 'Electricity' | 'Sanitation' | 'Other';
  district: string;
  taluka: string;
  locationName: string;
  lat: number;
  lng: number;
  description: string;
  severity: ReportSeverity;
  status: ReportStatus;
  photoUrl?: string;
  submittedAt: string;
  updatedAt: string;
  assignedDepartment?: string;
  officialNotes?: string;
  resolutionTimelineDays?: number;
}

export interface InfrastructureGap {
  id: string;
  gapType: string;
  category: InfrastructureType;
  district: string;
  taluka: string;
  severity: 'Moderate' | 'High' | 'Critical';
  affectedPopulation: number;
  nearestFacilityKm: number;
  vulnerabilityFactor: string;
  recommendedIntervention: string;
  estimatedCostCr: number;
  candidateSitesCount: number;
}

export interface SatelliteProject {
  id: string;
  projectName: string;
  district: string;
  type: InfrastructureType;
  lat: number;
  lng: number;
  plannedProgressPercent: number;
  detectedProgressPercent: number;
  status: 'On Track' | 'Minor Delay' | 'Behind Schedule' | 'Significantly Delayed';
  lastSatellitePassDate: string;
  sensor: string;
  ndbiIndex: number;
  vegetationClearingIndex: number;
  structuralFootprintSqMeters: number;
  inspectionNotes: string;
  beforeImageUrl: string;
  afterImageUrl: string;
}

export interface DataQualityAudit {
  overallQualityScore: number;
  totalRecordsChecked: number;
  validRecordsPercent: number;
  missingValuesPercent: number;
  invalidGeometryPercent: number;
  duplicateParcelsPercent: number;
  geocodingAccuracyPercent: number;
  attributeCompletenessPercent: number;
  lastAuditTimestamp: string;
  issues: {
    id: string;
    type: 'Duplicate' | 'Invalid Geometry' | 'Missing Attribute' | 'Geocoding Warning';
    layer: string;
    description: string;
    severity: 'Warning' | 'Error';
    status: 'Flagged' | 'Cleaned' | 'Ignored';
  }[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  entityType: 'Site Recommendation' | 'Weight Adjustment' | 'Citizen Grievance' | 'Dataset Ingestion' | 'Project Status';
  entityId: string;
  district?: string;
}

export interface AskGlisQuery {
  question: string;
  districtContext?: string;
  infrastructureContext?: string;
}

export interface AskGlisResponse {
  answer: string;
  confidence: number;
  referencedData: {
    districtsMentioned: string[];
    topCandidateSite?: string;
    dniScore?: number;
    recommendedType?: string;
    keyMetric?: string;
  };
  suggestedAction?: string;
}

export interface OfficerProject {
  id: string;
  name: string;
  category: string;
  taluka: string;
  district: string;
  status: 'In Progress' | 'Under Review' | 'Tendering' | 'Completed' | 'Delayed';
  progressPercentage: number;
  allocatedBudgetCr: number;
  startDate: string;
  targetCompletion: string;
  priority: 'High' | 'Critical' | 'Medium';
}

export interface UnutilizedParcel {
  id: string;
  ulpin: string;
  khasraNo: string;
  surveyNo: string;
  title: string;
  state: string;
  district: string;
  taluka: string;
  village: string;
  custodianMinistry: string;
  tenureClassification: 'Freehold' | 'Leasehold' | 'Government Sovereign' | 'Revenue Vesting' | 'Institutional';
  legalTitleStatus: 'Clean Title' | 'Vested Under Review' | 'Disputed / Encroached' | 'Encumbered';
  totalAreaHa: number;
  totalAreaAcres: number;
  totalAreaSqM: number;
  unusedAreaHa: number;
  unusedPercentage: number;
  averageSlope: string;
  slopePercent: number;
  soilBearingCapacity: string;
  floodPlainRisk: 'LOW RISK' | 'MODERATE RISK' | 'HIGH RISK';
  currentCircleRate: string;
  circleRateNum: number;
  estimatedAssetValue: string;
  assetValueCr: number;
  deadCapitalClassification: string;
  deadCapitalCr: number;
  dormancyYears: number;
  centroidLat: number;
  centroidLng: number;
  tehsilDistrict: string;
  highwayProximity: string;
  substationGrid: string;
  satelliteVerification: string;
  baselineYear: number;
  baselineNdvi: number;
  baselineLabel: string;
  currentYear: number;
  currentNdbi: number;
  driftAreaHa: number;
  driftPercentage: number;
  unauthorizedStructuresCount: number;
  currentStatusLabel: string;
  potentialUse: string[];
  cadastrePoints: [number, number][];
  unusedZonePoints: [number, number][];
}

export * from './temporal';
