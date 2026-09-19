import React from 'react';
import { Match } from '../types/football';
import { TeamCrest } from './TeamCrest';
import { Lightbulb, ArrowRight } from 'lucide-react';

interface MatchCardProps {
  match: Match;
  onSelectMatch: (matchId: string) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, onSelectMatch }) => {
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
          <span className="font-mono text-slate-400 dark:text-slate-500">{timeFormatted}</span>
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

          {/* VS Divider */}
          <div className="flex flex-col items-center justify-center">
            <span className="text-xs font-mono font-bold tracking-widest text-slate-400 dark:text-slate-500">
              VS
            </span>
          </div>

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
