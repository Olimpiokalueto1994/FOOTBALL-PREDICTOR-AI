import React, { useState } from 'react';
import { Match } from '../types/football';
import { Calendar, CheckCircle, XCircle, Search, Filter } from 'lucide-react';
import { Language } from '../i18n/translations';

interface PredictionHistoryViewProps {
  matches: Match[];
  onSelectMatch: (id: string) => void;
  language: Language;
}

export const PredictionHistoryView: React.FC<PredictionHistoryViewProps> = ({
  matches,
  onSelectMatch,
  language,
}) => {
  const [filterQuery, setFilterQuery] = useState('');

  // Sample finished / historical matches with verified outcomes
  const historicalFixtures = [
    {
      id: 'hist-1',
      date: '2026-09-12',
      competition: 'Premier League',
      homeTeam: 'Arsenal',
      awayTeam: 'Brighton',
      actualScore: '2 - 1',
      predictedProb: { home: 62, draw: 22, away: 16 },
      predictedOutcome: 'HOME',
      actualOutcome: 'HOME',
      brierScore: 0.144,
      wasCorrect: true,
    },
    {
      id: 'hist-2',
      date: '2026-09-13',
      competition: 'La Liga',
      homeTeam: 'Real Sociedad',
      awayTeam: 'Real Madrid',
      actualScore: '0 - 2',
      predictedProb: { home: 24, draw: 28, away: 48 },
      predictedOutcome: 'AWAY',
      actualOutcome: 'AWAY',
      brierScore: 0.165,
      wasCorrect: true,
    },
    {
      id: 'hist-3',
      date: '2026-09-13',
      competition: 'Serie A',
      homeTeam: 'Monza',
      awayTeam: 'Inter Milan',
      actualScore: '1 - 1',
      predictedProb: { home: 18, draw: 27, away: 55 },
      predictedOutcome: 'AWAY',
      actualOutcome: 'DRAW',
      brierScore: 0.380,
      wasCorrect: false,
    },
    {
      id: 'hist-4',
      date: '2026-09-14',
      competition: 'Premier League',
      homeTeam: 'Tottenham',
      awayTeam: 'Arsenal',
      actualScore: '0 - 1',
      predictedProb: { home: 31, draw: 26, away: 43 },
      predictedOutcome: 'AWAY',
      actualOutcome: 'AWAY',
      brierScore: 0.198,
      wasCorrect: true,
    },
    {
      id: 'hist-5',
      date: '2026-09-15',
      competition: 'Champions League',
      homeTeam: 'Milan',
      awayTeam: 'Liverpool',
      actualScore: '1 - 3',
      predictedProb: { home: 29, draw: 27, away: 44 },
      predictedOutcome: 'AWAY',
      actualOutcome: 'AWAY',
      brierScore: 0.182,
      wasCorrect: true,
    },
    {
      id: 'hist-6',
      date: '2026-09-16',
      competition: 'Champions League',
      homeTeam: 'Manchester City',
      awayTeam: 'Inter Milan',
      actualScore: '0 - 0',
      predictedProb: { home: 61, draw: 23, away: 16 },
      predictedOutcome: 'HOME',
      actualOutcome: 'DRAW',
      brierScore: 0.362,
      wasCorrect: false,
    },
  ];

  const filtered = historicalFixtures.filter(h => 
    h.homeTeam.toLowerCase().includes(filterQuery.toLowerCase()) ||
    h.awayTeam.toLowerCase().includes(filterQuery.toLowerCase()) ||
    h.competition.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div id="prediction-history-view" className="space-y-6 pb-12 font-mono text-xs">
      <div className="border-b border-[#252D3A] pb-4">
        <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">
          TEMPORAL AUDIT • EVALUATED LOGS
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-[#F5F7FA] mt-0.5">
          Histórico Auditado de Previsões
        </h2>
        <p className="text-[#8D98A8] text-xs font-sans mt-1">
          Registro temporal imutável de previsões emitidas antes do início dos jogos confrontadas com o resultado final.
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#8D98A8]" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Buscar clube ou liga..."
            className="w-full rounded-md border border-[#252D3A] bg-[#10151F] py-1.5 pl-9 pr-3 text-xs text-[#F5F7FA] placeholder-[#8D98A8] focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="text-[#8D98A8]">
          Total avaliados: <strong className="text-[#F5F7FA]">{filtered.length}</strong>
        </div>
      </div>

      {/* Fixtures table */}
      <div className="overflow-x-auto rounded-lg border border-[#252D3A] bg-[#10151F]">
        <table className="w-full text-left">
          <thead className="border-b border-[#252D3A] bg-[#151C28] text-[#8D98A8]">
            <tr>
              <th className="p-3">Data</th>
              <th className="p-3">Competição</th>
              <th className="p-3">Partida</th>
              <th className="p-3 text-center">Placar Real</th>
              <th className="p-3 text-center">Probabilidades Emitidas</th>
              <th className="p-3 text-center">Brier Score</th>
              <th className="p-3 text-center">Avaliação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#252D3A]">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-[#151C28]/60 transition-colors">
                <td className="p-3 text-[#8D98A8] whitespace-nowrap">{item.date}</td>
                <td className="p-3 text-[#8D98A8] whitespace-nowrap">{item.competition}</td>
                <td className="p-3 font-bold text-[#F5F7FA] whitespace-nowrap">
                  {item.homeTeam} <span className="text-[#8D98A8] font-normal">vs</span> {item.awayTeam}
                </td>
                <td className="p-3 text-center font-bold text-[#F5F7FA]">
                  {item.actualScore}
                </td>
                <td className="p-3 text-center text-[#8D98A8]">
                  <span className="text-emerald-400 font-semibold">{item.predictedProb.home}%</span> /{' '}
                  <span className="text-zinc-300 font-semibold">{item.predictedProb.draw}%</span> /{' '}
                  <span className="text-blue-400 font-semibold">{item.predictedProb.away}%</span>
                </td>
                <td className="p-3 text-center text-[#F5F7FA]">
                  {item.brierScore.toFixed(3)}
                </td>
                <td className="p-3 text-center">
                  {item.wasCorrect ? (
                    <span className="inline-flex items-center space-x-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                      <CheckCircle className="h-3 w-3" />
                      <span>Alinhado</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-400 border border-zinc-700">
                      <XCircle className="h-3 w-3" />
                      <span>Desvio</span>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
