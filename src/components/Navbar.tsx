import React from 'react';
import { Activity, Sparkles, Search, Sliders, Globe, ShieldCheck } from 'lucide-react';
import { Language, translations } from '../i18n/translations';

interface NavbarProps {
  currentView: 'dashboard' | 'matches' | 'performance' | 'history' | 'admin';
  setCurrentView: (view: 'dashboard' | 'matches' | 'performance' | 'history' | 'admin') => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenAskModal: () => void;
  onOpenTransparencyModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  language,
  setLanguage,
  searchQuery,
  setSearchQuery,
  onOpenAskModal,
  onOpenTransparencyModal,
}) => {
  const t = translations[language];

  return (
    <header id="app-header" className="sticky top-0 z-40 w-full border-b border-[#252D3A] bg-[#080B12]/95 backdrop-blur-md">
      {/* Top telemetry bar */}
      <div id="top-telemetry-bar" className="hidden border-b border-[#252D3A]/60 bg-[#10151F] px-4 py-1 sm:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between text-xs font-mono text-[#8D98A8]">
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center text-emerald-400 font-medium">
              <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ENSEMBLE CORE v1.4.2
            </span>
            <span className="text-[#252D3A]">|</span>
            <span>DIXON-COLES POISSON + ELO + ML</span>
            <span className="text-[#252D3A]">|</span>
            <span>WALK-FORWARD VALIDATION: HEALTHY</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              id="btn-how-calculated-top"
              onClick={onOpenTransparencyModal}
              className="flex items-center text-[#8D98A8] hover:text-[#F5F7FA] transition-colors"
            >
              <ShieldCheck className="mr-1 h-3.5 w-3.5 text-blue-400" />
              {t.howCalculated}
            </button>
            <span className="text-[#252D3A]">|</span>
            <button
              id="btn-toggle-lang"
              onClick={() => setLanguage(language === 'pt' ? 'en' : 'pt')}
              className="flex items-center font-medium text-[#F5F7FA] hover:text-emerald-400 transition-colors"
              title="Mudar idioma / Switch language"
            >
              <Globe className="mr-1 h-3.5 w-3.5 text-[#8D98A8]" />
              {language.toUpperCase()}
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center space-x-6">
          <button
            id="brand-logo-btn"
            onClick={() => setCurrentView('dashboard')}
            className="flex items-center space-x-2.5 text-left focus:outline-none"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#252D3A] bg-[#151C28] text-emerald-400 shadow-sm">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-base font-bold tracking-tight text-[#F5F7FA] font-mono">
                FOOTBALL<span className="text-emerald-400"> PREDICTOR</span> AI
              </span>
              <span className="block text-[11px] text-[#8D98A8]">
                Terminal de Inteligência Probabilística
              </span>
            </div>
          </button>

          {/* Nav Items */}
          <nav id="main-nav" className="hidden lg:flex items-center space-x-1 font-mono text-xs">
            <button
              id="nav-dashboard-btn"
              onClick={() => setCurrentView('dashboard')}
              className={`rounded-md px-3 py-1.5 transition-colors ${
                currentView === 'dashboard'
                  ? 'bg-[#151C28] text-emerald-400 font-semibold border border-[#252D3A]'
                  : 'text-[#8D98A8] hover:text-[#F5F7FA] hover:bg-[#10151F]'
              }`}
            >
              {t.dashboard}
            </button>
            <button
              id="nav-matches-btn"
              onClick={() => setCurrentView('matches')}
              className={`rounded-md px-3 py-1.5 transition-colors ${
                currentView === 'matches'
                  ? 'bg-[#151C28] text-emerald-400 font-semibold border border-[#252D3A]'
                  : 'text-[#8D98A8] hover:text-[#F5F7FA] hover:bg-[#10151F]'
              }`}
            >
              {t.matches}
            </button>
            <button
              id="nav-performance-btn"
              onClick={() => setCurrentView('performance')}
              className={`rounded-md px-3 py-1.5 transition-colors ${
                currentView === 'performance'
                  ? 'bg-[#151C28] text-emerald-400 font-semibold border border-[#252D3A]'
                  : 'text-[#8D98A8] hover:text-[#F5F7FA] hover:bg-[#10151F]'
              }`}
            >
              {t.performance}
            </button>
            <button
              id="nav-history-btn"
              onClick={() => setCurrentView('history')}
              className={`rounded-md px-3 py-1.5 transition-colors ${
                currentView === 'history'
                  ? 'bg-[#151C28] text-emerald-400 font-semibold border border-[#252D3A]'
                  : 'text-[#8D98A8] hover:text-[#F5F7FA] hover:bg-[#10151F]'
              }`}
            >
              {t.history}
            </button>
            <button
              id="nav-admin-btn"
              onClick={() => setCurrentView('admin')}
              className={`rounded-md px-3 py-1.5 transition-colors ${
                currentView === 'admin'
                  ? 'bg-[#151C28] text-emerald-400 font-semibold border border-[#252D3A]'
                  : 'text-[#8D98A8] hover:text-[#F5F7FA] hover:bg-[#10151F]'
              }`}
            >
              {t.admin}
            </button>
          </nav>
        </div>

        {/* Global Search & Ask AI Button */}
        <div className="flex items-center space-x-3">
          <div className="relative hidden md:block w-64 lg:w-72">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#8D98A8]" />
            <input
              id="global-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full rounded-md border border-[#252D3A] bg-[#10151F] py-1.5 pl-9 pr-3 text-xs text-[#F5F7FA] placeholder-[#8D98A8] focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <button
            id="btn-ask-predictor"
            onClick={onOpenAskModal}
            className="flex items-center space-x-1.5 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/60 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden sm:inline font-mono">{t.askPredictor}</span>
          </button>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="flex lg:hidden overflow-x-auto border-t border-[#252D3A] bg-[#10151F] px-4 py-2 font-mono text-xs space-x-2">
        <button
          onClick={() => setCurrentView('dashboard')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${currentView === 'dashboard' ? 'bg-[#151C28] text-emerald-400' : 'text-[#8D98A8]'}`}
        >
          {t.dashboard}
        </button>
        <button
          onClick={() => setCurrentView('matches')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${currentView === 'matches' ? 'bg-[#151C28] text-emerald-400' : 'text-[#8D98A8]'}`}
        >
          {t.matches}
        </button>
        <button
          onClick={() => setCurrentView('performance')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${currentView === 'performance' ? 'bg-[#151C28] text-emerald-400' : 'text-[#8D98A8]'}`}
        >
          {t.performance}
        </button>
        <button
          onClick={() => setCurrentView('history')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${currentView === 'history' ? 'bg-[#151C28] text-emerald-400' : 'text-[#8D98A8]'}`}
        >
          {t.history}
        </button>
        <button
          onClick={() => setCurrentView('admin')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${currentView === 'admin' ? 'bg-[#151C28] text-emerald-400' : 'text-[#8D98A8]'}`}
        >
          {t.admin}
        </button>
      </div>
    </header>
  );
};
