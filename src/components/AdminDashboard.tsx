import React, { useState } from 'react';
import { DataQualityAudit, Language, User } from '../types';
import { translations } from '../lib/translations';
import {
  ShieldCheck,
  Upload,
  Database,
  Users,
  Sliders,
  CheckCircle2,
  AlertCircle,
  FileCode,
  HardDrive,
  RefreshCw,
} from 'lucide-react';

interface AdminDashboardProps {
  currentUser: User | null;
  language: Language;
  dataQualityAudit: DataQualityAudit;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  language,
  dataQualityAudit,
}) => {
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<'ingestion' | 'users' | 'weights' | 'health'>('ingestion');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');

  const usersList = [
    { id: 'usr-1', name: 'Dr. Rajeshwar Sharma, IAS', email: 'sharma.ias@gujarat.gov.in', role: 'Official', jurisdiction: 'Ahmedabad District', status: 'Active' },
    { id: 'usr-2', name: 'Pooja Patel', email: 'pooja.patel@citizen.in', role: 'Citizen', jurisdiction: 'Gujarat Resident', status: 'Active' },
    { id: 'usr-3', name: 'Administrator GLIS', email: 'admin@glis.gov.in', role: 'Admin', jurisdiction: 'All India', status: 'Active' },
    { id: 'usr-4', name: 'S. N. Mehta, SE', email: 'mehta.pwd@gujarat.gov.in', role: 'Official', jurisdiction: 'Ahmedabad District', status: 'Active' },
  ];

  const handleSimulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 5000);
    }, 1500);
  };

  return (
    <div className="w-full space-y-6 max-w-6xl mx-auto px-4 py-6 text-slate-100">
      {/* Admin Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 shadow-xl flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              GLIS Master Administration & Security Center
            </span>
          </div>
          <h1 className="text-2xl font-black text-white">System Administrator Console</h1>
          <p className="text-xs text-slate-400">Manage spatial pipeline, cadastral ingestion, and role-based access control</p>
        </div>
        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-400" />
          <span className="font-bold text-slate-200">ISO 27001 / NSDI Node</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('ingestion')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'ingestion' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Spatial Data Ingestion & Pipeline
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'users' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          User & Role Management
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('health')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'health' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          GIS Services Health
        </button>
      </div>

      {/* TAB: DATA INGESTION */}
      {activeTab === 'ingestion' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-amber-400" />
                <span>Cadastral & Infrastructure Layer Upload Pipeline</span>
              </h2>
              <p className="text-xs text-slate-400">
                Supports OGC GeoJSON, Shapefile (.zip), CSV Cadastral tables, and Cartosat-3 TIFF metadata
              </p>
            </div>

            {uploadSuccess && (
              <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>
                  File <b>{uploadedFileName}</b> successfully validated! 124 parcels parsed, 0 self-intersections, 100% topological integrity verified.
                </span>
              </div>
            )}

            {/* Drag & Drop Upload Zone */}
            <div className="border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-2xl p-8 text-center space-y-3 bg-slate-950/50 transition-colors">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <FileCode className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-sm text-slate-200">
                  Select GeoJSON, Shapefile (.zip), or CSV dataset
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Automatic schema normalization, coordinate projection (EPSG:4326), and attribute cleaning
                </div>
              </div>

              <label className="inline-block px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs cursor-pointer shadow-md transition-all">
                <span>{isUploading ? 'Validating Spatial Topology...' : 'Browse & Ingest Layer'}</span>
                <input
                  type="file"
                  accept=".json,.geojson,.csv,.zip"
                  onChange={handleSimulateUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* TAB: USERS */}
      {activeTab === 'users' && (
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-lg font-bold text-white">Registered Users & Role Permissions</h2>
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold"
            >
              + Invite Officer
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Jurisdiction</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-slate-200">{u.name}</td>
                    <td className="p-3 text-slate-400 font-mono">{u.email}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-amber-400">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300">{u.jurisdiction}</td>
                    <td className="p-3 text-emerald-400 font-semibold">{u.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: HEALTH */}
      {activeTab === 'health' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="text-xs text-slate-400">PostGIS / Spatial Index</div>
            <div className="text-xl font-bold text-emerald-400">Healthy (12ms)</div>
            <div className="text-[10px] text-slate-500">R-Tree spatial index active</div>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="text-xs text-slate-400">Gemini AI Engine</div>
            <div className="text-xl font-bold text-sky-400">Connected</div>
            <div className="text-[10px] text-slate-500">Model: gemini-2.5-flash</div>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="text-xs text-slate-400">Cartosat Telemetry Pipe</div>
            <div className="text-xl font-bold text-amber-400">Active Feed</div>
            <div className="text-[10px] text-slate-500">Last ingestion 4h ago</div>
          </div>
        </div>
      )}
    </div>
  );
};
