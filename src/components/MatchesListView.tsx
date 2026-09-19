import React, { useState } from 'react';
import { Match } from '../types/football';
import { MatchProbabilityBar } from './MatchProbabilityBar';
import { Calendar, Clock, MapPin, Search, Star, Filter, ChevronRight } from 'lucide-react';
import { Language, translations } from '../i18n/translations';

interface MatchesListViewProps {
  matches: Match[];
  onSelectMatch: (matchId: string) => void;
  language: Language;
  onToggleFavorite: (matchId: string) => void;
}

export const MatchesListView: React.FC<MatchesListViewProps> = ({
  matches,
  onSelectMatch,
  language,
  onToggleFavorite,
}) => {
  const t = translations[language];
  const [selectedLeague, setSelectedLeague] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState<boolean>(false);

  const filtered = matches.filter((m) => {
    if (selectedLeague !== 'ALL' && m.competitionCode !== selectedLeague && m.competition !== selectedLeague) {
      return false;
    }
    if (selectedStatus !== 'ALL' && m.status !== selectedStatus) {
      return false;
    }
    if (showOnlyFavorites && !m.isFavorite) {
      return false;
    }
    if (searchFilter.trim() !== '') {
      const q = searchFilter.toLowerCase();
      const matchText = `${m.homeTeam.name} ${m.awayTeam.name} ${m.homeTeam.shortName} ${m.awayTeam.shortName} ${m.competition} ${m.venue}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    return true;
  });

  return (
    <div id="matches-list-view" className="space-y-6 pb-12">
      {/* Top Filter Controls */}
      <div className="rounded-xl border border-[#252D3A] bg-[#10151F] p-4 space-y-4 font-mono text-xs">
        <div className="flex flex-col md:flex-row gap-3 justify-between items-center">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#8D98A8]" />
            <input
              id="filter-search-input"
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filtrar por time, liga, estádio..."
              className="w-full rounded-md border border-[#252D3A] bg-[#151C28] py-1.5 pl-9 pr-3 text-xs text-[#F5F7FA] placeholder-[#8D98A8] focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Quick status & favorites */}
          <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
            <button
              onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
              className={`flex items-center space-x-1 rounded px-3 py-1.5 border transition-colors ${
                showOnlyFavorites
                  ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                  : 'border-[#252D3A] bg-[#151C28] text-[#8D98A8] hover:text-[#F5F7FA]'
              }`}
            >
              <Star className="h-3.5 w-3.5 fill-current" />
              <span>Favoritos ({matches.filter(m => m.isFavorite).length})</span>
            </button>
          </div>
        </div>

        {/* League Chips */}
        <div className="flex flex-wrap gap-1.5 border-t border-[#252D3A] pt-3">
          {[
            { code: 'ALL', label: 'Todas as Ligas' },
            { code: 'PL', label: 'Premier League' },
            { code: 'LL', label: 'La Liga' },
            { code: 'CL', label: 'Champions League' },
            { code: 'SA', label: 'Serie A' },
            { code: 'LP', label: 'Liga Portugal' },
          ].map((l) => (
            <button
              key={l.code}
              onClick={() => setSelectedLeague(l.code)}
              className={`rounded px-3 py-1 transition-colors ${
                selectedLeague === l.code
                  ? 'bg-[#151C28] text-emerald-400 font-semibold border border-[#252D3A]'
                  : 'text-[#8D98A8] hover:text-[#F5F7FA] hover:bg-[#151C28]'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Fixtures list */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs font-mono text-[#8D98A8] px-1">
          <span>{filtered.length} confrontos encontrados</span>
          <span>Ordenados cronologicamente</span>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-[#252D3A] bg-[#10151F] p-12 text-center text-xs font-mono text-[#8D98A8]">
            Nenhuma partida encontrada com os filtros selecionados.
          </div>
        ) : (
          filtered.map((match) => {
            const pred = match.prediction?.probabilities.oneXTwo;
            return (
              <div
                key={match.id}
                id={`match-row-${match.id}`}
                onClick={() => onSelectMatch(match.id)}
                className="group cursor-pointer rounded-lg border border-[#252D3A] bg-[#10151F] p-4 transition-all hover:border-[#374254] hover:bg-[#151C28]"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Fixture metadata */}
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(match.id);
                      }}
                      className={`text-[#8D98A8] hover:text-amber-400 ${match.isFavorite ? 'text-amber-400' : ''}`}
                    >
                      <Star className="h-4 w-4 fill-current" />
                    </button>

                    <div className="text-xs font-mono text-[#8D98A8] min-w-[140px]">
                      <span className="font-semibold text-[#F5F7FA] block">
                        {match.competition}
                      </span>
                      <span>
                        {new Date(match.utcDate).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {new Date(match.utcDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Teams */}
                    <div className="flex items-center space-x-3 text-sm font-bold text-[#F5F7FA]">
                      <div className="flex items-center space-x-2">
                        <img src={match.homeTeam.logo} alt={match.homeTeam.shortName} className="h-6 w-6 rounded-full border border-[#252D3A] object-cover" />
                        <span>{match.homeTeam.name}</span>
                      </div>
                      <span className="font-mono text-xs text-[#8D98A8] font-normal">vs</span>
                      <div className="flex items-center space-x-2">
                        <span>{match.awayTeam.name}</span>
                        <img src={match.awayTeam.logo} alt={match.awayTeam.shortName} className="h-6 w-6 rounded-full border border-[#252D3A] object-cover" />
                      </div>
                    </div>
                  </div>

                  {/* Right: Probabilities and button */}
                  <div className="flex items-center space-x-4">
                    {pred && (
                      <div className="w-56 font-mono text-xs hidden sm:block">
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

                    <button
                      id={`btn-open-match-${match.id}`}
                      className="flex items-center space-x-1 rounded border border-[#252D3A] bg-[#151C28] px-3 py-1.5 text-xs font-mono font-medium text-emerald-400 group-hover:border-emerald-500/60 group-hover:bg-emerald-500/10 transition-colors whitespace-nowrap"
                    >
                      <span>[ ANALISAR ]</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
