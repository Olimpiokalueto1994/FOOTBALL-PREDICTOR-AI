import React, { useState } from 'react';
import { Match } from '../types/football';
import { MatchProbabilityBar } from './MatchProbabilityBar';
import { Calendar, Clock, MapPin, Zap, Star, ChevronRight, TrendingUp } from 'lucide-react';
import { Language, translations } from '../i18n/translations';

interface DashboardViewProps {
  matches: Match[];
  onSelectMatch: (matchId: string) => void;
  language: Language;
  onToggleFavorite: (matchId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  matches,
  onSelectMatch,
  language,
  onToggleFavorite,
}) => {
  const t = translations[language];
  const [selectedLeague, setSelectedLeague] = useState<string>('ALL');

  const filteredMatches = selectedLeague === 'ALL'
    ? matches
    : matches.filter(m => m.competitionCode === selectedLeague || m.competition === selectedLeague);

  // Find matches with high probability or strong signal
  const highSignalMatches = matches.filter(m => m.prediction?.signalStrength === 'STRONG' || m.prediction?.marketDiscrepancy?.hasValueSignal);

  return (
    <div id="dashboard-view" className="space-y-8 pb-12">
      {/* Header section conforming strictly to Section 6 */}
      <div id="dashboard-header" className="border-b border-[#252D3A] pb-6 pt-2">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                PREDICTIVE ENGINE • ENSEMBLE v1.4.2
              </span>
              <span className="rounded bg-amber-500/15 border border-amber-500/40 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-400">
                {t.demoModeBadge}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#F5F7FA] font-mono sm:text-4xl mt-1">
              Football Predictor AI
            </h1>
            <p className="mt-1.5 text-base text-[#8D98A8]">
              {t.appSubtitle}
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap gap-2 text-xs font-mono">
            <div className="rounded-md border border-[#252D3A] bg-[#10151F] px-3 py-1.5">
              <span className="text-[#8D98A8]">Acurácia (Sintética):</span>{' '}
              <span className="font-semibold text-emerald-400">68.4%</span>
            </div>
            <div className="rounded-md border border-[#252D3A] bg-[#10151F] px-3 py-1.5">
              <span className="text-[#8D98A8]">Brier Score:</span>{' '}
              <span className="font-semibold text-[#F5F7FA]">0.178</span>
            </div>
            <div className="rounded-md border border-[#252D3A] bg-[#10151F] px-3 py-1.5">
              <span className="text-[#8D98A8]">Calibração:</span>{' '}
              <span className="font-semibold text-blue-400">Platt Scaling</span>
            </div>
          </div>
        </div>

        {/* Explicit Demo Data Notice */}
        <div className="mt-4 rounded-md border border-amber-500/30 bg-amber-500/10 px-3.5 py-2.5 text-xs text-amber-300 font-mono flex items-start space-x-2">
          <span className="font-bold whitespace-nowrap">{t.demoModeBadge}</span>
          <span className="text-amber-200/90 font-sans">
            {t.demoModeNotice} Nenhuma métrica nesta tela reflete resultados financeiros reais.
          </span>
        </div>

        {/* Ethical disclaimer reminder */}
        <div className="mt-2 rounded-md border border-[#252D3A]/70 bg-[#10151F]/60 px-3.5 py-2 text-xs text-[#8D98A8]">
          <span className="font-medium text-[#F5F7FA]">Aviso Metodológico:</span> {t.disclaimer}
        </div>
      </div>

      {/* Marquee / High Signal Highlight */}
      {highSignalMatches.length > 0 && (
        <section id="section-high-signal" className="space-y-3">
          <div className="flex items-center space-x-2 text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400">
            <Zap className="h-4 w-4" />
            <span>Destaques com Forte Sinal Probabilístico</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {highSignalMatches.slice(0, 2).map((m) => (
              <div
                key={`high-${m.id}`}
                id={`card-highlight-${m.id}`}
                onClick={() => onSelectMatch(m.id)}
                className="group cursor-pointer rounded-lg border border-emerald-500/30 bg-[#10151F] p-4 transition-all hover:border-emerald-500/60 hover:bg-[#151C28]"
              >
                <div className="flex items-center justify-between text-xs font-mono text-[#8D98A8]">
                  <span className="font-medium text-[#F5F7FA]">{m.competition} • {m.round}</span>
                  <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
                    Sinal Forte ({m.prediction?.signalStrength})
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img src={m.homeTeam.logo} alt={m.homeTeam.shortName} className="h-8 w-8 rounded-full border border-[#252D3A] object-cover" />
                    <div>
                      <span className="block font-bold text-[#F5F7FA]">{m.homeTeam.shortName}</span>
                      <span className="text-xs text-[#8D98A8] font-mono">Elo {m.homeTeam.stats.eloRating}</span>
                    </div>
                  </div>

                  <span className="font-mono text-xs font-semibold text-[#8D98A8]">vs</span>

                  <div className="flex items-center space-x-3 text-right">
                    <div>
                      <span className="block font-bold text-[#F5F7FA]">{m.awayTeam.shortName}</span>
                      <span className="text-xs text-[#8D98A8] font-mono">Elo {m.awayTeam.stats.eloRating}</span>
                    </div>
                    <img src={m.awayTeam.logo} alt={m.awayTeam.shortName} className="h-8 w-8 rounded-full border border-[#252D3A] object-cover" />
                  </div>
                </div>

                {m.prediction && (
                  <div className="mt-4 pt-3 border-t border-[#252D3A]">
                    <MatchProbabilityBar
                      homeProb={m.prediction.probabilities.oneXTwo.home}
                      drawProb={m.prediction.probabilities.oneXTwo.draw}
                      awayProb={m.prediction.probabilities.oneXTwo.away}
                      homeName={m.homeTeam.shortName}
                      awayName={m.awayTeam.shortName}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main fixtures list section */}
      <section id="section-upcoming-fixtures" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-xl font-bold tracking-tight text-[#F5F7FA] font-mono">
            {t.upcomingMatches}
          </h2>

          {/* League quick filters */}
          <div className="flex flex-wrap gap-1.5 font-mono text-xs">
            {['ALL', 'PL', 'LL', 'CL', 'SA', 'LP'].map((code) => {
              const labels: Record<string, string> = {
                ALL: 'Todas',
                PL: 'Premier League',
                LL: 'La Liga',
                CL: 'Champions League',
                SA: 'Serie A',
                LP: 'Liga Portugal',
              };
              return (
                <button
                  key={code}
                  onClick={() => setSelectedLeague(code)}
                  className={`rounded px-2.5 py-1 transition-colors ${
                    selectedLeague === code
                      ? 'bg-[#151C28] text-emerald-400 font-semibold border border-[#252D3A]'
                      : 'text-[#8D98A8] hover:text-[#F5F7FA] hover:bg-[#10151F]'
                  }`}
                >
                  {labels[code]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Matches Grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMatches.map((match) => {
            const pred = match.prediction?.probabilities.oneXTwo;
            const matchDate = new Date(match.utcDate);
            const formattedTime = matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const formattedDate = matchDate.toLocaleDateString([], { month: 'short', day: 'numeric' });

            return (
              <div
                key={match.id}
                id={`match-card-${match.id}`}
                className="flex flex-col justify-between rounded-lg border border-[#252D3A] bg-[#10151F] p-4 transition-all hover:border-[#374254] hover:bg-[#151C28]"
              >
                <div>
                  {/* Top metadata */}
                  <div className="flex items-center justify-between text-xs font-mono text-[#8D98A8]">
                    <span className="flex items-center space-x-1 truncate font-medium text-[#F5F7FA]">
                      <span>{match.competitionLogo}</span>
                      <span>{match.competition}</span>
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(match.id);
                      }}
                      className={`text-[#8D98A8] hover:text-amber-400 ${match.isFavorite ? 'text-amber-400' : ''}`}
                    >
                      <Star className="h-3.5 w-3.5 fill-current" />
                    </button>
                  </div>

                  {/* Date, Time & Venue */}
                  <div className="mt-1 flex items-center space-x-3 text-[11px] font-mono text-[#8D98A8]">
                    <span className="flex items-center">
                      <Calendar className="mr-1 h-3 w-3" />
                      {formattedDate}
                    </span>
                    <span className="flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      {formattedTime}
                    </span>
                  </div>

                  {/* Teams vs block (Conforming strictly to Section 6 format) */}
                  <div className="mt-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <img src={match.homeTeam.logo} alt={match.homeTeam.shortName} className="h-6 w-6 rounded-full border border-[#252D3A] object-cover" />
                        <span className="font-semibold text-[#F5F7FA] text-sm">{match.homeTeam.shortName}</span>
                      </div>
                      <span className="font-mono text-xs text-[#8D98A8]">
                        #{match.homeTeam.leaguePosition}
                      </span>
                    </div>

                    <div className="text-center font-mono text-[10px] text-[#8D98A8] uppercase tracking-wider">
                      vs
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <img src={match.awayTeam.logo} alt={match.awayTeam.shortName} className="h-6 w-6 rounded-full border border-[#252D3A] object-cover" />
                        <span className="font-semibold text-[#F5F7FA] text-sm">{match.awayTeam.shortName}</span>
                      </div>
                      <span className="font-mono text-xs text-[#8D98A8]">
                        #{match.awayTeam.leaguePosition}
                      </span>
                    </div>
                  </div>

                  {/* Probabilistic estimate bar */}
                  {pred && (
                    <div className="mt-4 pt-3 border-t border-[#252D3A]">
                      <MatchProbabilityBar
                        homeProb={pred.home}
                        drawProb={pred.draw}
                        awayProb={pred.away}
                        homeName={match.homeTeam.shortName}
                        awayName={match.awayTeam.shortName}
                        compact
                      />
                    </div>
                  )}
                </div>

                {/* Bottom action button */}
                <div className="mt-4 pt-2">
                  <button
                    id={`btn-analyze-${match.id}`}
                    onClick={() => onSelectMatch(match.id)}
                    className="w-full flex items-center justify-center space-x-1 rounded-md border border-[#252D3A] bg-[#151C28] py-2 text-xs font-mono font-medium text-emerald-400 hover:border-emerald-500/60 hover:bg-emerald-500/10 transition-colors"
                  >
                    <span>[ {t.analyze.toUpperCase()} ]</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
