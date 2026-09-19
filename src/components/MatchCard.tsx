import React from 'react';
import { Match, TrackedBet } from '../types/football';
import { TeamCrest } from './TeamCrest';
import { Lightbulb, ArrowRight } from 'lucide-react';

interface MatchCardProps {
  match: Match;
  onSelectMatch: (matchId: string) => void;
  associatedBet?: TrackedBet;
}

export function evaluateLiveBetStatus(
  marketChosen: string,
  homeScore: number | undefined,
  awayScore: number | undefined
): 'WON' | 'LOST' | 'PENDING' {
  if (homeScore === undefined || awayScore === undefined) return 'PENDING';
  const scoreHome = Number(homeScore);
  const scoreAway = Number(awayScore);
  const totalGoals = scoreHome + scoreAway;
  const normalized = marketChosen.trim().toUpperCase();

  switch (normalized) {
    case 'HOME':
    case '1':
    case 'VITÓRIA MANDANTE':
    case 'CASA':
      return scoreHome > scoreAway ? 'WON' : 'LOST';

    case 'AWAY':
    case '2':
    case 'VITÓRIA VISITANTE':
    case 'FORA':
      return scoreAway > scoreHome ? 'WON' : 'LOST';

    case 'DRAW':
    case 'X':
    case 'EMPATE':
      return scoreHome === scoreAway ? 'WON' : 'LOST';

    case 'OVER25':
    case 'OVER 2.5':
    case 'MAIS DE 2.5':
    case 'MAIS DE 2.5 GOLS':
      return totalGoals > 2.5 ? 'WON' : 'LOST';

    case 'UNDER25':
    case 'UNDER 2.5':
    case 'MENOS DE 2.5':
    case 'MENOS DE 2.5 GOLS':
      return totalGoals < 2.5 ? 'WON' : 'LOST';

    case 'BTTS':
    case 'AMBAS MARCAM':
    case 'AMBAS MARCAM SIM':
    case 'BTTS_YES':
      return (scoreHome > 0 && scoreAway > 0) ? 'WON' : 'LOST';

    case 'BTTS_NO':
    case 'AMBAS MARCAM NÃO':
      return (scoreHome === 0 || scoreAway === 0) ? 'WON' : 'LOST';

    default:
      if (normalized.includes('OVER') || normalized.includes('MAIS DE')) {
        const value = parseFloat(normalized.replace(/[^0-9.]/g, '')) || 2.5;
        return totalGoals > value ? 'WON' : 'LOST';
      }
      if (normalized.includes('UNDER') || normalized.includes('MENOS DE')) {
        const value = parseFloat(normalized.replace(/[^0-9.]/g, '')) || 2.5;
        return totalGoals < value ? 'WON' : 'LOST';
      }
      return 'PENDING';
  }
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, onSelectMatch, associatedBet }) => {
  const prob = match.prediction?.probabilities?.oneXTwo || { home: 45, draw: 28, away: 27 };

  // Formatted match time
  const timeFormatted = (() => {
    try {
      const date = new Date(match.utcDate);
      const hours = date.getUTCHours().toString().padStart(2, '0');
      const minutes = date.getUTCMinutes().toString().padStart(2, '0');
      return `Hoje · ${hours}:${minutes}`;
    } catch (e) {
      return 'Hoje · 20:00';
    }
  })();

  // AI Tactical commentary excerpt
  const aiExcerpt = (() => {
    if (match.prediction?.aiAnalysis?.tacticalOverview) {
      return match.prediction.aiAnalysis.tacticalOverview;
    }
    if (match.prediction?.aiAnalysis?.summary) {
      return match.prediction.aiAnalysis.summary;
    }
    return `${match.homeTeam.shortName} em boa fase recente, com forte volume ofensivo. ${match.awayTeam.shortName} busca solidez defensiva em transições.`;
  })();

  // League icon/emblem helper
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

  // Render dynamic live bet badge if associatedBet exists
  const liveBetBadge = (() => {
    if (!associatedBet) return null;
    
    const isLive = match.status === 'LIVE';
    if (!isLive) {
      return (
        <div className="mt-1 mb-3 flex items-center justify-between rounded-xl bg-blue-50/60 dark:bg-blue-950/25 px-3 py-1.5 border border-blue-100/60 dark:border-blue-900/35">
          <span className="text-[11px] font-semibold text-blue-800 dark:text-blue-300">
            Palpite Ativo: <strong>{associatedBet.market_chosen}</strong>
          </span>
          <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-100/50 dark:bg-blue-900/40 px-2 py-0.5 rounded">
            Pre-Live
          </span>
        </div>
      );
    }

    const liveStatus = evaluateLiveBetStatus(associatedBet.market_chosen, match.homeScore, match.awayScore);
    const isWinning = liveStatus === 'WON';

    return (
      <div className={`mt-1 mb-3 flex items-center justify-between rounded-xl px-3 py-2 border transition-all ${
        isWinning 
          ? 'bg-emerald-50/75 dark:bg-emerald-950/25 border-emerald-200/60 dark:border-emerald-800/35 text-emerald-800 dark:text-emerald-300' 
          : 'bg-amber-50/70 dark:bg-amber-950/25 border-amber-200/60 dark:border-amber-800/35 text-amber-800 dark:text-amber-300'
      }`}>
        <span className="text-[11px] font-medium">
          Palpite: <strong className="underline decoration-dotted">{associatedBet.market_chosen}</strong> ({associatedBet.odd})
        </span>
        <span className={`inline-flex items-center space-x-1 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
          isWinning 
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 animate-pulse' 
            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
        }`}>
          <span>{isWinning ? '🟢 Batendo' : '⚠️ Em Risco'}</span>
        </span>
      </div>
    );
  })();

  return (
    <div 
      id={`match-card-${match.id}`}
      className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 dark:border-[#1E2638] bg-white dark:bg-[#0F1626] p-5 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200"
    >
      <div>
        {/* Card Header: League and Time */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-3 border-b border-slate-100 dark:border-[#1A2234]">
          <div className="flex items-center space-x-2 font-medium">
            <span className="text-sm">{getLeagueIcon(match.competition)}</span>
            <span className="text-slate-700 dark:text-slate-300 font-semibold">{match.competition}</span>
          </div>
          {match.status === 'LIVE' ? (
            <span className="inline-flex items-center space-x-1 bg-red-500/10 text-red-600 dark:text-red-400 px-2 py-0.5 rounded border border-red-500/20 animate-pulse text-[10px] font-bold">
              🔴 AO VIVO {match.minute ? `(${match.minute}')` : ''}
            </span>
          ) : (
            <span className="font-mono text-slate-400 dark:text-slate-500">{timeFormatted}</span>
          )}
        </div>

        {/* Teams Visual Display: Crests + Names + VS */}
        <div 
          onClick={() => onSelectMatch(match.id)}
          className="py-6 cursor-pointer flex items-center justify-around"
        >
          {/* Home Team */}
          <div className="flex flex-col items-center text-center max-w-[120px] space-y-2">
            <TeamCrest 
              teamName={match.homeTeam.name} 
              shortName={match.homeTeam.shortName}
              logoUrl={match.homeTeam.logo}
              size="lg"
              className="transition-transform group-hover:scale-105 duration-200" 
            />
            <span className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
              {match.homeTeam.shortName}
            </span>
          </div>

          {/* VS Divider or Live Score */}
          {match.status === 'LIVE' ? (
            <div className="flex flex-col items-center justify-center space-y-1">
              <span className="text-2xl font-black text-[#EF4444] dark:text-[#F87171] tracking-tight bg-red-50 dark:bg-red-950/30 px-3.5 py-1.5 rounded-xl border border-red-100 dark:border-red-900/40 animate-pulse">
                {match.homeScore ?? 0} - {match.awayScore ?? 0}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <span className="text-xs font-mono font-bold tracking-widest text-slate-400 dark:text-slate-500">
                VS
              </span>
            </div>
          )}

          {/* Away Team */}
          <div className="flex flex-col items-center text-center max-w-[120px] space-y-2">
            <TeamCrest 
              teamName={match.awayTeam.name} 
              shortName={match.awayTeam.shortName}
              logoUrl={match.awayTeam.logo}
              size="lg"
              className="transition-transform group-hover:scale-105 duration-200" 
            />
            <span className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
              {match.awayTeam.shortName}
            </span>
          </div>
        </div>

        {/* Live Bet Status Badge */}
        {liveBetBadge}

        {/* Probabilities Row matching reference image */}
        <div className="grid grid-cols-3 gap-2 py-3 px-1 rounded-xl bg-slate-50/80 dark:bg-[#131C2E]/60 border border-slate-100 dark:border-slate-800/60">
          {/* Home Win */}
          <div className="flex flex-col items-center text-center px-1">
            <span className="font-mono text-base font-bold text-emerald-600 dark:text-emerald-400">
              {prob.home}%
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-full">
              Vitória {match.homeTeam.shortName}
            </span>
            {/* Progress indicator */}
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.max(10, prob.home))}%` }} 
              />
            </div>
          </div>

          {/* Draw */}
          <div className="flex flex-col items-center text-center px-1">
            <span className="font-mono text-base font-bold text-slate-600 dark:text-slate-300">
              {prob.draw}%
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Empate
            </span>
            {/* Progress indicator */}
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div 
                className="bg-slate-400 dark:bg-slate-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.max(10, prob.draw))}%` }} 
              />
            </div>
          </div>

          {/* Away Win */}
          <div className="flex flex-col items-center text-center px-1">
            <span className="font-mono text-base font-bold text-blue-600 dark:text-blue-400">
              {prob.away}%
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-full">
              Vitória {match.awayTeam.shortName}
            </span>
            {/* Progress indicator */}
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div 
                className="bg-blue-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.max(10, prob.away))}%` }} 
              />
            </div>
          </div>
        </div>

        {/* Subtle separator */}
        <div className="my-4 border-t border-slate-100 dark:border-slate-800/80" />

        {/* AI Analysis Insight */}
        <div className="flex items-start space-x-2.5 pb-4">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 mt-0.5">
            <Lightbulb className="h-3.5 w-3.5" />
          </div>
          <div className="flex-1 text-left">
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block">
              Análise da IA
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mt-0.5">
              {aiExcerpt}
            </p>
          </div>
        </div>
      </div>

      {/* Button: Ver análise completa */}
      <button
        id={`btn-view-match-${match.id}`}
        onClick={() => onSelectMatch(match.id)}
        className="w-full flex items-center justify-center space-x-2 rounded-xl bg-[#0F2952] hover:bg-[#1A3A70] dark:bg-[#1E3A8A] dark:hover:bg-[#2563EB] text-white py-2.5 px-4 text-xs font-semibold transition-colors shadow-xs"
      >
        <span>Ver análise completa</span>
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
      </button>
    </div>
  );
};
