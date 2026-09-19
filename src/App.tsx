/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Match, PredictionResult } from './types/football';
import { getMatches, toggleFavoriteMatch, getAdminStatus } from './services/api';
import { Sidebar, NavTabId } from './components/Sidebar';
import { AppHeader } from './components/AppHeader';
import { DashboardView } from './components/DashboardView';
import { QuickAnalysisView } from './components/QuickAnalysisView';
import { MatchDetailView } from './components/MatchDetailView';
import { ModelPerformanceView } from './components/ModelPerformanceView';
import { PredictionHistoryView } from './components/PredictionHistoryView';
import { AdminControlView } from './components/AdminControlView';
import { CustomBetValidator } from './components/CustomBetValidator';
import { TransparencyModal } from './components/TransparencyModal';
import { Language } from './i18n/translations';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [currentTab, setCurrentTab] = useState<NavTabId>('matches');
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [validatorSelectedMatch, setValidatorSelectedMatch] = useState<Match | null>(null);
  const [language, setLanguage] = useState<Language>('pt');
  const [isSyntheticData, setIsSyntheticData] = useState<boolean>(true);
  const [searchPrefill, setSearchPrefill] = useState<string>('');

  const [isTransparencyModalOpen, setIsTransparencyModalOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Sidebar collapse state (persisted in localStorage)
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('fp_sidebar_collapsed') === 'true';
    } catch (e) {
      return false;
    }
  });

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('fp_sidebar_collapsed', String(next));
      } catch (e) {}
      return next;
    });
  };

  // Theme Management (persisted in localStorage, default 'light' to showcase modern SaaS, but user toggle works both ways)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('fp_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (e) {
      // ignore
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('fp_theme', theme);
    } catch (e) {}
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [matchesData, adminData] = await Promise.all([
        getMatches(),
        getAdminStatus().catch(() => null)
      ]);
      setMatches(matchesData);
      if (adminData && typeof adminData.isSyntheticData === 'boolean') {
        setIsSyntheticData(adminData.isSyntheticData);
      }
    } catch (err: any) {
      console.error('Error fetching initial data:', err);
      setError('Falha ao conectar com o serviço de partidas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectMatch = (matchId: string) => {
    setSelectedMatchId(matchId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToDashboard = () => {
    setSelectedMatchId(null);
  };

  const handleToggleFavorite = async (matchId: string) => {
    setMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, isFavorite: !m.isFavorite } : m))
    );

    try {
      await toggleFavoriteMatch(matchId);
    } catch (err) {
      console.error('Failed to toggle favorite on server:', err);
    }
  };

  const handleUpdateMatchPrediction = (matchId: string, pred: PredictionResult) => {
    setMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, prediction: pred } : m))
    );
  };

  const handleGlobalSearch = (query: string) => {
    setSearchPrefill(query);
    setSelectedMatchId(null);
    setCurrentTab('search');
  };

  const handleOpenValidatorWithMatch = (match: Match) => {
    setValidatorSelectedMatch(match);
    setSelectedMatchId(null);
    setCurrentTab('validator');
  };

  const selectedMatch = matches.find((m) => m.id === selectedMatchId);

  // Favorites subset
  const favoritesMatches = matches.filter((m) => m.isFavorite);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080C14] text-slate-900 dark:text-[#F8FAFC] font-sans antialiased selection:bg-blue-500/20 selection:text-blue-600 dark:selection:text-blue-400 flex flex-col transition-colors duration-200">
      {/* Desktop & Mobile Sidebar Navigation */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={(tab) => {
            setSelectedMatchId(null);
            setCurrentTab(tab);
            setMobileMenuOpen(false);
          }}
          language={language}
          setLanguage={setLanguage}
          onOpenMethodology={() => {
            setIsTransparencyModalOpen(true);
            setMobileMenuOpen(false);
          }}
          isSyntheticData={isSyntheticData}
          collapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebar}
          todayMatchesCount={matches.length}
          favoritesCount={favoritesMatches.length}
        />
      </div>

      {/* Mobile menu backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Main Container Area with dynamic left padding responding to sidebar collapsed state */}
      <div 
        className={`flex-1 flex flex-col min-w-0 transition-[padding] duration-300 ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Top App Header with Search, Notification, Theme Toggle, User Profile */}
        <AppHeader
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={toggleSidebar}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          theme={theme}
          toggleTheme={toggleTheme}
          searchTerm={searchPrefill}
          setSearchTerm={setSearchPrefill}
          onSearchSubmit={handleGlobalSearch}
          onOpenTransparencyModal={() => setIsTransparencyModalOpen(true)}
          userName="Olimpio Kalueto"
          userRole="Analista de Futebol"
        />

        {/* Main Content Viewport */}
        <main className="flex-1 px-4 py-6 sm:px-8 max-w-7xl mx-auto w-full">
          {loading && (
            <div className="flex h-96 flex-col items-center justify-center space-y-3 font-mono text-xs text-slate-500 dark:text-slate-400">
              <Loader2 className="h-7 w-7 animate-spin text-blue-600 dark:text-blue-400" />
              <span>Iniciando motor probabilístico e calibrando previsões de hoje...</span>
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-center font-mono text-xs text-rose-500 dark:text-rose-400">
              <p>{error}</p>
              <button
                onClick={loadData}
                className="mt-3 rounded-xl border border-rose-500/40 bg-rose-500/20 px-4 py-2 text-rose-700 dark:text-white hover:bg-rose-500/30"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              {selectedMatch ? (
                <MatchDetailView
                  match={selectedMatch}
                  onBack={handleBackToDashboard}
                  language={language}
                  onOpenTransparencyModal={() => setIsTransparencyModalOpen(true)}
                  onUpdateMatchPrediction={handleUpdateMatchPrediction}
                  onValidateBet={handleOpenValidatorWithMatch}
                />
              ) : (
                <>
                  {(currentTab === 'matches' || currentTab === 'leagues') && (
                    <DashboardView
                      matches={matches}
                      onSelectMatch={handleSelectMatch}
                      language={language}
                      onToggleFavorite={handleToggleFavorite}
                      onSearchQuery={handleGlobalSearch}
                      isSyntheticData={isSyntheticData}
                      onNavigateToHistory={() => setCurrentTab('history')}
                      onNavigateToPerformance={() => setCurrentTab('performance')}
                      userName="Olimpio"
                    />
                  )}

                  {currentTab === 'favorites' && (
                    <DashboardView
                      matches={favoritesMatches.length > 0 ? favoritesMatches : matches}
                      onSelectMatch={handleSelectMatch}
                      language={language}
                      onToggleFavorite={handleToggleFavorite}
                      onSearchQuery={handleGlobalSearch}
                      isSyntheticData={isSyntheticData}
                      onNavigateToHistory={() => setCurrentTab('history')}
                      onNavigateToPerformance={() => setCurrentTab('performance')}
                      userName="Olimpio"
                    />
                  )}

                  {currentTab === 'search' && (
                    <QuickAnalysisView
                      matches={matches}
                      onSelectMatch={handleSelectMatch}
                      language={language}
                      initialQuery={searchPrefill}
                    />
                  )}

                  {currentTab === 'validator' && (
                    <CustomBetValidator
                      matches={matches}
                      language={language}
                      initialMatch={validatorSelectedMatch}
                      onSelectMatch={handleSelectMatch}
                    />
                  )}

                  {currentTab === 'performance' && (
                    <ModelPerformanceView
                      language={language}
                      onOpenTransparencyModal={() => setIsTransparencyModalOpen(true)}
                    />
                  )}

                  {currentTab === 'history' && (
                    <PredictionHistoryView
                      matches={matches}
                      onSelectMatch={handleSelectMatch}
                      language={language}
                    />
                  )}

                  {currentTab === 'admin' && (
                    <AdminControlView
                      language={language}
                    />
                  )}
                </>
              )}
            </>
          )}
        </main>

        {/* Clean, Discreet Single-Line Footer */}
        <footer className="border-t border-slate-200 dark:border-[#161D2B] py-4 text-center px-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
            Football Predictor AI — Estimativas probabilísticas baseadas em modelos matemáticos e inteligência de dados.
          </p>
        </footer>
      </div>

      {/* Methodology & Formulae Transparency Modal */}
      <TransparencyModal
        isOpen={isTransparencyModalOpen}
        onClose={() => setIsTransparencyModalOpen(false)}
        language={language}
      />
    </div>
  );
}
