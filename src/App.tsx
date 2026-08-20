import React, { useState, useEffect } from 'react';
import {
  AuditLog,
  CandidateSiteScore,
  CitizenReport,
  DataQualityAudit,
  DistrictMetrics,
  InfrastructureAsset,
  InfrastructureGap,
  InfrastructureType,
  Language,
  Parcel,
  SatelliteProject,
  SuitabilityWeights,
  User,
  UserRole,
} from './types';
import {
  MOCK_AUDIT_LOGS,
  MOCK_CITIZEN_REPORTS,
  MOCK_DATA_QUALITY_AUDIT,
  MOCK_DISTRICTS,
  MOCK_GAPS,
  MOCK_INFRASTRUCTURE,
  MOCK_PARCELS,
  MOCK_SATELLITE_PROJECTS,
} from './data/mockGisData';
import { DEFAULT_WEIGHTS, calculateSiteSuitability } from './services/scoringEngine';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { OfficialDashboard } from './components/OfficialDashboard';
import { CitizenDashboard } from './components/CitizenDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal, AuthModalMode } from './components/AuthModal';
import { ReportModal } from './components/ReportModal';

export const App: React.FC = () => {
  // Global App State
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: 'usr-off-1',
    name: 'Dr. Rajeshwar Sharma, IAS',
    email: 'sharma.ias@gujarat.gov.in',
    role: 'official',
    department: 'Urban Development & Infrastructure Board',
    designation: 'District Development Officer (DDO)',
    jurisdiction: 'Ahmedabad & Suburban Industrial Belt',
    district: 'Ahmedabad',
    state: 'Gujarat',
  });
  const [currentRole, setCurrentRole] = useState<UserRole>('official');
  const [activeView, setActiveView] = useState<string>('home');
  const [language, setLanguage] = useState<Language>('en');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('create-account');
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [dossierSite, setDossierSite] = useState<CandidateSiteScore | null>(null);

  // GIS & Domain Data
  const [districts] = useState<DistrictMetrics[]>(MOCK_DISTRICTS);
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictMetrics>(MOCK_DISTRICTS[0]);
  const [parcels] = useState<Parcel[]>(MOCK_PARCELS);
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [infrastructureAssets] = useState<InfrastructureAsset[]>(MOCK_INFRASTRUCTURE);
  const [citizenReports, setCitizenReports] = useState<CitizenReport[]>(MOCK_CITIZEN_REPORTS);
  const [infrastructureGaps] = useState<InfrastructureGap[]>(MOCK_GAPS);
  const [satelliteProjects] = useState<SatelliteProject[]>(MOCK_SATELLITE_PROJECTS);
  const [dataQualityAudit] = useState<DataQualityAudit>(MOCK_DATA_QUALITY_AUDIT);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);

  // Policy Weights & Candidate Siting state
  const [weights, setWeights] = useState<SuitabilityWeights>(DEFAULT_WEIGHTS);
  const [candidateSites, setCandidateSites] = useState<CandidateSiteScore[]>([]);
  const [selectedSite, setSelectedSite] = useState<CandidateSiteScore | null>(null);

  // Initial Calculation of Candidate Siting for Selected District
  useEffect(() => {
    const scores = calculateSiteSuitability(parcels, selectedDistrict, 'Hospital', weights);
    setCandidateSites(scores);
    if (scores.length > 0) {
      setSelectedSite(scores[0]);
    }
  }, [selectedDistrict]);

  // Recalculate Suitability Handler
  const handleRecalculateSuitability = (newWeights: SuitabilityWeights, targetInfra: InfrastructureType) => {
    setWeights(newWeights);
    const scores = calculateSiteSuitability(parcels, selectedDistrict, targetInfra, newWeights);
    setCandidateSites(scores);
    if (scores.length > 0) {
      setSelectedSite(scores[0]);
    }

    // Log to Audit Trail
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      userId: currentUser?.id || 'usr-off-1',
      action: 'SITE_SUITABILITY_RECALCULATED',
      userName: currentUser?.name || 'Dr. Rajeshwar Sharma, IAS',
      userRole: currentUser?.role || 'official',
      district: selectedDistrict.name,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      details: `Policy weights updated (Equity: ${newWeights.socioEconomicNeed}%, Access: ${newWeights.accessibility}%). Target: ${targetInfra}. Rank 1: ${scores[0]?.siteName}`,
      entityType: 'Site Recommendation',
      entityId: scores[0]?.siteId || 'site-rec-01',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Submit Citizen Grievance Handler
  const handleSubmitGrievance = (reportData: Partial<CitizenReport>) => {
    const newReport: CitizenReport = {
      id: `rep-${Date.now()}`,
      citizenId: currentUser?.id || 'usr-cit-1',
      category: reportData.category || 'Roads',
      severity: reportData.severity || 'High',
      locationName: reportData.locationName || 'Local Village Sector',
      taluka: reportData.taluka || 'Ahmedabad City',
      district: reportData.district || 'Ahmedabad',
      description: reportData.description || 'Infrastructure deficit reported.',
      lat: reportData.lat || 23.0225,
      lng: reportData.lng || 72.5797,
      status: 'Submitted',
      citizenName: reportData.citizenName || currentUser?.name || 'Citizen User',
      citizenPhone: reportData.citizenPhone || '+91 98250 11223',
      submittedAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    setCitizenReports((prev) => [newReport, ...prev]);

    // Log to Audit Trail
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      userId: newReport.citizenId,
      action: 'GRIEVANCE_SUBMITTED',
      userName: newReport.citizenName,
      userRole: 'citizen',
      district: newReport.district,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      details: `New citizen grievance filed for ${newReport.category} at ${newReport.locationName}`,
      entityType: 'Citizen Grievance',
      entityId: newReport.id,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Update Grievance Status Handler
  const handleUpdateReportStatus = (id: string, status: CitizenReport['status'], notes?: string) => {
    setCitizenReports((prev) =>
      prev.map((rep) => (rep.id === id ? { ...rep, status, officialNotes: notes, updatedAt: new Date().toISOString().split('T')[0] } : rep))
    );

    const targetRep = citizenReports.find((r) => r.id === id);
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      userId: currentUser?.id || 'usr-off-1',
      action: `GRIEVANCE_STATUS_${status.toUpperCase()}`,
      userName: currentUser?.name || 'Officer',
      userRole: currentUser?.role || 'official',
      district: targetRep?.district || 'Ahmedabad',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      details: `Grievance #${id} marked as ${status}. Note: ${notes || 'Verified'}`,
      entityType: 'Citizen Grievance',
      entityId: id,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Ask GLIS Query Handler (Communicates with Server API or local deterministic engine)
  const handleAskGlisQuery = async (queryText: string) => {
    try {
      const response = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryText,
          selectedDistrict,
          candidateSites,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (e) {
      console.warn('Backend Ask GLIS fetch fallback to local engine:', e);
    }

    // Local fallback if server endpoint is offline
    return {
      answer: `Based on spatial and socio-economic analysis for ${selectedDistrict.name} District (DNI: ${selectedDistrict.developmentNeedIndex}/100, ST/SC Population: ${selectedDistrict.marginalizedPopulationPercent}%), the top recommended siting is **${candidateSites[0]?.siteName}** with a composite suitability score of **${candidateSites[0]?.compositeScore}/100**. This site eliminates an estimated 34.8km emergency travel deficit for over 342,000 citizens.`,
      confidence: 0.95,
      suggestedAction: `View Rank #1 Candidate Site on Intelligence Map`,
    };
  };

  // Open Dossier Modal
  const handleOpenReportModal = (site?: CandidateSiteScore) => {
    setDossierSite(site || candidateSites[0]);
    setReportModalOpen(true);
  };

  // Open Auth with specific mode
  const handleOpenAuthModalWithMode = (mode: AuthModalMode) => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  // Role switch handler
  const handleRoleChange = (newRole: UserRole) => {
    setCurrentRole(newRole);
    if (newRole === 'official') {
      setCurrentUser({
        id: 'usr-off-1',
        name: 'Dr. Rajeshwar Sharma, IAS',
        email: 'sharma.ias@gujarat.gov.in',
        role: 'official',
        department: 'Urban Development & Infrastructure Board',
        designation: 'District Development Officer (DDO)',
        jurisdiction: 'Ahmedabad & Suburban Industrial Belt',
        district: 'Ahmedabad',
        state: 'Gujarat',
      });
      setActiveView('dashboard');
    } else if (newRole === 'citizen') {
      setCurrentUser({
        id: 'usr-cit-1',
        name: 'Pooja Patel',
        email: 'pooja.patel@citizen.in',
        role: 'citizen',
        district: 'Ahmedabad',
        state: 'Gujarat',
        address: 'Satellite Road, Ahmedabad City, Ahmedabad',
        phone: '+91 98250 11223',
      });
      setActiveView('citizen');
    } else {
      setCurrentUser({
        id: 'usr-adm-1',
        name: 'Administrator GLIS',
        email: 'admin@glis.gov.in',
        role: 'admin',
        department: 'National Geospatial Authority',
        designation: 'Chief GIS Systems Architect',
        jurisdiction: 'National Command Center',
      });
      setActiveView('admin');
    }
  };

  const handleOpenAuth = (role?: UserRole) => {
    if (role === 'official') setAuthModalMode('official-signin');
    else if (role === 'citizen') setAuthModalMode('citizen-signin');
    else setAuthModalMode('create-account');
    setAuthModalOpen(true);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    if (user.role === 'official') setActiveView('dashboard');
    else if (user.role === 'citizen') setActiveView('citizen');
    else setActiveView('admin');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveView('home');
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${isDarkMode ? 'dark bg-[#100e0c] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* If in app dashboards (except full-screen OfficialDashboard), render standard Header */}
      {activeView !== 'home' && activeView !== 'dashboard' && (
        <Header
          currentUser={currentUser}
          currentRole={currentRole}
          onRoleChange={handleRoleChange}
          language={language}
          onLanguageChange={setLanguage}
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode(!isDarkMode)}
          onOpenAuth={handleOpenAuth}
          onLogout={handleLogout}
          activeView={activeView}
          onNavigate={setActiveView}
        />
      )}

      {/* Main Content Router */}
      <main className="flex-1 flex flex-col">
        {activeView === 'home' && (
          <LandingPage
            language={language}
            onExplore={() => {
              setCurrentRole('official');
              setActiveView('dashboard');
            }}
            onSelectRole={(r) => {
              handleRoleChange(r);
            }}
            onOpenAuthModal={handleOpenAuthModalWithMode}
          />
        )}

        {activeView === 'dashboard' && (
          <OfficialDashboard
            currentUser={currentUser}
            language={language}
            districts={districts}
            selectedDistrict={selectedDistrict}
            onSelectDistrict={setSelectedDistrict}
            parcels={parcels}
            selectedParcel={selectedParcel}
            onSelectParcel={setSelectedParcel}
            infrastructureAssets={infrastructureAssets}
            candidateSites={candidateSites}
            selectedSite={selectedSite}
            onSelectSite={setSelectedSite}
            citizenReports={citizenReports}
            onUpdateReportStatus={handleUpdateReportStatus}
            infrastructureGaps={infrastructureGaps}
            satelliteProjects={satelliteProjects}
            dataQualityAudit={dataQualityAudit}
            auditLogs={auditLogs}
            weights={weights}
            onRecalculateSuitability={handleRecalculateSuitability}
            onOpenReportModal={handleOpenReportModal}
            onAskGlisQuery={handleAskGlisQuery}
            isDarkMode={isDarkMode}
            onToggleTheme={() => setIsDarkMode(!isDarkMode)}
            onLogout={handleLogout}
            onNavigate={setActiveView}
          />
        )}

        {activeView === 'citizen' && (
          <CitizenDashboard
            currentUser={currentUser}
            language={language}
            citizenReports={citizenReports}
            onSubmitGrievance={handleSubmitGrievance}
            infrastructureAssets={infrastructureAssets}
          />
        )}

        {activeView === 'admin' && (
          <AdminDashboard
            currentUser={currentUser}
            language={language}
            dataQualityAudit={dataQualityAudit}
          />
        )}
      </main>

      {/* Footer in Dashboards (except full-screen OfficialDashboard) */}
      {activeView !== 'home' && activeView !== 'dashboard' && <Footer language={language} />}

      {/* Universal 3-Flow Auth Modal (Create Account, Official Sign-in with 6-digit OTP, Citizen Sign-in with Indian States) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLogin={handleLogin}
        initialMode={authModalMode}
        language={language}
      />

      {reportModalOpen && dossierSite && (
        <ReportModal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          site={dossierSite}
          district={selectedDistrict}
          weights={weights}
          candidateSites={candidateSites}
          language={language}
        />
      )}
    </div>
  );
};

export default App;
