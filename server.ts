import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  AUDIT_LOGS_DATA,
  CITIZEN_REPORTS,
  DATA_QUALITY_AUDIT,
  DEMO_USERS,
  DISTRICTS_DATA,
  INFRASTRUCTURE_ASSETS,
  INFRASTRUCTURE_GAPS,
  PARCELS_DATA,
  SATELLITE_PROJECTS,
} from './src/data/mockGisData';
import { UNUTILIZED_PARCELS } from './src/data/unutilizedParcelsData';
import { JURISDICTION_STATES, TALUKA_CENTROIDS } from './src/data/jurisdictionData';
import { calculateCandidateSiteScores, DEFAULT_WEIGHTS } from './src/services/scoringEngine';
import { explainSiteRecommendation, queryAskGlis } from './src/services/geminiService';
import { CitizenReport, InfrastructureType, SuitabilityWeights, User, UserRole } from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // In-memory mutable state initialized from demonstration dataset
  let users: User[] = [...DEMO_USERS];
  let citizenReports: CitizenReport[] = [...CITIZEN_REPORTS];
  let auditLogs = [...AUDIT_LOGS_DATA];
  let parcels = [...PARCELS_DATA];
  let currentWeights: SuitabilityWeights = { ...DEFAULT_WEIGHTS };

  // ================= API ROUTES =================

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', platform: 'Bhoo Drishti / GLIS Geospatial Intelligence Platform', version: '1.0.0' });
  });

  // Auth endpoints

  // 1. Create Account / Register
  app.post('/api/auth/register', (req: Request, res: Response) => {
    const {
      name,
      email,
      password,
      confirmPassword,
      role,
      phone,
      gender,
      domain,
      customDomain,
      address,
      state,
      district,
    } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Full Name is required.' });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, error: 'Email address is required.' });
    }

    if (!password) {
      return res.status(400).json({ success: false, error: 'Password is required.' });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ success: false, error: 'Passwords do not match. Please re-enter identical passwords.' });
    }

    if (phone && phone.replace(/\D/g, '').length < 10) {
      return res.status(400).json({ success: false, error: 'Please enter a valid 10-digit phone number.' });
    }

    const assignedRole: UserRole = role === 'official' ? 'official' : 'citizen';
    
    let resolvedDomain = domain;
    if (assignedRole === 'official') {
      if (!domain) {
        resolvedDomain = 'District Administration / Collectorate';
      } else if (domain === 'Other') {
        if (!customDomain || !customDomain.trim()) {
          return res.status(400).json({ success: false, error: 'Please specify your official domain / designation.' });
        }
        resolvedDomain = customDomain.trim();
      }
    }

    const validGender = ['Male', 'Female', 'Other'].includes(gender) ? gender : 'Other';

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: assignedRole,
      phone: phone?.trim() || '+91 98765 43210',
      gender: validGender,
      domain: assignedRole === 'official' ? resolvedDomain : undefined,
      customDomain: assignedRole === 'official' && domain === 'Other' ? customDomain?.trim() : undefined,
      designation: assignedRole === 'official' ? resolvedDomain : undefined,
      department: assignedRole === 'official' ? `${resolvedDomain} Division` : undefined,
      jurisdiction: assignedRole === 'official' ? `${district || 'Ahmedabad'} District & State Jurisdiction` : undefined,
      address: address || '',
      state: state || 'Gujarat',
      district: district || 'Ahmedabad',
    };

    // Check if user already exists
    const existingIndex = users.findIndex((u) => u.email.toLowerCase() === newUser.email.toLowerCase());
    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...newUser };
    } else {
      users.push(newUser);
    }

    auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      userId: newUser.id,
      userName: newUser.name,
      userRole: newUser.role,
      action: `${assignedRole === 'official' ? 'Official' : 'Citizen'} Account Registered`,
      details: `New ${assignedRole} account created for ${newUser.name} (${newUser.gender}, Domain: ${newUser.domain || 'Resident'}, Phone: ${newUser.phone}) in ${newUser.state}.`,
      entityType: 'Citizen Grievance',
      entityId: newUser.id,
      district: newUser.district || 'State Level',
    });

    res.json({
      success: true,
      message: 'Account created successfully.',
      user: newUser,
      token: `bhoo-jwt-${newUser.id}-${Date.now()}`,
    });
  });

  // 2. Official Portal - Direct Sign-In with Email & Password
  app.post('/api/auth/official/login', (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Official email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Find or create official user profile
    let officialUser = users.find((u) => u.email.toLowerCase() === cleanEmail && u.role === 'official');
    if (!officialUser) {
      officialUser = {
        id: `usr-off-${Date.now()}`,
        name: cleanEmail.includes('sharma') ? 'Dr. Rajeshwar Sharma, IAS' : cleanEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase()) + ', IAS',
        email: cleanEmail,
        role: 'official',
        designation: 'District Development Officer (DDO)',
        department: 'Urban Development & Infrastructure Board',
        jurisdiction: 'Ahmedabad & Suburban Industrial Belt',
        district: 'Ahmedabad',
        state: 'Gujarat',
        phone: '+91 98765 43210',
      };
      users.push(officialUser);
    }

    auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      userId: officialUser.id,
      userName: officialUser.name,
      userRole: 'official',
      action: 'Official Sign-In',
      details: `Official ${officialUser.name} signed in successfully.`,
      entityType: 'Site Recommendation',
      entityId: officialUser.id,
      district: officialUser.district,
    });

    res.json({
      success: true,
      message: 'Official authentication successful.',
      user: officialUser,
      token: `bhoo-official-jwt-${officialUser.id}-${Date.now()}`,
    });
  });

  // 3. Citizen Portal - Sign-In with Email, Password & All Indian States Address Selection
  app.post('/api/auth/citizen/login', (req: Request, res: Response) => {
    const { email, password, address, state } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let citizenUser = users.find((u) => u.email.toLowerCase() === cleanEmail && u.role === 'citizen');

    if (!citizenUser) {
      citizenUser = {
        id: `usr-cit-${Date.now()}`,
        name: cleanEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        email: cleanEmail,
        role: 'citizen',
        address: address || 'Resident Address',
        state: state || 'Gujarat',
        district: 'Ahmedabad',
        phone: '+91 98111 22334',
      };
      users.push(citizenUser);
    } else {
      if (address) citizenUser.address = address;
      if (state) citizenUser.state = state;
    }

    auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      userId: citizenUser.id,
      userName: citizenUser.name,
      userRole: 'citizen',
      action: 'Citizen Portal Sign-In',
      details: `Citizen ${citizenUser.name} authenticated with registered state: ${citizenUser.state}.`,
      entityType: 'Citizen Grievance',
      entityId: citizenUser.id,
      district: citizenUser.district,
    });

    res.json({
      success: true,
      message: 'Citizen authenticated successfully.',
      user: citizenUser,
      token: `bhoo-citizen-jwt-${citizenUser.id}-${Date.now()}`,
    });
  });

  // Backward compatible login endpoint
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, role } = req.body;
    let foundUser = users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase());
    
    if (!foundUser) {
      foundUser = users.find((u) => u.role === (role || 'official')) || users[0];
    }

    res.json({
      success: true,
      user: foundUser,
      token: `glis-jwt-${foundUser.id}-${Date.now()}`,
    });
  });

  // Jurisdiction Hierarchy API: State -> District -> City / Taluka
  app.get('/api/hierarchy', (req: Request, res: Response) => {
    res.json({
      success: true,
      states: JURISDICTION_STATES,
      talukaCentroids: TALUKA_CENTROIDS,
    });
  });

  // Jurisdiction States List
  app.get('/api/jurisdiction/states', (req: Request, res: Response) => {
    res.json({
      success: true,
      states: JURISDICTION_STATES.map((s) => ({ code: s.code, name: s.name, districtCount: s.districts.length })),
    });
  });

  // Jurisdiction Districts for State
  app.get('/api/jurisdiction/districts', (req: Request, res: Response) => {
    const { state } = req.query;
    let result = DISTRICTS_DATA;
    if (state) {
      result = DISTRICTS_DATA.filter((d) => d.state.toLowerCase() === String(state).toLowerCase());
    }
    res.json({ success: true, count: result.length, districts: result });
  });

  // Jurisdiction Cities/Talukas for District
  app.get('/api/jurisdiction/cities', (req: Request, res: Response) => {
    const { state, district } = req.query;
    let talukas: string[] = [];

    const foundState = JURISDICTION_STATES.find(
      (s) => !state || s.name.toLowerCase() === String(state).toLowerCase()
    );

    if (foundState) {
      if (district) {
        const foundDist = foundState.districts.find(
          (d) => d.name.toLowerCase() === String(district).toLowerCase() || d.id === district
        );
        if (foundDist) {
          talukas = foundDist.talukas;
        }
      } else {
        talukas = foundState.districts.flatMap((d) => d.talukas);
      }
    }

    res.json({ success: true, count: talukas.length, cities: talukas, talukas });
  });

  // Districts
  app.get('/api/districts', (req: Request, res: Response) => {
    const { state } = req.query;
    let list = DISTRICTS_DATA;
    if (state) {
      list = list.filter((d) => d.state.toLowerCase() === String(state).toLowerCase());
    }
    res.json({ success: true, districts: list });
  });

  app.get('/api/districts/:id', (req: Request, res: Response) => {
    const district = DISTRICTS_DATA.find((d) => d.id === req.params.id);
    if (!district) {
      return res.status(404).json({ success: false, error: 'District not found' });
    }
    res.json({ success: true, district });
  });

  // Parcels with advanced multi-parameter hierarchical filtering (state, district, city/taluka, landUse, verificationStatus)
  app.get('/api/parcels', (req: Request, res: Response) => {
    const { state, district, city, taluka, landUse, verificationStatus } = req.query;
    let list = [...parcels];

    if (state) {
      const stateDistricts = DISTRICTS_DATA.filter(
        (d) => d.state.toLowerCase() === String(state).toLowerCase()
      ).map((d) => d.name.toLowerCase());
      list = list.filter((p) => {
        if (p.state && p.state.toLowerCase() === String(state).toLowerCase()) return true;
        return stateDistricts.includes(p.district.toLowerCase());
      });
    }

    if (district && String(district).toLowerCase() !== 'all') {
      list = list.filter(
        (p) => p.district.toLowerCase() === String(district).toLowerCase()
      );
    }

    const cityOrTaluka = city || taluka;
    if (cityOrTaluka && String(cityOrTaluka).toLowerCase() !== 'all') {
      list = list.filter(
        (p) =>
          (p.taluka && p.taluka.toLowerCase() === String(cityOrTaluka).toLowerCase()) ||
          (p.village && p.village.toLowerCase() === String(cityOrTaluka).toLowerCase()) ||
          (p.city && p.city.toLowerCase() === String(cityOrTaluka).toLowerCase())
      );
    }

    if (landUse) {
      const lu = String(landUse).toLowerCase();
      if (lu === 'all') {
        // no-op
      } else if (lu === 'agriculture' || lu === 'agricultural') {
        list = list.filter((p) => p.landUse === 'Agriculture' || p.zoneType === 'Agricultural');
      } else if (lu === 'residential') {
        list = list.filter((p) => p.landUse === 'Residential' || p.zoneType === 'Residential');
      } else if (lu === 'commercial') {
        list = list.filter((p) => p.landUse === 'Commercial' || p.zoneType === 'Commercial');
      } else if (lu === 'government' || lu === 'govt') {
        list = list.filter((p) => p.landUse === 'Government' || p.ownership === 'Government Revenue Land');
      } else if (lu === 'protected' || lu === 'forest') {
        list = list.filter((p) => p.landUse === 'Protected' || p.ownership === 'Forest Dept' || p.zoneType === 'Protected');
      } else if (lu === 'other') {
        list = list.filter((p) => p.landUse === 'Other' || p.landUse === 'Industrial' || p.landUse === 'Water Body');
      } else {
        list = list.filter((p) => p.landUse.toLowerCase() === lu);
      }
    }

    if (verificationStatus) {
      list = list.filter(
        (p) => (p.verificationStatus || 'Verified').toLowerCase() === String(verificationStatus).toLowerCase()
      );
    }

    res.json({
      success: true,
      count: list.length,
      totalAcres: Number(list.reduce((acc, p) => acc + (p.areaAcres || 0), 0).toFixed(1)),
      parcels: list,
    });
  });

  // Parcels Breakdown Statistics API
  app.get('/api/parcels/stats', (req: Request, res: Response) => {
    const { state, district, city, taluka } = req.query;
    let list = [...parcels];

    if (state) {
      const stateDistricts = DISTRICTS_DATA.filter(
        (d) => d.state.toLowerCase() === String(state).toLowerCase()
      ).map((d) => d.name.toLowerCase());
      list = list.filter((p) => {
        if (p.state && p.state.toLowerCase() === String(state).toLowerCase()) return true;
        return stateDistricts.includes(p.district.toLowerCase());
      });
    }

    if (district && String(district).toLowerCase() !== 'all') {
      list = list.filter((p) => p.district.toLowerCase() === String(district).toLowerCase());
    }

    const cityOrTaluka = city || taluka;
    if (cityOrTaluka && String(cityOrTaluka).toLowerCase() !== 'all') {
      list = list.filter(
        (p) =>
          (p.taluka && p.taluka.toLowerCase() === String(cityOrTaluka).toLowerCase()) ||
          (p.village && p.village.toLowerCase() === String(cityOrTaluka).toLowerCase()) ||
          (p.city && p.city.toLowerCase() === String(cityOrTaluka).toLowerCase())
      );
    }

    const computeGroup = (predicate: (p: any) => boolean) => {
      const subset = list.filter(predicate);
      const acres = Number(subset.reduce((acc, p) => acc + (p.areaAcres || 0), 0).toFixed(1));
      const verified = subset.filter((p) => p.verificationStatus === 'Verified').length;
      return {
        count: subset.length,
        totalAcres: acres,
        verifiedCount: verified,
        pendingCount: subset.filter((p) => p.verificationStatus === 'Pending').length,
        disputedCount: subset.filter((p) => p.verificationStatus === 'Disputed').length,
      };
    };

    const stats = {
      total: {
        count: list.length,
        totalAcres: Number(list.reduce((acc, p) => acc + (p.areaAcres || 0), 0).toFixed(1)),
      },
      agriculture: computeGroup((p) => p.landUse === 'Agriculture' || p.zoneType === 'Agricultural'),
      residential: computeGroup((p) => p.landUse === 'Residential' || p.zoneType === 'Residential'),
      commercial: computeGroup((p) => p.landUse === 'Commercial' || p.zoneType === 'Commercial'),
      government: computeGroup((p) => p.landUse === 'Government' || p.ownership === 'Government Revenue Land'),
      protected: computeGroup((p) => p.landUse === 'Protected' || p.ownership === 'Forest Dept' || p.zoneType === 'Protected'),
      other: computeGroup((p) => p.landUse === 'Other' || p.landUse === 'Industrial' || p.landUse === 'Water Body'),
    };

    res.json({ success: true, state: state || 'All', district: district || 'All', city: cityOrTaluka || 'All', stats });
  });

  // Query Parcels Category Metrics API
  app.get('/api/parcels/category-metrics', (req: Request, res: Response) => {
    const { category, state, district, city, taluka } = req.query;
    const catStr = String(category || 'All').toLowerCase();
    let list = [...parcels];

    if (state) {
      const stateDistricts = DISTRICTS_DATA.filter(
        (d) => d.state.toLowerCase() === String(state).toLowerCase()
      ).map((d) => d.name.toLowerCase());
      list = list.filter((p) => {
        if (p.state && p.state.toLowerCase() === String(state).toLowerCase()) return true;
        return stateDistricts.includes(p.district.toLowerCase());
      });
    }

    if (district && String(district).toLowerCase() !== 'all') {
      list = list.filter((p) => p.district.toLowerCase() === String(district).toLowerCase());
    }

    const cityOrTaluka = city || taluka;
    if (cityOrTaluka && String(cityOrTaluka).toLowerCase() !== 'all') {
      list = list.filter(
        (p) =>
          (p.taluka && p.taluka.toLowerCase() === String(cityOrTaluka).toLowerCase()) ||
          (p.village && p.village.toLowerCase() === String(cityOrTaluka).toLowerCase()) ||
          (p.city && p.city.toLowerCase() === String(cityOrTaluka).toLowerCase())
      );
    }

    let filtered = list;
    if (catStr === 'agriculture' || catStr === 'agricultural') {
      filtered = list.filter((p) => p.landUse === 'Agriculture' || p.zoneType === 'Agricultural');
    } else if (catStr === 'residential') {
      filtered = list.filter((p) => p.landUse === 'Residential' || p.zoneType === 'Residential');
    } else if (catStr === 'commercial') {
      filtered = list.filter((p) => p.landUse === 'Commercial' || p.zoneType === 'Commercial');
    } else if (catStr === 'government') {
      filtered = list.filter((p) => p.landUse === 'Government' || p.ownership === 'Government Revenue Land');
    } else if (catStr === 'protected' || catStr === 'forest') {
      filtered = list.filter((p) => p.landUse === 'Protected' || p.ownership === 'Forest Dept' || p.zoneType === 'Protected');
    } else if (catStr === 'other') {
      filtered = list.filter((p) => p.landUse === 'Other' || p.landUse === 'Industrial' || p.landUse === 'Water Body');
    }

    const verified = filtered.filter((p) => p.verificationStatus === 'Verified').length;
    const pending = filtered.filter((p) => p.verificationStatus === 'Pending').length;
    const disputed = filtered.filter((p) => p.verificationStatus === 'Disputed').length;
    const totalAcres = Number(filtered.reduce((acc, p) => acc + (p.areaAcres || 0), 0).toFixed(1));
    const qualityScore = filtered.length > 0
      ? (catStr === 'all' ? 69 : Math.min(100, Math.round(((verified * 1.0 + pending * 0.4) / filtered.length) * 100)))
      : 0;

    const talukaBreakdown: Record<string, number> = {};
    filtered.forEach((p) => {
      const t = p.taluka || p.district;
      talukaBreakdown[t] = (talukaBreakdown[t] || 0) + 1;
    });

    res.json({
      success: true,
      category: category || 'All',
      state: state || 'All',
      district: district || 'All',
      city: cityOrTaluka || 'All',
      totalParcels: filtered.length,
      totalAcres,
      verifiedCount: verified,
      pendingCount: pending,
      disputedCount: disputed,
      dataQualityScore: qualityScore,
      talukaBreakdown,
      parcels: filtered,
    });
  });

  // Find Development Land Endpoint
  app.all('/api/parcels/find-development-land', (req: Request, res: Response) => {
    const infraType = String(req.query.infrastructureType || req.body?.infrastructureType || 'Roads').trim();
    const requiredArea = Math.max(0.1, Number(req.query.requiredArea || req.body?.requiredArea || 5));
    const district = req.query.district || req.body?.district;

    let pool = parcels.filter((p) => p.restrictionLevel !== 'Protected / Restricted');
    if (district && String(district).toLowerCase() !== 'all') {
      pool = pool.filter((p) => p.district.toLowerCase() === String(district).toLowerCase());
    }
    if (pool.length === 0) pool = parcels.slice(0, 10);

    const scored = pool.map((p) => {
      let baseScore = 70;

      // Area match score
      const areaRatio = p.areaAcres >= requiredArea ? 1 : p.areaAcres / requiredArea;
      baseScore += areaRatio * 15;

      // Ownership preference
      if (p.ownership === 'Government Revenue Land') baseScore += 12;
      else if (p.currentStatus === 'Vacant') baseScore += 6;

      // Verification preference
      if (p.verificationStatus === 'Verified') baseScore += 8;
      else if (p.verificationStatus === 'Disputed') baseScore -= 20;

      // Flood & Environmental safety
      if (p.floodRiskLevel === 'Low') baseScore += 5;
      else if (p.floodRiskLevel === 'High') baseScore -= 18;

      if (p.slopePercent <= 3) baseScore += 5;
      else if (p.slopePercent > 8) baseScore -= 12;

      // Infrastructure specific weights
      const infraLower = infraType.toLowerCase();
      if (infraLower.includes('road')) {
        baseScore += Math.max(0, 15 - p.distanceToMajorRoadKm * 3);
      } else if (infraLower.includes('bridge')) {
        if (p.distanceToWaterSupplyKm <= 2.5) baseScore += 15;
      } else if (infraLower.includes('airport')) {
        if (p.areaAcres >= 15 && p.slopePercent <= 2.5) baseScore += 20;
        else if (p.areaAcres < requiredArea) baseScore -= 15;
      } else if (infraLower.includes('power')) {
        baseScore += Math.max(0, 15 - p.distanceToPowerGridKm * 4);
      } else if (infraLower.includes('hospital')) {
        baseScore += Math.max(0, 15 - p.distanceToMajorRoadKm * 5);
        if (p.floodRiskLevel === 'Low') baseScore += 5;
      } else if (infraLower.includes('school')) {
        baseScore += Math.max(0, 15 - p.distanceToMajorRoadKm * 4);
        if (p.verificationStatus === 'Verified') baseScore += 5;
      } else if (infraLower.includes('railway')) {
        baseScore += Math.max(0, 12 - p.distanceToMajorRoadKm * 3);
        if (p.areaAcres >= requiredArea) baseScore += 8;
      }

      const finalScore = Math.min(100, Math.max(10, Math.round(baseScore)));

      return {
        id: p.id,
        parcelNumber: p.parcelNumber,
        district: p.district,
        taluka: p.taluka,
        village: p.village,
        areaAcres: p.areaAcres,
        ownership: p.ownership,
        landUse: p.landUse,
        suitabilityScore: finalScore,
        currentStatus: p.currentStatus,
        verificationStatus: p.verificationStatus,
        distanceToMajorRoadKm: p.distanceToMajorRoadKm,
        floodRiskLevel: p.floodRiskLevel,
        centerLat: p.centerLat,
        centerLng: p.centerLng,
        coordinates: p.coordinates,
      };
    });

    // Sort descending by suitability score
    scored.sort((a, b) => b.suitabilityScore - a.suitabilityScore);

    res.json({
      success: true,
      infrastructureType: infraType,
      requiredArea,
      totalEvaluated: pool.length,
      bestAvailableLand: scored.slice(0, 5),
    });
  });

  // Query Parcels by Zone Slug
  app.get('/api/parcels/by-zone/:zone', (req: Request, res: Response) => {
    const zone = req.params.zone.toLowerCase();
    let filtered = parcels;

    if (zone === 'agriculture' || zone === 'agricultural') {
      filtered = parcels.filter((p) => p.landUse === 'Agriculture' || p.zoneType === 'Agricultural');
    } else if (zone === 'residential') {
      filtered = parcels.filter((p) => p.landUse === 'Residential' || p.zoneType === 'Residential');
    } else if (zone === 'commercial') {
      filtered = parcels.filter((p) => p.landUse === 'Commercial' || p.zoneType === 'Commercial');
    } else if (zone === 'government') {
      filtered = parcels.filter((p) => p.landUse === 'Government' || p.ownership === 'Government Revenue Land');
    } else if (zone === 'protected' || zone === 'forest') {
      filtered = parcels.filter((p) => p.landUse === 'Protected' || p.ownership === 'Forest Dept' || p.zoneType === 'Protected');
    } else if (zone === 'other') {
      filtered = parcels.filter((p) => p.landUse === 'Other' || p.landUse === 'Industrial' || p.landUse === 'Water Body');
    }

    res.json({ success: true, zone, count: filtered.length, parcels: filtered });
  });

  // Locate and get geospatial bounds for a specific parcel (supports standard & unutilized parcels)
  app.get('/api/parcels/locate/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const targetUnutilized = UNUTILIZED_PARCELS.find(
      (p) => p.id === id || p.ulpin === id || p.khasraNo === id
    );

    if (targetUnutilized) {
      return res.json({
        success: true,
        type: 'unutilized',
        parcel: targetUnutilized,
        center: [targetUnutilized.centroidLat, targetUnutilized.centroidLng],
        coordinates: targetUnutilized.cadastrePoints,
        suggestedZoom: 17,
        village: targetUnutilized.village,
        taluka: targetUnutilized.taluka,
        district: targetUnutilized.district,
        state: targetUnutilized.state,
      });
    }

    const target = parcels.find((p) => p.id === id || p.parcelNumber === id);
    if (!target) {
      return res.status(404).json({ success: false, error: 'Parcel not found' });
    }

    res.json({
      success: true,
      type: 'cadastre',
      parcel: target,
      center: [target.centerLat, target.centerLng],
      coordinates: target.coordinates,
      suggestedZoom: 17,
      village: target.village,
      taluka: target.taluka,
      district: target.district,
    });
  });

  // Explore Unutilized Land Parcels API (Comprehensive Public & Institutional Surplus Land)
  app.get('/api/parcels/unutilized', (req: Request, res: Response) => {
    const { ministry, district, state, query, minDormancy } = req.query;
    let list = [...UNUTILIZED_PARCELS];

    if (ministry && String(ministry).toLowerCase() !== 'all') {
      list = list.filter((p) => p.custodianMinistry.toLowerCase() === String(ministry).toLowerCase());
    }

    if (district && String(district).toLowerCase() !== 'all') {
      list = list.filter((p) => p.district.toLowerCase() === String(district).toLowerCase());
    }

    if (state && String(state).toLowerCase() !== 'all') {
      list = list.filter((p) => p.state.toLowerCase() === String(state).toLowerCase());
    }

    if (minDormancy) {
      const minYears = Number(minDormancy);
      if (!isNaN(minYears)) {
        list = list.filter((p) => p.dormancyYears >= minYears);
      }
    }

    if (query) {
      const q = String(query).toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.ulpin.toLowerCase().includes(q) ||
          p.khasraNo.toLowerCase().includes(q) ||
          p.taluka.toLowerCase().includes(q) ||
          p.custodianMinistry.toLowerCase().includes(q)
      );
    }

    const totalUnusedHa = Number(list.reduce((sum, p) => sum + p.unusedAreaHa, 0).toFixed(1));
    const totalDeadCapitalCr = Number(list.reduce((sum, p) => sum + p.deadCapitalCr, 0).toFixed(1));
    const totalStructures = list.reduce((sum, p) => sum + p.unauthorizedStructuresCount, 0);

    res.json({
      success: true,
      count: list.length,
      totalUnusedHa,
      totalDeadCapitalCr,
      totalStructuresDetected: totalStructures,
      parcels: list,
    });
  });

  // Single Unutilized Parcel Dossier by ULPIN or ID
  app.get('/api/parcels/unutilized/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const parcel = UNUTILIZED_PARCELS.find(
      (p) => p.id === id || p.ulpin.toLowerCase() === id.toLowerCase() || p.khasraNo.toLowerCase() === id.toLowerCase()
    );

    if (!parcel) {
      return res.status(404).json({ success: false, error: 'Unutilized land parcel not found' });
    }

    res.json({
      success: true,
      parcel,
      dossierBrief: {
        ulpin: parcel.ulpin,
        title: parcel.title,
        khasraNo: parcel.khasraNo,
        custodianMinistry: parcel.custodianMinistry,
        tenure: parcel.tenureClassification,
        legalStatus: parcel.legalTitleStatus,
        area: `${parcel.totalAreaHa} Ha (${parcel.totalAreaSqM} m²)`,
        slope: parcel.averageSlope,
        soilBearing: parcel.soilBearingCapacity,
        floodRisk: parcel.floodPlainRisk,
        circleRate: parcel.currentCircleRate,
        assetValue: parcel.estimatedAssetValue,
        deadCapital: `₹${parcel.deadCapitalCr} Cr (${parcel.deadCapitalClassification})`,
        centroid: `${parcel.centroidLat.toFixed(5)}°N, ${parcel.centroidLng.toFixed(5)}°E`,
        satelliteVerification: parcel.satelliteVerification,
        temporalComparison: {
          baselineYear: parcel.baselineYear,
          baselineNdvi: parcel.baselineNdvi,
          currentYear: parcel.currentYear,
          currentNdbi: parcel.currentNdbi,
          driftAreaHa: parcel.driftAreaHa,
          unauthorizedStructures: parcel.unauthorizedStructuresCount,
        },
      },
    });
  });

  // Infrastructure assets
  app.get('/api/infrastructure', (req: Request, res: Response) => {
    const { district, type, condition } = req.query;
    let list = [...INFRASTRUCTURE_ASSETS];
    if (district) {
      list = list.filter((a) => a.district.toLowerCase() === String(district).toLowerCase());
    }
    if (type) {
      list = list.filter((a) => a.type.toLowerCase() === String(type).toLowerCase());
    }
    if (condition) {
      list = list.filter((a) => a.condition.toLowerCase() === String(condition).toLowerCase());
    }
    res.json({ success: true, count: list.length, assets: list });
  });

  // Infrastructure gaps
  app.get('/api/gaps', (req: Request, res: Response) => {
    res.json({ success: true, gaps: INFRASTRUCTURE_GAPS });
  });

  // Site suitability calculator (MCDA with Equity Weighting)
  app.post('/api/suitability/calculate', (req: Request, res: Response) => {
    const { districtId, targetInfrastructure, weights } = req.body;
    const activeWeights: SuitabilityWeights = weights || currentWeights;
    const infraType: InfrastructureType = targetInfrastructure || 'Hospital';

    const rankedSites = calculateCandidateSiteScores(
      districtId || 'dist-dahod',
      infraType,
      activeWeights
    );

    res.json({
      success: true,
      districtId: districtId || 'dist-dahod',
      targetInfrastructure: infraType,
      weightsApplied: activeWeights,
      candidateSites: rankedSites,
    });
  });

  // Citizen reports
  app.get('/api/citizen-reports', (req: Request, res: Response) => {
    res.json({ success: true, count: citizenReports.length, reports: citizenReports });
  });

  app.post('/api/citizen-reports', (req: Request, res: Response) => {
    const {
      citizenId,
      citizenName,
      citizenPhone,
      category,
      district,
      taluka,
      locationName,
      lat,
      lng,
      description,
      severity,
      photoUrl,
    } = req.body;

    const newReport: CitizenReport = {
      id: `rep-${Date.now()}`,
      citizenId: citizenId || 'usr-cit-1',
      citizenName: citizenName || 'Verified Citizen',
      citizenPhone: citizenPhone || '+91 98111 22334',
      category: category || 'Roads',
      district: district || 'Dahod',
      taluka: taluka || 'Limkheda',
      locationName: locationName || 'District Sector Main Road',
      lat: Number(lat) || 22.836,
      lng: Number(lng) || 74.254,
      description: description || 'Infrastructure grievance reported via GLIS Citizen Portal.',
      severity: severity || 'High',
      status: 'Submitted',
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
      submittedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      updatedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      assignedDepartment: 'Public Works & Municipal Administration',
      resolutionTimelineDays: 30,
    };

    citizenReports.unshift(newReport);

    auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      userId: newReport.citizenId,
      userName: newReport.citizenName,
      userRole: 'citizen',
      action: 'Submitted Infrastructure Grievance',
      details: `Reported ${newReport.severity} ${newReport.category} issue in ${newReport.locationName}, ${newReport.district}.`,
      entityType: 'Citizen Grievance',
      entityId: newReport.id,
      district: newReport.district,
    });

    res.json({ success: true, report: newReport });
  });

  app.patch('/api/citizen-reports/:id', (req: Request, res: Response) => {
    const reportIndex = citizenReports.findIndex((r) => r.id === req.params.id);
    if (reportIndex === -1) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    const { status, officialNotes, assignedDepartment, officialName } = req.body;
    if (status) citizenReports[reportIndex].status = status;
    if (officialNotes) citizenReports[reportIndex].officialNotes = officialNotes;
    if (assignedDepartment) citizenReports[reportIndex].assignedDepartment = assignedDepartment;
    citizenReports[reportIndex].updatedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      userId: 'usr-off-1',
      userName: officialName || 'Government Official',
      userRole: 'official',
      action: `Updated Grievance Status to [${status || 'Reviewed'}]`,
      details: `Grievance #${req.params.id} for ${citizenReports[reportIndex].category} updated with notes: ${officialNotes || 'Status advanced.'}`,
      entityType: 'Citizen Grievance',
      entityId: req.params.id,
      district: citizenReports[reportIndex].district,
    });

    res.json({ success: true, report: citizenReports[reportIndex] });
  });

  // Satellite progress monitoring
  app.get('/api/satellite-projects', (req: Request, res: Response) => {
    res.json({ success: true, projects: SATELLITE_PROJECTS });
  });

  // Data Quality Audit
  app.get('/api/data-quality', (req: Request, res: Response) => {
    res.json({ success: true, audit: DATA_QUALITY_AUDIT });
  });

  // Audit logs
  app.get('/api/audit-logs', (req: Request, res: Response) => {
    res.json({ success: true, count: auditLogs.length, logs: auditLogs });
  });

  app.post('/api/audit-logs', (req: Request, res: Response) => {
    const { userId, userName, userRole, action, details, entityType, entityId, district } = req.body;
    const newLog = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      userId: userId || 'usr-off-1',
      userName: userName || 'Government Official',
      userRole: userRole || 'official',
      action: action || 'Action Logged',
      details: details || 'Platform interaction completed.',
      entityType: entityType || 'Site Recommendation',
      entityId: entityId || `ent-${Date.now()}`,
      district: district || 'Dahod',
    };
    auditLogs.unshift(newLog);
    res.json({ success: true, log: newLog });
  });

  // Gemini Explainable AI endpoints
  app.post('/api/gemini/explain', async (req: Request, res: Response) => {
    try {
      const { site, district, alternativeSite } = req.body;
      const explanation = await explainSiteRecommendation(site, district, alternativeSite);
      res.json({ success: true, explanation });
    } catch (err: any) {
      console.error('Gemini explain error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/gemini/ask', async (req: Request, res: Response) => {
    try {
      const { question, districtContext, infrastructureContext } = req.body;
      const answer = await queryAskGlis({ question, districtContext, infrastructureContext });
      res.json({ success: true, ...answer });
    } catch (err: any) {
      console.error('Gemini ask error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ================= MAP & SATELLITE TILES & GEOCODING API =================
  const INDIAN_LOCATIONS_DATABASE = [
    { name: 'Dahod Central', taluka: 'Dahod', district: 'Dahod', state: 'Gujarat', lat: 22.8368, lng: 74.2547, zoom: 12, pincode: '389151', type: 'District HQ' },
    { name: 'Limkheda', taluka: 'Limkheda', district: 'Dahod', state: 'Gujarat', lat: 22.829, lng: 73.992, zoom: 13, pincode: '389180', type: 'Taluka' },
    { name: 'Garbada', taluka: 'Garbada', district: 'Dahod', state: 'Gujarat', lat: 22.684, lng: 74.316, zoom: 13, pincode: '389155', type: 'Taluka' },
    { name: 'Fatehpura', taluka: 'Fatehpura', district: 'Dahod', state: 'Gujarat', lat: 23.187, lng: 74.062, zoom: 13, pincode: '389172', type: 'Taluka' },
    { name: 'Devgadh Baria', taluka: 'Devgadh Baria', district: 'Dahod', state: 'Gujarat', lat: 22.701, lng: 73.905, zoom: 13, pincode: '389380', type: 'Taluka' },
    { name: 'Jhalod', taluka: 'Jhalod', district: 'Dahod', state: 'Gujarat', lat: 23.102, lng: 74.152, zoom: 13, pincode: '389170', type: 'Taluka' },
    { name: 'Sanjeli', taluka: 'Sanjeli', district: 'Dahod', state: 'Gujarat', lat: 23.015, lng: 74.025, zoom: 13, pincode: '389175', type: 'Taluka' },
    { name: 'Singvad', taluka: 'Singvad', district: 'Dahod', state: 'Gujarat', lat: 22.894, lng: 73.918, zoom: 13, pincode: '389130', type: 'Taluka' },
    { name: 'Ahmedabad Sabarmati', taluka: 'Sabarmati', district: 'Ahmedabad', state: 'Gujarat', lat: 23.081, lng: 72.593, zoom: 13, pincode: '380005', type: 'Urban Zone' },
    { name: 'Gandhinagar GIFT City', taluka: 'Gandhinagar', district: 'Gandhinagar', state: 'Gujarat', lat: 23.161, lng: 72.684, zoom: 14, pincode: '382355', type: 'Special Zone' },
    { name: 'Kendrapara', taluka: 'Kendrapara', district: 'Kendrapara', state: 'Odisha', lat: 20.501, lng: 86.423, zoom: 12, pincode: '754211', type: 'District HQ' },
    { name: 'Malkangiri', taluka: 'Malkangiri', district: 'Malkangiri', state: 'Odisha', lat: 18.343, lng: 81.895, zoom: 12, pincode: '764045', type: 'District HQ' },
    { name: 'West Khasi Hills', taluka: 'Nongstoin', district: 'West Khasi Hills', state: 'Meghalaya', lat: 25.521, lng: 91.267, zoom: 11, pincode: '793119', type: 'District HQ' },
    { name: 'Barmer', taluka: 'Barmer', district: 'Barmer', state: 'Rajasthan', lat: 25.753, lng: 71.418, zoom: 11, pincode: '344001', type: 'District HQ' },
    { name: 'Kupwara', taluka: 'Kupwara', district: 'Kupwara', state: 'Jammu & Kashmir', lat: 34.526, lng: 74.254, zoom: 11, pincode: '193222', type: 'District HQ' },
  ];

  let currentMapModePreference: 'satellite' | 'terrain' = 'satellite';

  // Map Provider Config
  app.get('/api/maps/config', (req: Request, res: Response) => {
    res.json({
      success: true,
      provider: 'Bhoo Drishti GIS Spatial Engine',
      currentMode: currentMapModePreference,
      layers: {
        satellite: {
          id: 'satellite',
          name: 'Satellite',
          description: 'High-Resolution Satellite & Aerial Orbital Imagery',
          tileUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          maxZoom: 19,
          attribution: '© Esri World Imagery © Mappls',
        },
        terrain: {
          id: 'terrain',
          name: 'Terrain',
          description: 'Topographic Elevation Contours & Physical Terrain',
          tileUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
          maxZoom: 19,
          attribution: '© Esri Topographic Terrain © OpenStreetMap',
        },
      },
      supportedDistricts: DISTRICTS_DATA.map((d) => ({
        id: d.id,
        name: d.name,
        state: d.state,
        centerLat: d.centerLat,
        centerLng: d.centerLng,
        zoomLevel: d.zoomLevel,
      })),
    });
  });

  // User Map Preference Endpoint (get & set active basemap mode: satellite | terrain)
  app.get('/api/maps/preference', (req: Request, res: Response) => {
    res.json({ success: true, mode: currentMapModePreference });
  });

  app.post('/api/maps/preference', (req: Request, res: Response) => {
    const { mode } = req.body;
    if (mode === 'satellite' || mode === 'terrain') {
      currentMapModePreference = mode;
      return res.json({ success: true, mode: currentMapModePreference, message: `Map mode set to ${mode}` });
    }
    res.status(400).json({ success: false, error: 'Invalid mode. Allowed values: satellite, terrain' });
  });

  // Geocoding Endpoint for Indian Coordinates
  app.get('/api/maps/geocode', (req: Request, res: Response) => {
    const query = String(req.query.query || '').trim().toLowerCase();
    if (!query) {
      return res.json({ success: true, results: INDIAN_LOCATIONS_DATABASE.slice(0, 5) });
    }

    const matches = INDIAN_LOCATIONS_DATABASE.filter(
      (loc) =>
        loc.name.toLowerCase().includes(query) ||
        loc.taluka.toLowerCase().includes(query) ||
        loc.district.toLowerCase().includes(query) ||
        loc.state.toLowerCase().includes(query) ||
        loc.pincode.includes(query)
    );

    res.json({
      success: true,
      query,
      count: matches.length,
      results: matches.length > 0 ? matches : [
        {
          name: query.toUpperCase(),
          taluka: 'Dahod',
          district: 'Dahod',
          state: 'Gujarat',
          lat: 22.8368,
          lng: 74.2547,
          zoom: 12,
          pincode: '389151',
          type: 'Estimated Geocode',
        },
      ],
    });
  });

  // Reverse Geocoding Endpoint
  app.get('/api/maps/reverse-geocode', (req: Request, res: Response) => {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ success: false, error: 'Valid lat and lng query params required.' });
    }

    // Find closest location by Euclidean distance
    let closest = INDIAN_LOCATIONS_DATABASE[0];
    let minDistance = Infinity;

    for (const loc of INDIAN_LOCATIONS_DATABASE) {
      const dist = Math.hypot(loc.lat - lat, loc.lng - lng);
      if (dist < minDistance) {
        minDistance = dist;
        closest = loc;
      }
    }

    res.json({
      success: true,
      coordinates: { lat, lng },
      matchedLocation: closest,
      approxDistanceKm: Number((minDistance * 111.1).toFixed(2)),
      cadastralContext: {
        state: closest.state,
        district: closest.district,
        taluka: closest.taluka,
        zone: 'Tribal Sub-Plan Area / Priority Cadastre',
        accuracyMeters: 5.2,
      },
    });
  });

  // ================= OFFICER PROFILE, PROJECTS & SETTINGS API =================
  const OFFICER_PROJECTS_DATA = [
    {
      id: 'proj-off-1',
      name: 'Limkheda Sub-District 100-Bed Hospital (Phase 2)',
      category: 'Hospital & Healthcare',
      taluka: 'Limkheda',
      district: 'Dahod',
      status: 'In Progress',
      progressPercentage: 68,
      allocatedBudgetCr: 14.5,
      startDate: '12 Jan 2025',
      targetCompletion: '30 Nov 2026',
      priority: 'Critical',
    },
    {
      id: 'proj-off-2',
      name: 'Dahod Smart Potable Water SCADA Network',
      category: 'Water & Utilities',
      taluka: 'Dahod Central',
      district: 'Dahod',
      status: 'In Progress',
      progressPercentage: 82,
      allocatedBudgetCr: 28.0,
      startDate: '05 Mar 2024',
      targetCompletion: '15 Sep 2026',
      priority: 'High',
    },
    {
      id: 'proj-off-3',
      name: 'Garbada Eklavya Model Tribal High School',
      category: 'Education & Tribal Welfare',
      taluka: 'Garbada',
      district: 'Dahod',
      status: 'Tendering',
      progressPercentage: 25,
      allocatedBudgetCr: 9.8,
      startDate: '01 Jun 2025',
      targetCompletion: '31 Mar 2027',
      priority: 'High',
    },
    {
      id: 'proj-off-4',
      name: 'Fatehpura-Jhalod Rural Feeder Highway (PMGSY-IV)',
      category: 'Roads & Connectivity',
      taluka: 'Fatehpura',
      district: 'Dahod',
      status: 'In Progress',
      progressPercentage: 45,
      allocatedBudgetCr: 36.2,
      startDate: '18 Nov 2024',
      targetCompletion: '20 Jan 2027',
      priority: 'High',
    },
    {
      id: 'proj-off-5',
      name: 'Sanjeli Solar Powered Agro Cold Storage Facility',
      category: 'Agriculture & Storage',
      taluka: 'Sanjeli',
      district: 'Dahod',
      status: 'Under Review',
      progressPercentage: 15,
      allocatedBudgetCr: 7.4,
      startDate: '01 Sep 2025',
      targetCompletion: '15 Dec 2027',
      priority: 'Medium',
    },
    {
      id: 'proj-off-6',
      name: 'Sabarmati East Multi-Modal Drone Cadastre Hub',
      category: 'Geospatial & Technology',
      taluka: 'Sabarmati',
      district: 'Ahmedabad',
      status: 'In Progress',
      progressPercentage: 90,
      allocatedBudgetCr: 52.0,
      startDate: '10 Oct 2024',
      targetCompletion: '30 Aug 2026',
      priority: 'Critical',
    },
  ];

  app.get('/api/officer/profile', (req: Request, res: Response) => {
    const officialUser = users.find((u) => u.role === 'official') || {
      id: 'usr-off-1',
      name: 'Dr. Rajeshwar Sharma, IAS',
      email: 'rajeshwar.sharma@gujarat.gov.in',
      role: 'official',
      designation: 'District Development Officer (DDO)',
      department: 'Urban Development & Infrastructure Board',
      jurisdiction: 'Dahod & Eastern Tribal Belt',
      district: 'Dahod',
      state: 'Gujarat',
      phone: '+91 98765 43210',
    };

    res.json({
      success: true,
      officer: {
        ...officialUser,
        employeeId: 'IAS-GJ-2014-8842',
        officialBadge: 'Government of Gujarat • Cadre 2014',
        totalAssignedProjects: OFFICER_PROJECTS_DATA.length,
        activeProjectsCount: OFFICER_PROJECTS_DATA.filter((p) => p.status === 'In Progress').length,
        totalBudgetSanctionedCr: OFFICER_PROJECTS_DATA.reduce((acc, p) => acc + p.allocatedBudgetCr, 0),
        departmentHierarchy: [
          'General Administration Department (GAD)',
          'Revenue & Cadastral Survey Department',
          'Urban & Rural Infrastructure Development Authority',
        ],
      },
    });
  });

  app.get('/api/officer/projects', (req: Request, res: Response) => {
    res.json({
      success: true,
      count: OFFICER_PROJECTS_DATA.length,
      projects: OFFICER_PROJECTS_DATA,
      summary: {
        totalProjects: OFFICER_PROJECTS_DATA.length,
        inProgress: OFFICER_PROJECTS_DATA.filter((p) => p.status === 'In Progress').length,
        tendering: OFFICER_PROJECTS_DATA.filter((p) => p.status === 'Tendering').length,
        underReview: OFFICER_PROJECTS_DATA.filter((p) => p.status === 'Under Review').length,
        totalBudgetCr: OFFICER_PROJECTS_DATA.reduce((acc, p) => acc + p.allocatedBudgetCr, 0),
      },
    });
  });

  app.post('/api/officer/settings', (req: Request, res: Response) => {
    const { theme, highContrast, notifications, language } = req.body;
    res.json({
      success: true,
      message: 'Officer preferences saved successfully.',
      settings: {
        theme: theme || 'dark',
        highContrast: !!highContrast,
        notifications: notifications !== false,
        language: language || 'en',
        updatedAt: new Date().toISOString(),
      },
    });
  });

  // Data Ingestion API (GeoJSON/CSV upload)
  app.post('/api/data-ingest', (req: Request, res: Response) => {
    const { fileName, fileType, recordsCount, district } = req.body;
    
    auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      userId: 'usr-adm-1',
      userName: 'Chief Geospatial Data Administrator',
      userRole: 'admin',
      action: `Ingested & Validated Dataset: ${fileName || 'Spatial Layer'}`,
      details: `Successfully cleaned and topological-checked ${recordsCount || 142} spatial entities in ${district || 'Ahmedabad'}. Geometry validity 99.4%.`,
      entityType: 'Dataset Ingestion',
      entityId: `ing-${Date.now()}`,
      district: district || 'Ahmedabad',
    });

    res.json({
      success: true,
      message: `Dataset ${fileName} successfully ingested, validated, and merged into spatial index.`,
      recordsIngested: recordsCount || 142,
      topologicalIntegrityScore: 99.4,
    });
  });

  // ================= VITE MIDDLEWARE =================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GLIS Geospatial Intelligence Platform backend listening on port ${PORT}`);
  });
}

startServer();
