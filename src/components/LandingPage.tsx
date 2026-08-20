import React from 'react';
import { Language, UserRole } from '../types';
import { AuthModalMode } from './AuthModal';

interface LandingPageProps {
  language: Language;
  onExplore: () => void;
  onSelectRole: (role: UserRole) => void;
  onOpenAuthModal?: (mode: AuthModalMode) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onExplore,
  onSelectRole,
  onOpenAuthModal,
}) => {
  const handleOpenAuth = (mode: AuthModalMode) => {
    if (onOpenAuthModal) {
      onOpenAuthModal(mode);
    } else {
      if (mode === 'official-signin') onSelectRole('official');
      else if (mode === 'citizen-signin') onSelectRole('citizen');
      else onExplore();
    }
  };

  return (
    <div className="h-screen w-screen max-h-screen overflow-hidden relative flex flex-col justify-between bg-slate-950 text-slate-100 select-none">
      {/* Background Interactive Spatial Grid & Glowing Ambient Lights */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle coordinate grid lines */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `linear-gradient(to right, #38bdf8 1px, transparent 1px), linear-gradient(to bottom, #38bdf8 1px, transparent 1px)`,
            backgroundSize: '56px 56px',
          }}
        />

        {/* Ambient Radial Color Orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-sky-600/15 via-teal-500/10 to-emerald-600/15 blur-[120px]" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-sky-500/10 blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full bg-teal-500/10 blur-[100px]" />
      </div>

      {/* TOP BAR / THREE TOGGLES AT TOP RIGHT */}
      <header className="relative z-20 px-8 py-6 flex items-center justify-end">
        <div className="flex items-center gap-3">
          {/* Toggle 1: Create Account */}
          <button
            type="button"
            onClick={() => handleOpenAuth('create-account')}
            className="px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/70 hover:border-sky-500/50 text-slate-200 hover:text-white font-medium text-sm transition-all duration-200 shadow-sm hover:scale-[1.02]"
          >
            Create Account
          </button>

          {/* Toggle 2: Official */}
          <button
            type="button"
            onClick={() => handleOpenAuth('official-signin')}
            className="px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/70 hover:border-emerald-500/50 text-slate-200 hover:text-white font-medium text-sm transition-all duration-200 shadow-sm hover:scale-[1.02]"
          >
            Official
          </button>

          {/* Toggle 3: Citizen */}
          <button
            type="button"
            onClick={() => handleOpenAuth('citizen-signin')}
            className="px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/70 hover:border-teal-500/50 text-slate-200 hover:text-white font-medium text-sm transition-all duration-200 shadow-sm hover:scale-[1.02]"
          >
            Citizen
          </button>
        </div>
      </header>

      {/* CENTER STAGE: BHOO DRISHTI & SMALL TAGLINE */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 -mt-10">
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 mb-4">
          BHOO DRISHTI
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-slate-400 font-normal max-w-xl mx-auto tracking-wide">
          National Geospatial Intelligence & Land Governance Platform
        </p>
      </main>

      {/* Empty bottom spacer for perfect visual centering */}
      <div className="h-16 pointer-events-none" />
    </div>
  );
};

