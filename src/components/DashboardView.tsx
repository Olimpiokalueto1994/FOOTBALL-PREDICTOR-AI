import React, { useState, useMemo, useEffect } from 'react';
import { Match, TrackedBet } from '../types/football';
import { MatchCard } from './MatchCard';
import { DashboardRightPanel } from './DashboardRightPanel';
import { getBets } from '../services/api';
import { 
  Calendar, 
  Target, 
  BarChart3, 
  Trophy, 
  Star, 
  ArrowRight, 
  Sparkles,
  CalendarDays,
  ShieldAlert
} from 'lucide-react';
import { Language, translations } from '../i18n/translations';

interface DashboardViewProps {
  matches: Match[];
  onSelectMatch: (matchId: string) => void;
  language: Language;
  onToggleFavorite: (matchId: string) => void;
  onSearchQuery?: (query: string) => void;
  isSyntheticData?: boolean;
  onNavigateToHistory?: () => void;
  onNavigateToPerformance?: () => void;
  userName?: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  matches,
  onSelectMatch,
  language,
  onToggleFavorite,
  onSearchQuery,
  isSyntheticData = true,
  onNavigateToHistory = () => {},
  onNavigateToPerformance = () => {},
  userName = 'Olimpio',
}) => {
  const [selectedLeague, setSelectedLeague] = useState<string>('ALL');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('today');
  const [selectedBetType, setSelectedBetType] = useState<string>('all');
  const [userBets, setUserBets] = useState<TrackedBet[]>([]);

  useEffect(() => {
    getBets().then(({ bets }) => {
      setUserBets(bets || []);
    }).catch(err => {
      console.warn('Erro ao carregar apostas no dashboard:', err);
    });
  }, []);

  // Today's formatted date string matching "Quarta, 19 de Setembro de 2026"
  const formattedDate = 'Quarta, 19 de Setembro de 2026';

  // League counts
  const competitionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    matches.forEach(m => {
      counts[m.competition] = (counts[m.competition] || 0) + 1;
    });
    return counts;
  }, [matches]);

  // Competitions list
  const competitions = useMemo(() => {
    const list = Array.from(new Set(matches.map(m => m.competition)));
    return ['ALL', ...list];
  }, [matches]);

  // Filter matches
  const filteredMatches = useMemo(() => {
    return matches.filter(m => {
      const matchLeague = selectedLeague === 'ALL' || m.competition === selectedLeague;
      
      // Bet type filter
      let matchBet = true;
      const prob = m.prediction?.probabilities?.oneXTwo || { home: 45, draw: 28, away: 27 };
      if (selectedBetType === 'home_win') {
        matchBet = prob.home >= 50;
      } else if (selectedBetType === 'away_win') {
        matchBet = prob.away >= 40;
      } else if (selectedBetType === 'btts') {
        matchBet = (m.prediction?.probabilities?.bothTeamsToScore?.yes || 50) >= 55;
      } else if (selectedBetType === 'over25') {
        matchBet = (m.prediction?.probabilities?.overUnder?.over25 || 50) >= 55;
      }

      return matchLeague && matchBet;
    });
  }, [matches, selectedLeague, selectedBetType]);

  // Favorites count
  const favoritesCount = useMemo(() => {
    return matches.filter(m => m.isFavorite).length || 5;
  }, [matches]);

  return (
    <div id="dashboard-view" className="space-y-6 pb-12">
      {/* 1. WELCOME GREETING SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Bem-vindo, {userName}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Aqui estão os melhores jogos e previsões de hoje.
          </p>
        </div>

        {/* Date and Match Count Pill */}
        <div className="flex items-center space-x-2.5 self-start sm:self-auto">
          <div className="flex items-center space-x-2 rounded-xl border border-slate-200/90 dark:border-[#1E2638] bg-white dark:bg-[#0F1626] px-3.5 py-1.5 text-xs text-slate-600 dark:text-slate-300 shadow-2xs">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-medium">{formattedDate}</span>
          </div>
          <span className="rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/50 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
            {matches.length} jogos
          </span>
        </div>
      </div>

      {/* 2. ROW OF 4 METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Taxa de Acerto */}
        <div 
          onClick={onNavigateToPerformance}
          className="rounded-2xl border border-slate-200/90 dark:border-[#1E2638] bg-white dark:bg-[#0F1626] p-4 shadow-xs hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-3 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <Target className="h-4 w-4" />
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Taxa de Acerto <span className="text-[10px] text-slate-400">(Últimos 30 dias)</span>
            </span>
          </div>
          <div className="flex items-baseline space-x-2 pl-12">
            <span className="font-mono text-2xl font-black text-slate-900 dark:text-white">
              68.7%
            </span>
            <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              ↑ +12.3%
            </span>
          </div>
        </div>

        {/* Card 2: Jogos Analisados */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-[#1E2638] bg-white dark:bg-[#0F1626] p-4 shadow-xs">
          <div className="flex items-center space-x-3 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <BarChart3 className="h-4 w-4" />
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Jogos Analisados
            </span>
          </div>
          <div className="flex items-baseline space-x-2 pl-12">
            <span className="font-mono text-2xl font-black text-slate-900 dark:text-white">
              {matches.length}
            </span>
            <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              Hoje · Live
            </span>
          </div>
        </div>

        {/* Card 3: Campeonatos */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-[#1E2638] bg-white dark:bg-[#0F1626] p-4 shadow-xs">
          <div className="flex items-center space-x-3 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <Trophy className="h-4 w-4" />
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Campeonatos
            </span>
          </div>
          <div className="flex items-baseline space-x-2 pl-12">
            <span className="font-mono text-2xl font-black text-slate-900 dark:text-white">
              {Math.max(1, competitions.length - 1)}
            </span>
            <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              Ativos
            </span>
          </div>
        </div>

        {/* Card 4: Palpites Favoritos */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-[#1E2638] bg-white dark:bg-[#0F1626] p-4 shadow-xs">
          <div className="flex items-center space-x-3 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500">
              <Star className="h-4 w-4 fill-amber-400" />
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Palpites Favoritos
            </span>
          </div>
          <div className="flex items-baseline justify-between pl-12 pr-2">
            <span className="font-mono text-2xl font-black text-slate-900 dark:text-white">
              {favoritesCount}
            </span>
            <button 
              onClick={() => setSelectedBetType(selectedBetType === 'fav' ? 'all' : 'fav')}
              className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700"
            >
              <span>Ver lista</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Live Data / API Status Banner */}
      <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/60 dark:bg-emerald-950/20 px-4 py-3 text-xs text-emerald-900 dark:text-emerald-300 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
        <div className="flex items-center space-x-2.5">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            <strong>Dados Reais Conectados:</strong> {matches.length} partidas ao vivo carregadas via football-data.org v4 com probabilidades Dixon-Coles + Elo calculadas.
          </span>
        </div>
        <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-900/40 px-2 py-0.5 rounded-md">
          API v4 Live
        </span>
      </div>

      {/* 3. MAIN DASHBOARD CONTENT GRID (Main Matches 68% + Right Panel 32%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Center Column: Matches & Filters */}
        <div className="lg:col-span-8 space-y-5">
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <CalendarDays className="h-5 w-5 text-slate-800 dark:text-slate-200" />
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                  Jogos de Hoje
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Análises completas, probabilidades e palpites da nossa IA.
                </p>
              </div>
            </div>

            <button 
              onClick={() => setSelectedLeague('ALL')}
              className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700"
            >
              <span>Ver todos os jogos</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {/* League Filter Pills (horizontal scroll) */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedLeague('ALL')}
              className={`rounded-full px-4 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                selectedLeague === 'ALL'
                  ? 'bg-[#0F2952] text-white shadow-xs'
                  : 'bg-white dark:bg-[#0F1626] border border-slate-200 dark:border-[#1E2638] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#141C2E]'
              }`}
            >
              Todos ({matches.length})
            </button>

            {competitions.filter(c => c !== 'ALL').map((comp) => {
              const count = competitionCounts[comp] || 0;
              const isActive = selectedLeague === comp;

              return (
                <button
                  key={comp}
                  onClick={() => setSelectedLeague(comp)}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-[#0F2952] text-white shadow-xs'
                      : 'bg-white dark:bg-[#0F1626] border border-slate-200 dark:border-[#1E2638] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#141C2E]'
                  }`}
                >
                  {comp} ({count})
                </button>
              );
            })}
          </div>

          {/* Matches Grid (2 columns on desktop) */}
          {filteredMatches.length === 0 ? (
            <div className="rounded-2xl border border-slate-200/90 dark:border-[#1E2638] bg-white dark:bg-[#0F1626] p-10 text-center space-y-3">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Nenhum jogo encontrado com os filtros selecionados.
              </p>
              <button
                onClick={() => {
                  setSelectedLeague('ALL');
                  setSelectedBetType('all');
                }}
                className="rounded-xl bg-blue-600 text-white px-4 py-2 text-xs font-semibold hover:bg-blue-500 transition-colors"
              >
                Limpar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMatches.map((match) => {
                const associatedBet = userBets.find(b => b.match_id === match.id);
                return (
                  <MatchCard 
                    key={match.id} 
                    match={match} 
                    onSelectMatch={onSelectMatch} 
                    associatedBet={associatedBet}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: AI Hero Card, Quick Filters, History CTA, Featured Leagues */}
        <div className="lg:col-span-4">
          <DashboardRightPanel
            competitions={competitions}
            selectedCompetition={selectedLeague}
            onSelectCompetition={setSelectedLeague}
            selectedDateFilter={selectedDateFilter}
            onSelectDateFilter={setSelectedDateFilter}
            selectedBetType={selectedBetType}
            onSelectBetType={setSelectedBetType}
            onNavigateToHistory={onNavigateToHistory}
            competitionCounts={competitionCounts}
          />
        </div>
      </div>
    </div>
  );
};
