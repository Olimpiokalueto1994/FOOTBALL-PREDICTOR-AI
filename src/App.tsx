/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Match, PredictionResult } from './types/football';
import { getMatches, toggleFavoriteMatch } from './services/api';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { MatchesListView } from './components/MatchesListView';
import { MatchDetailView } from './components/MatchDetailView';
import { ModelPerformanceView } from './components/ModelPerformanceView';
import { PredictionHistoryView } from './components/PredictionHistoryView';
import { AdminControlView } from './components/AdminControlView';
import { NaturalLanguageModal } from './components/NaturalLanguageModal';
import { TransparencyModal } from './components/TransparencyModal';
import { Language } from './i18n/translations';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [currentView, setCurrentView] = useState<'dashboard' | 'matches' | 'performance' | 'history' | 'admin'>('dashboard');
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('pt');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isAskModalOpen, setIsAskModalOpen] = useState<boolean>(false);
  const [isTransparencyModalOpen, setIsTransparencyModalOpen] = useState<boolean>(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMatches();
      setMatches(data);
    } catch (err: any) {
      console.error('Error fetching initial data:', err);
      setError('Falha ao carregar conexões com a API de dados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectMatch = (matchId: string) => {
    setSelectedMatchId(matchId);
  };

  const handleBackToDashboard = () => {
    setSelectedMatchId(null);
  };

  const handleToggleFavorite = async (matchId: string) => {
    // Optimistic update
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

  // Filter matches based on global navbar search query if typed
  const displayedMatches = searchQuery.trim() === ''
    ? matches
    : matches.filter((m) => {
        const q = searchQuery.toLowerCase().trim();
        return (
          m.homeTeam.name.toLowerCase().includes(q) ||
          m.awayTeam.name.toLowerCase().includes(q) ||
          m.homeTeam.shortName.toLowerCase().includes(q) ||
          m.awayTeam.shortName.toLowerCase().includes(q) ||
          m.competition.toLowerCase().includes(q) ||
          m.venue.toLowerCase().includes(q)
        );
      });

  const selectedMatch = matches.find((m) => m.id === selectedMatchId);

  return (
    <div className="min-h-screen bg-[#080B12] text-[#F5F7FA] font-sans antialiased selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={(view) => {
          setSelectedMatchId(null);
          setCurrentView(view);
        }}
        language={language}
        setLanguage={setLanguage}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenAskModal={() => setIsAskModalOpen(true)}
        onOpenTransparencyModal={() => setIsTransparencyModalOpen(true)}
      />

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        {loading && (
          <div className="flex h-96 flex-col items-center justify-center space-y-3 font-mono text-xs text-[#8D98A8]">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
            <span>Iniciando motor preditivo e carregando confrontos...</span>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-center font-mono text-xs text-rose-400">
            <p>{error}</p>
            <button
              onClick={loadData}
              className="mt-3 rounded border border-rose-500/40 bg-rose-500/20 px-3 py-1.5 text-white hover:bg-rose-500/30"
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
              />
            ) : (
              <>
                {currentView === 'dashboard' && (
                  <DashboardView
                    matches={displayedMatches}
                    onSelectMatch={handleSelectMatch}
                    language={language}
                    onToggleFavorite={handleToggleFavorite}
                  />
                )}

                {currentView === 'matches' && (
                  <MatchesListView
                    matches={displayedMatches}
                    onSelectMatch={handleSelectMatch}
                    language={language}
                    onToggleFavorite={handleToggleFavorite}
                  />
                )}

                {currentView === 'performance' && (
                  <ModelPerformanceView
                    language={language}
                    onOpenTransparencyModal={() => setIsTransparencyModalOpen(true)}
                  />
                )}

                {currentView === 'history' && (
                  <PredictionHistoryView
                    matches={matches}
                    onSelectMatch={handleSelectMatch}
                    language={language}
                  />
                )}

                {currentView === 'admin' && (
                  <AdminControlView
                    language={language}
                  />
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* Interactive Ask Predictor Modal */}
      <NaturalLanguageModal
        isOpen={isAskModalOpen}
        onClose={() => setIsAskModalOpen(false)}
        onSelectMatch={handleSelectMatch}
        language={language}
      />

      {/* Mathematical Transparency Modal */}
      <TransparencyModal
        isOpen={isTransparencyModalOpen}
        onClose={() => setIsTransparencyModalOpen(false)}
        language={language}
      />
    </div>
  );
}
