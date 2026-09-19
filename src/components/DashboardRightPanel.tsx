import React from 'react';
import { 
  Brain, 
  Filter, 
  Target, 
  ChevronRight, 
  ArrowRight,
  Calendar,
  Layers
} from 'lucide-react';

interface DashboardRightPanelProps {
  competitions: string[];
  selectedCompetition: string;
  onSelectCompetition: (comp: string) => void;
  selectedDateFilter: string;
  onSelectDateFilter: (val: string) => void;
  selectedBetType: string;
  onSelectBetType: (val: string) => void;
  onNavigateToHistory: () => void;
  competitionCounts: Record<string, number>;
}

export const DashboardRightPanel: React.FC<DashboardRightPanelProps> = ({
  competitions,
  selectedCompetition,
  onSelectCompetition,
  selectedDateFilter,
  onSelectDateFilter,
  selectedBetType,
  onSelectBetType,
  onNavigateToHistory,
  competitionCounts,
}) => {
  // League flags/icons
  const getLeagueIcon = (league: string) => {
    const l = league.toLowerCase();
    if (l.includes('premier')) return '🏴󠁧󠁢󠁥󠁮󠁧󠁿';
    if (l.includes('liga') && !l.includes('portugal')) return '🇪🇸';
    if (l.includes('portugal')) return '🇵🇹';
    if (l.includes('serie a') || l.includes('itália')) return '🇮🇹';
    if (l.includes('champions')) return '⭐';
    if (l.includes('bundesliga')) return '🇩🇪';
    return '⚽';
  };

  const featuredLeagues = ['Premier League', 'La Liga', 'Champions League', 'Serie A', 'Liga Portugal'];

  return (
    <aside className="space-y-5">
      {/* 1. Dark AI Insight Card matching screenshot */}
      <div className="relative overflow-hidden rounded-2xl bg-[#090E1A] p-5 text-white shadow-md border border-[#1A2234]">
        {/* Subtle trend curve in background */}
        <svg 
          className="absolute -right-2 -bottom-2 h-28 w-44 opacity-25 pointer-events-none stroke-blue-500 fill-none" 
          viewBox="0 0 160 80"
        >
          <path d="M0 60 Q 40 50, 80 20 T 160 5" strokeWidth="2.5" />
          <circle cx="160" cy="5" r="4" fill="#3B82F6" />
        </svg>

        <div className="relative z-10 space-y-3">
          {/* Brain Icon in glowing pink/purple */}
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500/20 to-purple-600/20 border border-rose-500/30 text-rose-400">
            <Brain className="h-5 w-5" />
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-bold tracking-tight text-white leading-snug">
              Aposte com informação, não com sorte.
            </h3>
            <p className="text-[11px] text-slate-300/80 leading-relaxed">
              Nossa IA analisa tudo para você: desempenho, lesões, tendências e dados históricos.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Filtros Rápidos */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-[#1E2638] bg-white dark:bg-[#0F1626] p-5 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-xs pb-1 border-b border-slate-100 dark:border-slate-800">
          <Filter className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          <span>Filtros Rápidos</span>
        </div>

        <div className="space-y-3 text-xs">
          {/* Select Campeonato */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Campeonato
            </label>
            <select
              value={selectedCompetition}
              onChange={(e) => onSelectCompetition(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-[#20293D] bg-slate-50 dark:bg-[#121826] px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">Todos os campeonatos</option>
              {competitions.filter(c => c !== 'ALL').map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Select Data */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Data
            </label>
            <div className="relative">
              <select
                value={selectedDateFilter}
                onChange={(e) => onSelectDateFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-[#20293D] bg-slate-50 dark:bg-[#121826] px-3 py-2 pr-8 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 appearance-none"
              >
                <option value="today">Hoje</option>
                <option value="tomorrow">Amanhã</option>
                <option value="all">Todas as datas</option>
              </select>
              <Calendar className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>

          {/* Select Tipo de aposta */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Tipo de aposta
            </label>
            <select
              value={selectedBetType}
              onChange={(e) => onSelectBetType(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-[#20293D] bg-slate-50 dark:bg-[#121826] px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="all">Todos</option>
              <option value="home_win">Vitória Mandante (&gt;50%)</option>
              <option value="away_win">Vitória Visitante (&gt;40%)</option>
              <option value="btts">Ambos Marcam provável</option>
              <option value="over25">Mais de 2.5 gols</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Quer mais precisão? CTA Card */}
      <div className="rounded-2xl border border-rose-100 dark:border-rose-950/40 bg-gradient-to-br from-rose-50/70 to-pink-50/40 dark:from-[#1A1218] dark:to-[#17101C] p-5 shadow-xs space-y-2.5">
        <div className="flex items-center space-x-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <Target className="h-4 w-4" />
          </div>
          <h4 className="font-bold text-xs text-slate-900 dark:text-white">
            Quer mais precisão?
          </h4>
        </div>

        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
          Acesse o histórico completo de previsões e veja como a IA tem se saído ao longo do tempo.
        </p>

        <button
          onClick={onNavigateToHistory}
          className="inline-flex items-center space-x-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors pt-1"
        >
          <span>Ver histórico</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      {/* 4. Campeonatos em Destaque */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-[#1E2638] bg-white dark:bg-[#0F1626] p-5 shadow-xs space-y-3">
        <h4 className="font-bold text-xs text-slate-900 dark:text-white">
          Campeonatos em Destaque
        </h4>

        <div className="space-y-1">
          {featuredLeagues.map((league) => {
            const count = competitionCounts[league] || 2;
            const isSelected = selectedCompetition === league;

            return (
              <button
                key={league}
                onClick={() => onSelectCompetition(isSelected ? 'ALL' : league)}
                className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs transition-colors ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#131C2E]'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span className="text-sm">{getLeagueIcon(league)}</span>
                  <span className="truncate">{league}</span>
                </div>

                <div className="flex items-center space-x-1.5 text-slate-400 dark:text-slate-500 font-mono text-[11px]">
                  <span>{count} {count === 1 ? 'jogo' : 'jogos'}</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
