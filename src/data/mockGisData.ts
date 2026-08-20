import {
  DistrictMetrics,
  Parcel,
  InfrastructureAsset,
  CitizenReport,
  InfrastructureGap,
  SatelliteProject,
  DataQualityAudit,
  AuditLog,
  User,
} from '../types';

export const DEMO_USERS: User[] = [
  {
    "id": "usr-off-1",
    "name": "Dr. Rajeshwar Sharma, IAS",
    "email": "rajeshwar.sharma@glis.gov.in",
    "role": "official",
    "designation": "District Development Officer (DDO)",
    "department": "Urban Development & Infrastructure Board",
    "jurisdiction": "Ahmedabad & Suburban Industrial Belt",
    "district": "Ahmedabad",
    "state": "Gujarat",
    "phone": "+91 98765 43210"
  },
  {
    "id": "usr-cit-1",
    "name": "Kavita Patel",
    "email": "kavita.patel@citizen.in",
    "role": "citizen",
    "district": "Ahmedabad",
    "state": "Gujarat",
    "phone": "+91 98111 22334"
  },
  {
    "id": "usr-adm-1",
    "name": "Ananya Deshmukh",
    "email": "admin@glis.gov.in",
    "role": "admin",
    "designation": "Chief Geospatial Data Administrator",
    "department": "National Land Records & GIS Directorate",
    "jurisdiction": "National & State Level Operations",
    "state": "Gujarat",
    "phone": "+91 98222 33445"
  }
];

export const DISTRICTS_DATA: DistrictMetrics[] = [
  {
    "id": "dist-ahmedabad",
    "name": "Ahmedabad",
    "state": "Gujarat",
    "hq": "Ahmedabad City",
    "centerLat": 23.0225,
    "centerLng": 72.5797,
    "zoomLevel": 11,
    "population": 7214225,
    "areaSqKm": 8107,
    "populationDensity": 890,
    "developmentNeedIndex": 82.5,
    "socioEconomicVulnerabilityScore": 14.47,
    "healthcareDeficitScore": 98,
    "educationDeficitScore": 35,
    "roadAccessibilityScore": 28,
    "economicDeprivationRate": 14.47,
    "marginalizedPopulationPercent": 11.7,
    "literacyRate": 85.31,
    "totalHospitals": 3,
    "totalSchools": 4111,
    "totalColleges": 152,
    "totalPoliceStations": 2,
    "totalBusStands": 2,
    "totalWaterPlants": 12,
    "criticalAssetsCount": 18,
    "needsRepairCount": 32,
    "landUseBreakdown": {
      "agriculture": 45,
      "forest": 2,
      "governmentVacant": 8,
      "residential": 25,
      "commercial": 12,
      "industrial": 6,
      "waterBody": 2
    },
    "primaryRecommendedInfrastructure": "Hospital",
    "recommendedReasoning": "Severe healthcare deficit with only 3 hospitals serving 7.2 million population (2.4M people per hospital). Critical need for secondary & tertiary healthcare nodes in outer rural and industrial talukas like Dholera, Dhandhuka, and Viramgam.",
    "boundaryCoordinates": [
      [
        23.35,
        71.95
      ],
      [
        23.4,
        72.35
      ],
      [
        23.2,
        72.85
      ],
      [
        22.85,
        72.8
      ],
      [
        22.45,
        72.65
      ],
      [
        22.15,
        72.3
      ],
      [
        22.2,
        71.9
      ],
      [
        22.75,
        72.15
      ],
      [
        23.05,
        71.9
      ],
      [
        23.35,
        71.95
      ]
    ]
  }
];

export const PARCELS_DATA: Parcel[] = [
  {
    "id": "pcl-ahm-01",
    "parcelNumber": "GLIS-GJ-AHM-2024-1001",
    "district": "Ahmedabad",
    "taluka": "Daskroi",
    "village": "Koteshwar",
    "landUse": "Agriculture",
    "zoneType": "Agricultural",
    "areaAcres": 16.4,
    "centerLat": 23.112,
    "centerLng": 72.602,
    "coordinates": [
      [
        23.115,
        72.598
      ],
      [
        23.117,
        72.606
      ],
      [
        23.109,
        72.608
      ],
      [
        23.107,
        72.599
      ],
      [
        23.115,
        72.598
      ]
    ],
    "ownership": "Private",
    "restrictionLevel": "Unrestricted",
    "slopePercent": 1.2,
    "distanceToMajorRoadKm": 0.3,
    "distanceToPowerGridKm": 0.5,
    "distanceToWaterSupplyKm": 0.4,
    "estimatedLandCostPerAcreLakhs": 42,
    "floodRiskLevel": "Moderate",
    "environmentalSensitivity": "Low",
    "currentStatus": "Partially Occupied",
    "verificationStatus": "Verified",
    "lastUpdated": "10 mins ago"
  },
  {
    "id": "pcl-ahm-03",
    "parcelNumber": "GLIS-GJ-AHM-2024-1003",
    "district": "Ahmedabad",
    "taluka": "Ghatlodiya",
    "village": "Tragad",
    "landUse": "Agriculture",
    "zoneType": "Agricultural",
    "areaAcres": 19.5,
    "centerLat": 23.128,
    "centerLng": 72.574,
    "coordinates": [
      [
        23.132,
        72.568
      ],
      [
        23.134,
        72.58
      ],
      [
        23.123,
        72.581
      ],
      [
        23.121,
        72.57
      ],
      [
        23.132,
        72.568
      ]
    ],
    "ownership": "Government Revenue Land",
    "restrictionLevel": "Unrestricted",
    "slopePercent": 1.5,
    "distanceToMajorRoadKm": 0.2,
    "distanceToPowerGridKm": 0.4,
    "distanceToWaterSupplyKm": 0.8,
    "estimatedLandCostPerAcreLakhs": 55,
    "floodRiskLevel": "Low",
    "environmentalSensitivity": "Low",
    "currentStatus": "Vacant",
    "verificationStatus": "Verified",
    "lastUpdated": "1 hour ago"
  },
  {
    "id": "pcl-ahm-07",
    "parcelNumber": "GLIS-GJ-AHM-2024-1007",
    "district": "Ahmedabad",
    "taluka": "Ghatlodiya",
    "village": "Jaspur",
    "landUse": "Agriculture",
    "zoneType": "Agricultural",
    "areaAcres": 17.8,
    "centerLat": 23.152,
    "centerLng": 72.534,
    "coordinates": [
      [
        23.156,
        72.528
      ],
      [
        23.158,
        72.54
      ],
      [
        23.147,
        72.542
      ],
      [
        23.145,
        72.53
      ],
      [
        23.156,
        72.528
      ]
    ],
    "ownership": "Private",
    "restrictionLevel": "Unrestricted",
    "slopePercent": 1.2,
    "distanceToMajorRoadKm": 0.4,
    "distanceToPowerGridKm": 0.5,
    "distanceToWaterSupplyKm": 0.7,
    "estimatedLandCostPerAcreLakhs": 45,
    "floodRiskLevel": "Low",
    "environmentalSensitivity": "Low",
    "currentStatus": "Vacant",
    "verificationStatus": "Verified",
    "lastUpdated": "Yesterday"
  },
  {
    "id": "pcl-ahm-08",
    "parcelNumber": "GLIS-GJ-AHM-2024-1008",
    "district": "Ahmedabad",
    "taluka": "Ghatlodiya",
    "village": "Khoraj",
    "landUse": "Agriculture",
    "zoneType": "Agricultural",
    "areaAcres": 15,
    "centerLat": 23.142,
    "centerLng": 72.562,
    "coordinates": [
      [
        23.146,
        72.556
      ],
      [
        23.148,
        72.568
      ],
      [
        23.137,
        72.569
      ],
      [
        23.135,
        72.558
      ],
      [
        23.146,
        72.556
      ]
    ],
    "ownership": "Private",
    "restrictionLevel": "Unrestricted",
    "slopePercent": 1,
    "distanceToMajorRoadKm": 0.3,
    "distanceToPowerGridKm": 0.4,
    "distanceToWaterSupplyKm": 0.5,
    "estimatedLandCostPerAcreLakhs": 52,
    "floodRiskLevel": "Low",
    "environmentalSensitivity": "Low",
    "currentStatus": "Disputed",
    "verificationStatus": "Disputed",
    "lastUpdated": "2 days ago"
  },
  {
    "id": "pcl-ahm-10",
    "parcelNumber": "GLIS-GJ-AHM-2024-1010",
    "district": "Ahmedabad",
    "taluka": "Asarwa",
    "village": "Asarwa East",
    "landUse": "Agriculture",
    "zoneType": "Agricultural",
    "areaAcres": 11.2,
    "centerLat": 23.044,
    "centerLng": 72.602,
    "coordinates": [
      [
        23.048,
        72.596
      ],
      [
        23.05,
        72.608
      ],
      [
        23.04,
        72.609
      ],
      [
        23.038,
        72.598
      ],
      [
        23.048,
        72.596
      ]
    ],
    "ownership": "Government Revenue Land",
    "restrictionLevel": "Unrestricted",
    "slopePercent": 0.8,
    "distanceToMajorRoadKm": 0.1,
    "distanceToPowerGridKm": 0.2,
    "distanceToWaterSupplyKm": 0.3,
    "estimatedLandCostPerAcreLakhs": 75,
    "floodRiskLevel": "Low",
    "environmentalSensitivity": "Low",
    "currentStatus": "Vacant",
    "verificationStatus": "Verified",
    "lastUpdated": "3 days ago"
  },
  {
    "id": "pcl-dah-01",
    "parcelNumber": "GLIS-GJ-AHM-2024-8891",
    "district": "Ahmedabad",
    "taluka": "Sanand",
    "village": "Sanand GIDC Outskirts",
    "landUse": "Agriculture",
    "zoneType": "Agricultural",
    "areaAcres": 14.5,
    "centerLat": 22.9868,
    "centerLng": 72.3807,
    "coordinates": [
      [
        22.99,
        72.376
      ],
      [
        22.992,
        72.384
      ],
      [
        22.982,
        72.385
      ],
      [
        22.98,
        72.378
      ],
      [
        22.99,
        72.376
      ]
    ],
    "ownership": "Government Revenue Land",
    "restrictionLevel": "Unrestricted",
    "slopePercent": 2.1,
    "distanceToMajorRoadKm": 0.4,
    "distanceToPowerGridKm": 0.8,
    "distanceToWaterSupplyKm": 1.2,
    "estimatedLandCostPerAcreLakhs": 8.5,
    "floodRiskLevel": "Low",
    "environmentalSensitivity": "Low",
    "currentStatus": "Vacant",
    "verificationStatus": "Verified",
    "lastUpdated": "3 days ago"
  },
  {
    "id": "pcl-dah-02",
    "parcelNumber": "GLIS-GJ-AHM-2024-8892",
    "district": "Ahmedabad",
    "taluka": "Dholera",
    "village": "Dholera SIR Block 4",
    "landUse": "Agriculture",
    "zoneType": "Agricultural",
    "areaAcres": 22,
    "centerLat": 22.253,
    "centerLng": 72.191,
    "coordinates": [
      [
        22.257,
        72.186
      ],
      [
        22.259,
        72.195
      ],
      [
        22.249,
        72.196
      ],
      [
        22.247,
        72.188
      ],
      [
        22.257,
        72.186
      ]
    ],
    "ownership": "Government Revenue Land",
    "restrictionLevel": "Unrestricted",
    "slopePercent": 3.4,
    "distanceToMajorRoadKm": 1.1,
    "distanceToPowerGridKm": 1.4,
    "distanceToWaterSupplyKm": 0.9,
    "estimatedLandCostPerAcreLakhs": 6.2,
    "floodRiskLevel": "Low",
    "environmentalSensitivity": "Low",
    "currentStatus": "Vacant",
    "verificationStatus": "Verified",
    "lastUpdated": "4 days ago"
  },
  {
    "id": "pcl-dah-03",
    "parcelNumber": "GLIS-GJ-AHM-2024-4412",
    "district": "Ahmedabad",
    "taluka": "Viramgam",
    "village": "Viramgam Logistics Zone",
    "landUse": "Agriculture",
    "zoneType": "Agricultural",
    "areaAcres": 18.2,
    "centerLat": 23.1191,
    "centerLng": 72.0326,
    "coordinates": [
      [
        23.123,
        72.028
      ],
      [
        23.125,
        72.037
      ],
      [
        23.115,
        72.038
      ],
      [
        23.113,
        72.03
      ],
      [
        23.123,
        72.028
      ]
    ],
    "ownership": "Private",
    "restrictionLevel": "Requires Environmental Assessment",
    "slopePercent": 4.8,
    "distanceToMajorRoadKm": 0.6,
    "distanceToPowerGridKm": 1.1,
    "distanceToWaterSupplyKm": 2.1,
    "estimatedLandCostPerAcreLakhs": 14,
    "floodRiskLevel": "Moderate",
    "environmentalSensitivity": "Medium",
    "currentStatus": "Partially Occupied",
    "verificationStatus": "Pending",
    "lastUpdated": "5 days ago"
  },
  {
    "id": "pcl-ahm-11",
    "parcelNumber": "GLIS-GJ-AHM-2024-1011",
    "district": "Ahmedabad",
    "taluka": "Daskroi",
    "village": "Hanspura South",
    "landUse": "Agriculture",
    "zoneType": "Agricultural",
    "areaAcres": 24.1,
    "centerLat": 23.092,
    "centerLng": 72.678,
    "coordinates": [
      [
        23.097,
        72.671
      ],
      [
        23.099,
        72.685
      ],
      [
        23.086,
        72.686
      ],
      [
        23.084,
        72.673
      ],
      [
        23.097,
        72.671
      ]
    ],
    "ownership": "Private",
    "restrictionLevel": "Unrestricted",
    "slopePercent": 1,
    "distanceToMajorRoadKm": 0.5,
    "distanceToPowerGridKm": 0.6,
    "distanceToWaterSupplyKm": 0.8,
    "estimatedLandCostPerAcreLakhs": 46,
    "floodRiskLevel": "Low",
    "environmentalSensitivity": "Low",
    "currentStatus": "Vacant",
    "verificationStatus": "Verified",
    "lastUpdated": "5 days ago"
  },
  {
    "id": "pcl-ahm-12",
    "parcelNumber": "GLIS-GJ-AHM-2024-1012",
    "district": "Ahmedabad",
    "taluka": "Daskroi",
    "village": "Naroda Farmlands",
    "landUse": "Agriculture",
    "zoneType": "Agricultural",
    "areaAcres": 16,
    "centerLat": 23.072,
    "centerLng": 72.658,
    "coordinates": [
      [
        23.076,
        72.652
      ],
      [
        23.078,
        72.664
      ],
      [
        23.067,
        72.665
      ],
      [
        23.065,
        72.654
      ],
      [
        23.076,
        72.652
      ]
    ],
    "ownership": "Private",
    "restrictionLevel": "Unrestricted",
    "slopePercent": 1.1,
    "distanceToMajorRoadKm": 0.3,
    "distanceToPowerGridKm": 0.4,
    "distanceToWaterSupplyKm": 0.6,
    "estimatedLandCostPerAcreLakhs": 58,
    "floodRiskLevel": "Low",
    "environmentalSensitivity": "Low",
    "currentStatus": "Vacant",
    "verificationStatus": "Pending",
    "lastUpdated": "6 days ago"
  },
  {
    "id": "pcl-res-01",
    "parcelNumber": "GLIS-GJ-AHM-2024-2001",
    "district": "Ahmedabad",
    "taluka": "Sabarmati",
    "village": "New Ranip Urban",
    "landUse": "Residential",
    "zoneType": "Residential",
    "areaAcres": 10.5,
    "centerLat": 23.085,
    "centerLng": 72.562,
    "coordinates": [
      [
        23.089,
        72.556
      ],
      [
        23.091,
        72.568
      ],
      [
        23.08,
        72.569
      ],
      [
        23.078,
        72.558
      ],
      [
        23.089,
        72.556
      ]
    ],
    "ownership": "Private",
    "restrictionLevel": "Unrestricted",
    "slopePercent": 0.7,
    "distanceToMajorRoadKm": 0.1,
    "distanceToPowerGridKm": 0.2,
    "distanceToWaterSupplyKm": 0.2,
    "estimatedLandCostPerAcreLakhs": 95,
    "floodRiskLevel": "Low",
    "environmentalSensitivity": "Low",
    "currentStatus": "Allotted",
    "verificationStatus": "Verified",
    "lastUpdated": "30 mins ago"
  },
  {
    "id": "pcl-res-02",
    "parcelNumber": "GLIS-GJ-AHM-2024-2002",
    "district": "Ahmedabad",
    "taluka": "Ghatlodiya",
    "village": "Gota Housing Sector",
    "landUse": "Residential",
    "zoneType": "Residential",
    "areaAcres": 14,
    "centerLat": 23.114,
    "centerLng": 72.542,
    "coordinates": [
      [
        23.118,
        72.536
      ],
      [
        23.12,
        72.548
      ],
      [
        23.109,
        72.549
      ],
      [
        23.107,
        72.538
      ],
      [
        23.118,
        72.536
      ]
    ],
    "ownership": "Government Revenue Land",
    "restrictionLevel": "Unrestricted",
    "slopePercent": 0.9,
    "distanceToMajorRoadKm": 0.2,
    "distanceToPowerGridKm": 0.3,
    "distanceToWaterSupplyKm": 0.4,
    "estimatedLandCostPerAcreLakhs": 88,
    "floodRiskLevel": "Low",
    "environmentalSensitivity": "Low",
    "currentStatus": "Vacant",
    "verificationStatus": "Verified",
    "lastUpdated": "1 hour ago"
  },
  {
    "id": "pcl-res-03",
    "parcelNumber": "GLIS-GJ-AHM-2024-2003",
    "district": "Ahmedabad",
    "taluka": "Ghatlodiya",
    "village": "Chandkheda Extension",
    "landUse": "Residential",
    "zoneType": "Residential",
    "areaAcres": 8.8,
    "centerLat": 23.102,
    "centerLng": 72.582,
    "coordinates": [
      [
        23.105,
        72.578
      ],
      [
        23.107,
        72.586
      ],
      [
        23.098,
        72.587
      ],
      [
        23.096,
        72.579
      ],
      [
        23.105,
        72.578
      ]
    ],
    "ownership": "Private",
    "restrictionLevel": "Unrestricted",
    "slopePercent": 0.6,
    "distanceToMajorRoadKm": 0.1,
    "distanceToPowerGridKm": 0.2,
    "distanceToWaterSupplyKm": 0.3,
    "estimatedLandCostPerAcreLakhs": 110,
    "floodRiskLevel": "Low",
    "environmentalSensitivity": "Low",
    "currentStatus": "Allotted",
    "verificationStatus": "Verified",
    "lastUpdated": "2 hours ago"
  },
  {
    "id": "pcl-res-06",
    "parcelNumber": "GLIS-GJ-AHM-2024-2006",
    "district": "Ahmedabad",
    "taluka": "Sabarmati",
    "village": "Motera North Residential",
    "landUse": "Residential",
    "zoneType": "Residential",
    "areaAcres": 7.2,
    "centerLat": 23.098,
    "centerLng": 72.594,
    "coordinates": [
      [
        23.102,
        72.588
      ],
      [
        23.104,
        72.6
      ],
      [
        23.093,
        72.601
      ],
      [
        23.091,
        72.59
      ],
      [
        23.102,
        72.588
      ]
    ],
    "ownership": "Private",
    "restrictionLevel": "Unrestricted",
    "slopePercent": 0.6,
    "distanceToMajorRoadKm": 0.1,
    "distanceToPowerGridKm": 0.2,
    "distanceToWaterSupplyKm": 0.2,
    "estimatedLandCostPerAcreLakhs": 120,
    "floodRiskLevel": "Low",
    "environmentalSensitivity": "Low",
    "currentStatus": "Disputed",
    "verificationStatus": "Disputed",
    "lastUpdated": "Yesterday"
  },
  {
    "id": "pcl-res-07",
    "parcelNumber": "GLIS-GJ-AHM-2024-2007",
    "district": "Ahmedabad",
    "taluka": "Daskroi",
    "village": "Nava Naroda Housing Layout",
    "landUse": "Residential",
    "zoneType": "Residential",
    "areaAcres": 15.2,
    "centerLat": 23.078,
    "centerLng": 72.672,
    "coordinates": [
      [
        23.082,
        72.666
      ],
      [
        23.084,
        72.678
      ],
      [
        23.073,
        72.679
      ],
      [
        23.071,
        72.668
      ],
      [
        23.082,
        72.666
      ]
    ],
    "ownership": "Panchayat",
    "restrictionLevel": "Unrestricted",
    "slopePercent": 0.9,
    "distanceToMajorRoadKm": 0.3,
    "distanceToPowerGridKm": 0.3,
    "distanceToWaterSupplyKm": 0.5,
    "estimatedLandCostPerAcreLakhs": 70,
    "floodRiskLevel": "Low",
    "environmentalSensitivity": "Low",
    "currentStatus": "Vacant",
    "verificationStatus": "Verified",
    "lastUpdated": "2 days ago"
  },
  {
    "id": "pcl-res-09",
    "parcelNumber": "GLIS-GJ-AHM-2024-2009",
    "district": "Ahmedabad",
    "taluka": "Daskroi",
    "village": "Kuber Nagar Urban Pocket",
    "landUse": "Residential",
    "zoneType": "Residential",
    "areaAcres": 6.5,
    "centerLat": 23.064,
    "centerLng": 72.628,
    "coordinates": [
      [
        23.067,
        72.624
      ],
      [
        23.069,
        72.632
      ],
      [
        23.06,
        72.633
      ],
      [
        23.059,
        72.625
      ],
      [
        23.067,
        72.624
      ]
    ],
    "ownership": "Private",
    "restrictionLevel": "Unrestricted",
    "slopePercent": 0.4,
    "distanceToMajorRoadKm": 0.1,
    "distanceToPowerGridKm": 0.1,
    "distanceToWaterSupplyKm": 0.2,
    "estimatedLandCostPerAcreLakhs": 130,
    "floodRiskLevel": "Low",
    "environmentalSensitivity": "Low",
    "currentStatus": "Partially Occupied",
    "verificationStatus": "Verified",
    "lastUpdated": "3 days ago"
  },
  {
    "id": "pcl-res-10",
    "parcelNumber": "GLIS-GJ-AHM-2024-2010",
    "district": "Ahmedabad",
    "taluka": "Sabarmati",
    "village": "Chenpur Colony",
    "landUse": "Residential",
    "zoneType": "Residential",
    "areaAcres": 8,
    "centerLat": 23.104,
    "centerLng": 72.568,
    "coordinates": [
      [
        23.107,
        72.564
      ],
      [
        23.109,
        72.572
      ],
      [
        23.1,
        72.573
      ],
      [
        23.099,
        72.565
      ],
      [
        23.107,
        72.564
      ]
    ],
    "ownership": "Private",
    "restrictionLevel": "Unrestricted",
    "slopePercent": 0.6,
    "distanceToMajorRoadKm": 0.2,
    "distanceToPowerGridKm": 0.2,
    "distanceToWaterSupplyKm": 0.3,
    "estimatedLandCostPerAcreLakhs": 90,
    "floodRiskLevel": "Low",
    "environmentalSensitivity": "Low",
    "currentStatus": "Partially Occupied",
    "verificationStatus": "Pending",
    "lastUpdated": "4 days ago"
  },
  {
    "id": "pcl-res-11",
    "parcelNumber": "GLIS-GJ-AHM-2024-2011",
    "district": "Ahmedabad",
    "taluka": "Ghatlodiya",
    "village": "Bhagvat Nagar Housing",
    "landUse": "Residential",
    "zoneType": "Residential",
    "areaAcres": 11,
    "centerLat": 23.082,
    "centerLng": 72.528,
    "coordinates": [
      [
        23.086,
        72.522
      ],
      [
        23.088,
        72.534
      ],
      [
        23.077,
        72.535
      ],
      [
        23.075,
        72.524
      ],
      [
        23.086,
        72.522
      ]
    ],
    "ownership": "Private",
    "restrictionLevel": "Unrestricted",
    "slopePercent": 0.8,
    "distanceToMajorRoadKm": 0.2,
    "distanceToPowerGridKm": 0.3,
    "distanceToWaterSupplyKm": 0.3,
    "estimatedLandCostPerAcreLakhs": 85,
    "floodRiskLevel": "Low",
    "environmentalSensitivity": "Low",
    "currentStatus": "Vacant",
    "verificationStatus": "Verified",
    "lastUpdated": "5 days ago"
  },
  {
    "id": "pcl-com-02",
    "parcelNumber": "GLIS-GJ-AHM-2024-3002",
    "district": "Ahmedabad",
    "taluka": "Sabarmati",
    "village": "Sabarmati Riverfront Commercial Parcel",
    "landUse": "Commercial",
    "zoneType": "Commercial",
    "areaAcres": 14.2,
    "centerLat": 23.072,
    "centerLng": 72.584,
    "coordinates": [
      [
        23.076,
        72.578
      ],
      [
        23.078,
        72.59
      ],
      [
        23.067,
        72.591
      ],
      [
        23.065,
        72.58
      ],
      [
        23.076,
        72.578
      ]
    ],
    "ownership": "Industrial Corp",
    "restrictionLevel": "Unrestricted",
    "slopePercent": 0.5,
    "distanceToMajorRoadKm": 0.1,
    "distanceToPowerGridKm": 0.1,
    "distanceToWaterSupplyKm": 0.1,
    "estimatedLandCostPerAcreLakhs": 210,
    "floodRiskLevel": "Moderate",
    "environmentalSensitivity": "Medium",
    "currentStatus": "Vacant",
    "verificationStatus": "Verified",
    "lastUpdated": "45 mins ago"
  },
  {
    "id": "pcl-com-04",
    "parcelNumber": "GLIS-GJ-AHM-2024-3004",
    "district": "Ahmedabad",
    "taluka": "Ghatlodiya",
    "village": "S.G. Highway Retail & Logistics Sector",
    "landUse": "Commercial",
    "zoneType": "Commercial",
    "areaAcres": 11.5,
    "centerLat": 23.108,
    "centerLng": 72.528,
    "coordinates": [
      [
        23.112,
        72.522
      ],
      [
        23.114,
        72.534
      ],
      [
        23.103,
        72.535
      ],
      [
        23.101,
        72.524
      ],
      [
        23.112,
        72.522
      ]
    ],
    "ownership": "Private",
    "restrictionLevel": "Unrestricted",
    "slopePercent": 0.6,
    "distanceToMajorRoadKm": 0.05,
    "distanceToPowerGridKm": 0.1,
    "distanceToWaterSupplyKm": 0.2,
    "estimatedLandCostPerAcreLakhs": 195,
    "floodRiskLevel": "Low",
    "environmentalSensitivity": "Low",
    "currentStatus": "Allotted",
    "verificationStatus": "Verified",
    "lastUpdated": "3 hours ago"
  },
  {
    "id": "pcl-com-06",
    "parcelNumber": "GLIS-GJ-AHM-2024-3006",
    "district": "Ahmedabad",
    "taluka": "Asarwa",
    "village": "Sarangpur Logistics Depot",
    "landUse": "Commercial",
    "zoneType": "Commercial",
    "areaAcres": 9.8,
    "centerLat": 23.028,
    "centerLng": 72.608,
    "coordinates": [
      [
        23.032,
        72.602
      ],
      [
        23.034,
        72.614
      ],
      [
        23.023,
        72.615
      ],
      [
        23.021,
        72.604
      ],
      [
        23.032,
        72.602
      ]
    ],
    "ownership": "Private",
    "restrictionLevel": "Unrestricted",
    "slopePercent": 0.5,
    "distanceToMajorRoadKm": 0.1,
    "distanceToPowerGridKm": 0.1,
    "distanceToWaterSupplyKm": 0.2,
    "estimatedLandCostPerAcreLakhs": 175,
    "floodRiskLevel": "Low",
    "environmentalSensitivity": "Low",
    "currentStatus": "Partially Occupied",
    "verificationStatus": "Disputed",
    "lastUpdated": "Yesterday"
  },
  {
    "id": "pcl-com-07",
    "parcelNumber": "GLIS-GJ-AHM-2024-3007",
    "district": "Ahmedabad",
    "taluka": "Daskroi",
    "village": "Naroda Industrial Arcade",
    "landUse": "Commercial",
    "zoneType": "Commercial",
    "areaAcres": 13,
    "centerLat": 23.084,
    "centerLng": 72.652,
    "coordinates": [
      [
        23.088,
        72.646
      ],
      [
        23.09,
        72.658
      ],
      [
        23.079,
        72.659
      ],
      [
        23.077,
        72.648
      ],
      [
        23.088,
        72.646
      ]
    ],
    "ownership": "Industrial Corp",
    "restrictionLevel": "Unrestricted",
    "slopePercent": 0.8,
    "distanceToMajorRoadKm": 0.15,
    "distanceToPowerGridKm": 0.2,
    "distanceToWaterSupplyKm": 0.4,
    "estimatedLandCostPerAcreLakhs": 115,
    "floodRiskLevel": "Low",
    "environmentalSensitivity": "Low",
    "currentStatus": "Vacant",
    "verificationStatus": "Verified",
    "lastUpdated": "Yesterday"
  },
  {
    "id": "pcl-com-08",
    "parcelNumber": "GLIS-GJ-AHM-2024-3008",
    "district": "Ahmedabad",
    "taluka": "Sabarmati",
    "village": "Ranip Transit Mall Land",
    "landUse": "Commercial",
    "zoneType": "Commercial",
    "areaAcres": 8.4,
    "centerLat": 23.076,
    "centerLng": 72.572,
    "coordinates": [
      [
        23.08,
        72.566
      ],
      [
        23.082,
        72.578
      ],
      [
        23.071,
        72.579
      ],
      [
        23.069,
        72.568
      ],
      [
        23.08,
        72.566
      ]
    ],
    "ownership": "Government Revenue Land",
    "restrictionLevel": "Unrestricted",
    "slopePercent": 0.6,
    "distanceToMajorRoadKm": 0.05,
    "distanceToPowerGridKm": 0.1,
    "distanceToWaterSupplyKm": 0.2,
    "estimatedLandCostPerAcreLakhs": 180,
    "floodRiskLevel": "Low",
    "environmentalSensitivity": "Low",
    "currentStatus": "Vacant",
    "verificationStatus": "Verified",
    "lastUpdated": "2 days ago"
  },
  {
    "id": "pcl-pro-05",
    "parcelNumber": "GLIS-GJ-AHM-2024-4005",
    "district": "Ahmedabad",
    "taluka": "Daskroi",
    "village": "Sahijpur Water Recharge Basin",
    "landUse": "Protected",
    "zoneType": "Protected",
    "areaAcres": 22.4,
    "centerLat": 23.052,
    "centerLng": 72.638,
    "coordinates": [
      [
        23.057,
        72.63
      ],
      [
        23.06,
        72.646
      ],
      [
        23.046,
        72.648
      ],
      [
        23.043,
        72.632
      ],
      [
        23.057,
        72.63
      ]
    ],
    "ownership": "Government Revenue Land",
    "restrictionLevel": "Protected / Restricted",
    "slopePercent": 1.5,
    "distanceToMajorRoadKm": 0.6,
    "distanceToPowerGridKm": 0.8,
    "distanceToWaterSupplyKm": 0.1,
    "estimatedLandCostPerAcreLakhs": 55,
    "floodRiskLevel": "High",
    "environmentalSensitivity": "High",
    "currentStatus": "Vacant",
    "verificationStatus": "Verified",
    "lastUpdated": "3 days ago"
  },
  {
    "id": "pcl-pro-06",
    "parcelNumber": "GLIS-GJ-AHM-2024-9905",
    "district": "Ahmedabad",
    "taluka": "Mandal",
    "village": "Mandal Grasslands protected zone",
    "landUse": "Protected",
    "zoneType": "Protected",
    "areaAcres": 35,
    "centerLat": 23.2882,
    "centerLng": 72.0152,
    "coordinates": [
      [
        23.294,
        72.008
      ],
      [
        23.298,
        72.022
      ],
      [
        23.282,
        72.023
      ],
      [
        23.278,
        72.009
      ],
      [
        23.294,
        72.008
      ]
    ],
    "ownership": "Forest Dept",
    "restrictionLevel": "Protected / Restricted",
    "slopePercent": 12.5,
    "distanceToMajorRoadKm": 4.8,
    "distanceToPowerGridKm": 6.2,
    "distanceToWaterSupplyKm": 5,
    "estimatedLandCostPerAcreLakhs": 25,
    "floodRiskLevel": "High",
    "environmentalSensitivity": "Critical",
    "currentStatus": "Vacant",
    "verificationStatus": "Pending",
    "lastUpdated": "5 days ago"
  },
  {
    "id": "pcl-gov-01",
    "parcelNumber": "GLIS-GJ-AHM-2024-5001",
    "district": "Ahmedabad",
    "taluka": "Ahmedabad City",
    "village": "Ahmedabad City Revenue Reserve",
    "landUse": "Government",
    "zoneType": "Commercial",
    "areaAcres": 28.5,
    "centerLat": 23.0276,
    "centerLng": 72.5797,
    "coordinates": [
      [
        23.032,
        72.573
      ],
      [
        23.034,
        72.585
      ],
      [
        23.022,
        72.586
      ],
      [
        23.02,
        72.574
      ],
      [
        23.032,
        72.573
      ]
    ],
    "ownership": "Government Revenue Land",
    "restrictionLevel": "Unrestricted",
    "slopePercent": 0.8,
    "distanceToMajorRoadKm": 0.1,
    "distanceToPowerGridKm": 0.2,
    "distanceToWaterSupplyKm": 0.2,
    "estimatedLandCostPerAcreLakhs": 45,
    "floodRiskLevel": "Low",
    "environmentalSensitivity": "Low",
    "currentStatus": "Vacant",
    "verificationStatus": "Verified",
    "lastUpdated": "2 hours ago"
  },
  {
    "id": "pcl-gov-02",
    "parcelNumber": "GLIS-GJ-AHM-2024-5002",
    "district": "Ahmedabad",
    "taluka": "Daskroi",
    "village": "Daskroi Block Revenue Campus",
    "landUse": "Government",
    "zoneType": "Commercial",
    "areaAcres": 19.2,
    "centerLat": 22.965,
    "centerLng": 72.682,
    "coordinates": [
      [
        22.969,
        72.675
      ],
      [
        22.971,
        72.689
      ],
      [
        22.96,
        72.69
      ],
      [
        22.958,
        72.677
      ],
      [
        22.969,
        72.675
      ]
    ],
    "ownership": "Government Revenue Land",
    "restrictionLevel": "Unrestricted",
    "slopePercent": 1.1,
    "distanceToMajorRoadKm": 0.2,
    "distanceToPowerGridKm": 0.3,
    "distanceToWaterSupplyKm": 0.4,
    "estimatedLandCostPerAcreLakhs": 18,
    "floodRiskLevel": "Low",
    "environmentalSensitivity": "Low",
    "currentStatus": "Vacant",
    "verificationStatus": "Verified",
    "lastUpdated": "5 hours ago"
  },
  {
    "id": "pcl-gov-04",
    "parcelNumber": "GLIS-GJ-AHM-2024-5004",
    "district": "Ahmedabad",
    "taluka": "Dholera",
    "village": "Dholera Sub-Treasury & Revenue Land",
    "landUse": "Government",
    "zoneType": "Commercial",
    "areaAcres": 14.8,
    "centerLat": 22.253,
    "centerLng": 72.191,
    "coordinates": [
      [
        22.257,
        72.186
      ],
      [
        22.259,
        72.195
      ],
      [
        22.249,
        72.196
      ],
      [
        22.247,
        72.188
      ],
      [
        22.257,
        72.186
      ]
    ],
    "ownership": "Government Revenue Land",
    "restrictionLevel": "Unrestricted",
    "slopePercent": 1.4,
    "distanceToMajorRoadKm": 0.3,
    "distanceToPowerGridKm": 0.4,
    "distanceToWaterSupplyKm": 0.5,
    "estimatedLandCostPerAcreLakhs": 12.5,
    "floodRiskLevel": "Low",
    "environmentalSensitivity": "Low",
    "currentStatus": "Vacant",
    "verificationStatus": "Pending",
    "lastUpdated": "2 days ago"
  },
  {
    "id": "pcl-oth-01",
    "parcelNumber": "GLIS-GJ-AHM-2024-6001",
    "district": "Ahmedabad",
    "taluka": "Ahmedabad City",
    "village": "Kankaria Lake Catchment & Water Body Basin",
    "landUse": "Other",
    "zoneType": "Protected",
    "areaAcres": 38,
    "centerLat": 23.0063,
    "centerLng": 72.5997,
    "coordinates": [
      [
        23.012,
        72.592
      ],
      [
        23.014,
        72.607
      ],
      [
        22.999,
        72.609
      ],
      [
        22.997,
        72.594
      ],
      [
        23.012,
        72.592
      ]
    ],
    "ownership": "Panchayat",
    "restrictionLevel": "Requires Environmental Assessment",
    "slopePercent": 1.8,
    "distanceToMajorRoadKm": 0.5,
    "distanceToPowerGridKm": 0.8,
    "distanceToWaterSupplyKm": 0,
    "estimatedLandCostPerAcreLakhs": 22,
    "floodRiskLevel": "High",
    "environmentalSensitivity": "High",
    "currentStatus": "Vacant",
    "verificationStatus": "Verified",
    "lastUpdated": "3 hours ago"
  },
  {
    "id": "pcl-oth-02",
    "parcelNumber": "GLIS-GJ-AHM-2024-6002",
    "district": "Ahmedabad",
    "taluka": "Daskroi",
    "village": "Vatva Mixed Industrial Corridor 4",
    "landUse": "Other",
    "zoneType": "Commercial",
    "areaAcres": 24.5,
    "centerLat": 22.985,
    "centerLng": 72.645,
    "coordinates": [
      [
        22.99,
        72.638
      ],
      [
        22.992,
        72.652
      ],
      [
        22.979,
        72.654
      ],
      [
        22.977,
        72.64
      ],
      [
        22.99,
        72.638
      ]
    ],
    "ownership": "Industrial Corp",
    "restrictionLevel": "Unrestricted",
    "slopePercent": 0.7,
    "distanceToMajorRoadKm": 0.1,
    "distanceToPowerGridKm": 0.1,
    "distanceToWaterSupplyKm": 0.3,
    "estimatedLandCostPerAcreLakhs": 140,
    "floodRiskLevel": "Low",
    "environmentalSensitivity": "Medium",
    "currentStatus": "Partially Occupied",
    "verificationStatus": "Verified",
    "lastUpdated": "1 day ago"
  },
  {
    "id": "pcl-oth-03",
    "parcelNumber": "GLIS-GJ-AHM-2024-6003",
    "district": "Ahmedabad",
    "taluka": "Viramgam",
    "village": "Viramgam Semi-Arid Wasteland Plot",
    "landUse": "Other",
    "zoneType": "Agricultural",
    "areaAcres": 42,
    "centerLat": 23.1191,
    "centerLng": 72.0326,
    "coordinates": [
      [
        23.125,
        72.025
      ],
      [
        23.128,
        72.04
      ],
      [
        23.112,
        72.042
      ],
      [
        23.11,
        72.027
      ],
      [
        23.125,
        72.025
      ]
    ],
    "ownership": "Government Revenue Land",
    "restrictionLevel": "Unrestricted",
    "slopePercent": 4.2,
    "distanceToMajorRoadKm": 1.8,
    "distanceToPowerGridKm": 2.2,
    "distanceToWaterSupplyKm": 2.5,
    "estimatedLandCostPerAcreLakhs": 5.5,
    "floodRiskLevel": "Low",
    "environmentalSensitivity": "Low",
    "currentStatus": "Vacant",
    "verificationStatus": "Verified",
    "lastUpdated": "4 days ago"
  }
];

export const INFRASTRUCTURE_ASSETS: InfrastructureAsset[] = [
  {
    "id": "ast-001",
    "name": "Ahmedabad Civil Hospital",
    "type": "Hospital",
    "district": "Ahmedabad",
    "taluka": "Ahmedabad City",
    "lat": 23.048,
    "lng": 72.605,
    "condition": "Good",
    "status": "Operational",
    "capacity": "2000 Beds",
    "lastInspectionDate": "2024-04-12",
    "currentUse": "State Level Referral Hospital",
    "reportedIssuesCount": 0,
    "contactDepartment": "Health & Family Welfare Dept",
    "yearBuilt": 1988
  },
  {
    "id": "ast-002",
    "name": "Sanand Sub-District Hospital",
    "type": "Hospital",
    "district": "Ahmedabad",
    "taluka": "Sanand",
    "lat": 22.9868,
    "lng": 72.3807,
    "condition": "Needs Repair",
    "status": "Operational",
    "capacity": "150 Beds",
    "lastInspectionDate": "2024-01-18",
    "currentUse": "Industrial Area Secondary Referral Hospital",
    "reportedIssuesCount": 3,
    "contactDepartment": "Health & Family Welfare Dept",
    "yearBuilt": 1994
  },
  {
    "id": "ast-003",
    "name": "Ahmedabad Model Secondary School",
    "type": "School",
    "district": "Ahmedabad",
    "taluka": "Ahmedabad City",
    "lat": 23.0276,
    "lng": 72.5797,
    "condition": "Good",
    "status": "Operational",
    "capacity": "1200 Students",
    "lastInspectionDate": "2024-05-02",
    "currentUse": "Urban Primary/Secondary Education",
    "reportedIssuesCount": 0,
    "contactDepartment": "Education Department",
    "yearBuilt": 2004
  },
  {
    "id": "ast-004",
    "name": "Gita Mandir GSRTC Central Bus Terminal",
    "type": "Bus Stand",
    "district": "Ahmedabad",
    "taluka": "Ahmedabad City",
    "lat": 23.0165,
    "lng": 72.5921,
    "condition": "Good",
    "status": "Operational",
    "capacity": "40 Bus Bays",
    "lastInspectionDate": "2024-06-10",
    "currentUse": "State Inter-city transit terminal",
    "reportedIssuesCount": 1,
    "contactDepartment": "Gujarat State Road Transport Corp",
    "yearBuilt": 2017
  }
];

export const CITIZEN_REPORTS: CitizenReport[] = [
  {
    "id": "rep-101",
    "citizenId": "usr-cit-1",
    "citizenName": "Kavita Patel",
    "citizenPhone": "+91 98111 22334",
    "category": "Hospital",
    "district": "Ahmedabad",
    "taluka": "Sanand",
    "locationName": "Near Sanand GIDC Outskirts",
    "lat": 22.9868,
    "lng": 72.3807,
    "description": "The local healthcare clinic is facing severe equipment failure and lacks capacity. Expectant mothers and emergency patients must travel over 40km into Ahmedabad City core for basic trauma and maternal care.",
    "severity": "Critical",
    "status": "Verified",
    "photoUrl": "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&auto=format&fit=crop&q=80",
    "submittedAt": "2024-07-14 09:30",
    "updatedAt": "2024-07-15 14:10",
    "assignedDepartment": "District Health Office & R&B Division",
    "officialNotes": "Site visited by Taluka Health Officer. Verification confirmed: clinic space is too small and lacks emergency services. Flagged for urgent GLIS capital recommendation.",
    "resolutionTimelineDays": 45
  },
  {
    "id": "rep-102",
    "citizenId": "usr-cit-2",
    "citizenName": "Rameshwar Tadvi",
    "citizenPhone": "+91 97234 56789",
    "category": "Roads",
    "district": "Ahmedabad",
    "taluka": "Viramgam",
    "locationName": "Viramgam Rural Access Highway",
    "lat": 23.1191,
    "lng": 72.0326,
    "description": "Culvert bridge partially collapsed during monsoon floods. Heavy buses and milk collection tankers cannot pass; 12 villages cut off from daily commerce.",
    "severity": "High",
    "status": "In Progress",
    "photoUrl": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80",
    "submittedAt": "2024-07-18 11:15",
    "updatedAt": "2024-07-20 16:45",
    "assignedDepartment": "Roads & Buildings (State Highway)",
    "officialNotes": "Temporary bypass road constructed. Tender sanctioned for permanent 2-lane box culvert bridge.",
    "resolutionTimelineDays": 60
  }
];

export const INFRASTRUCTURE_GAPS: InfrastructureGap[] = [
  {
    "id": "gap-001",
    "gapType": "Severe Secondary Emergency Healthcare Deficit",
    "category": "Hospital",
    "district": "Ahmedabad",
    "taluka": "Sanand - Bavla Industrial Corridor",
    "severity": "Critical",
    "affectedPopulation": 620000,
    "nearestFacilityKm": 34.8,
    "vulnerabilityFactor": "Extreme healthcare deficit: only 3 hospitals serving 7.2 million population. Outer industrial areas suffer from lack of primary/secondary emergency support.",
    "recommendedIntervention": "Commission a 100-bed Sub-District Hospital with 24x7 Neonatal ICU and Trauma Stabilization Unit.",
    "estimatedCostCr": 42.5,
    "candidateSitesCount": 3
  }
];

export const SATELLITE_PROJECTS: SatelliteProject[] = [
  {
    "id": "sat-prj-01",
    "projectName": "Sanand 100-Bed Sub-District Hospital Construction",
    "district": "Ahmedabad",
    "type": "Hospital",
    "lat": 22.9868,
    "lng": 72.3807,
    "plannedProgressPercent": 75,
    "detectedProgressPercent": 54,
    "status": "Behind Schedule",
    "lastSatellitePassDate": "2024-08-10",
    "sensor": "Sentinel-2 Multispectral (10m) + Cartosat-3 High-Res",
    "ndbiIndex": 0.42,
    "vegetationClearingIndex": 0.88,
    "structuralFootprintSqMeters": 4850,
    "inspectionNotes": "Foundation and column casting verified via optical reflectance. Superstructure RCC slab casting delayed by 42 days due to concrete batching plant outage.",
    "beforeImageUrl": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format&fit=crop&q=80",
    "afterImageUrl": "https://images.unsplash.com/photo-1541888946425-d0fbb18015f6?w=600&auto=format&fit=crop&q=80"
  }
];

export const DATA_QUALITY_AUDIT: DataQualityAudit = {
  "overallQualityScore": 94.2,
  "totalRecordsChecked": 18450,
  "validRecordsPercent": 96.4,
  "missingValuesPercent": 2.1,
  "invalidGeometryPercent": 0.5,
  "duplicateParcelsPercent": 0.6,
  "geocodingAccuracyPercent": 98.2,
  "attributeCompletenessPercent": 95.8,
  "lastAuditTimestamp": "2024-08-16 04:00 IST (Automated Daily GIS Cron)",
  "issues": [
    {
      "id": "dqi-01",
      "type": "Duplicate",
      "layer": "Land Parcels (Sanand Taluka)",
      "description": "Duplicate Revenue Survey polygon detected: Parcel #GLIS-GJ-AHM-8812 overlaps 98% with #GLIS-GJ-AHM-8813.",
      "severity": "Error",
      "status": "Flagged"
    },
    {
      "id": "dqi-02",
      "type": "Invalid Geometry",
      "layer": "Protected Boundaries",
      "description": "Self-intersecting polygon boundary detected in Sanand Industrial Zone vertex [22.986, 72.380].",
      "severity": "Error",
      "status": "Cleaned"
    },
    {
      "id": "dqi-03",
      "type": "Missing Attribute",
      "layer": "Primary Health Centers",
      "description": "Missing operational bed capacity and emergency contact for 4 PHCs in Viramgam Taluka.",
      "severity": "Warning",
      "status": "Flagged"
    },
    {
      "id": "dqi-04",
      "type": "Geocoding Warning",
      "layer": "Citizen Reports",
      "description": "Report #rep-102 coordinates fall 35m outside declared village administrative boundary.",
      "severity": "Warning",
      "status": "Ignored"
    }
  ]
};

export const AUDIT_LOGS_DATA: AuditLog[] = [
  {
    "id": "aud-902",
    "timestamp": "2024-08-15 16:45:00 IST",
    "userId": "usr-adm-1",
    "userName": "Ananya Deshmukh",
    "userRole": "admin",
    "action": "Adjusted State Policy Weight Profile",
    "details": "Increased Socio-Economic Need Weight from 10% to 15% across all tribal aspirational districts as per State NITI Aayog guidelines.",
    "entityType": "Weight Adjustment",
    "entityId": "wp-equity-standard-v2",
    "district": "All Districts"
  }
];

// Compatibility alias exports
export const MOCK_DISTRICTS = DISTRICTS_DATA;
export const MOCK_PARCELS = PARCELS_DATA;
export const MOCK_INFRASTRUCTURE = INFRASTRUCTURE_ASSETS;
export const MOCK_CITIZEN_REPORTS = CITIZEN_REPORTS;
export const MOCK_GAPS = INFRASTRUCTURE_GAPS;
export const MOCK_SATELLITE_PROJECTS = SATELLITE_PROJECTS;
export const MOCK_DATA_QUALITY_AUDIT = DATA_QUALITY_AUDIT;
export const MOCK_AUDIT_LOGS = AUDIT_LOGS_DATA;
