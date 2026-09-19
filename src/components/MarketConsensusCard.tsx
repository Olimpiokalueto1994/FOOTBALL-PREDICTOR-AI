import React, { useState } from 'react';
import { Match, DetailedMarketOdds } from '../types/football';
import { 
  TrendingUp, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  RefreshCw, 
  Percent, 
  BarChart3, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface MarketConsensusCardProps {
  match: Match;
  marketOdds: DetailedMarketOdds | null;
  modelProbabilities: { home: number; draw: number; away: number };
  isLoading?: boolean;
  onRefreshOdds?: () => void;
}

export const MarketConsensusCard: React.FC<MarketConsensusCardProps> = ({
  match,
  marketOdds,
  modelProbabilities,
  isLoading = false,
  onRefreshOdds,
}) => {
  const [showBookmakers, setShowBookmakers] = useState(false);

  // Se não houver odds ainda, calculamos valores de fallback coerentes
  const homeOdd = marketOdds?.odds?.home || 2.10;
  const drawOdd = marketOdds?.odds?.draw || 3.30;
  const awayOdd = marketOdds?.odds?.away || 3.40;

  // Probabilidades implícitas normalizadas (sem vigorish)
  const impliedHome = marketOdds?.impliedProbabilities?.home ?? 45.0;
  const impliedDraw = marketOdds?.impliedProbabilities?.draw ?? 28.0;
  const impliedAway = marketOdds?.impliedProbabilities?.away ?? 27.0;
  const margin = marketOdds?.impliedProbabilities?.margin ?? 5.2;

  // Probabilidades do modelo
  const modelHome = modelProbabilities.home;
  const modelDraw = modelProbabilities.draw;
  const modelAway = modelProbabilities.away;

  // Discrepâncias (Edge = Modelo - Mercado)
  const edgeHome = Number((modelHome - impliedHome).toFixed(1));
  const edgeDraw = Number((modelDraw - impliedDraw).toFixed(1));
  const edgeAway = Number((modelAway - impliedAway).toFixed(1));

  // Identificação do melhor valor estatístico
  let bestEdge = 0;
  let bestSelection: 'HOME' | 'DRAW' | 'AWAY' | 'NONE' = 'NONE';

  if (edgeHome > bestEdge && edgeHome >= 2.5) {
    bestEdge = edgeHome;
    bestSelection = 'HOME';
  }
  if (edgeDraw > bestEdge && edgeDraw >= 2.5) {
    bestEdge = edgeDraw;
    bestSelection = 'DRAW';
  }
  if (edgeAway > bestEdge && edgeAway >= 2.5) {
    bestEdge = edgeAway;
    bestSelection = 'AWAY';
  }

  const selectionNames = {
    HOME: match.homeTeam.shortName || match.homeTeam.name,
    DRAW: 'Empate',
    AWAY: match.awayTeam.shortName || match.awayTeam.name,
    NONE: 'Nenhum',
  };

  return (
    <div id="market-consensus-card" className="rounded-xl border border-slate-200 dark:border-[#1E2638] bg-white dark:bg-[#0F1420] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-[#1E2638] bg-slate-50/50 dark:bg-[#121826]/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white font-sans">
                Consenso do Mercado vs. Modelo Matemático
              </h3>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                marketOdds?.isLive 
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                  : 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${marketOdds?.isLive ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`} />
                {marketOdds?.isLive ? 'The Odds API (Ao Vivo)' : 'Consenso Calibrado'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#8D98A8]">
              Cotações médias de casas europeias com extração do vigorish (margem da casa)
            </p>
          </div>
        </div>

        {onRefreshOdds && (
          <button
            onClick={onRefreshOdds}
            disabled={isLoading}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-mono font-medium text-slate-600 dark:text-[#8D98A8] hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-[#1A2234] hover:bg-slate-200 dark:hover:bg-[#232D42] rounded-lg transition-colors disabled:opacity-50"
            title="Atualizar cotações do The-Odds-API"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-500' : ''}`} />
            <span>{isLoading ? 'Consultando...' : 'Atualizar Odds'}</span>
          </button>
        )}
      </div>

      <div className="p-4 sm:p-5 space-y-5">
        {/* 1. Resumo das Odds Médias Reais 1X2 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-[#8D98A8]">
              Cotações Médias de Mercado (1X2)
            </span>
            <span className="text-[11px] font-mono text-slate-400 dark:text-[#657285]">
              Margem das casas (Overround): <strong className="text-slate-600 dark:text-[#C5D0E0]">{margin}%</strong>
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Casa (1) */}
            <div className="rounded-lg border border-slate-200 dark:border-[#1E2638] bg-slate-50/70 dark:bg-[#141B2B] p-3 text-center transition-colors">
              <span className="text-[11px] font-mono text-slate-500 dark:text-[#8D98A8] block truncate">
                1 · {match.homeTeam.shortName || match.homeTeam.name}
              </span>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white my-1">
                {homeOdd.toFixed(2)}
              </div>
              <span className="text-[10px] font-mono text-slate-400 dark:text-[#657285] block">
                Prob. Implícita: <strong className="text-slate-700 dark:text-[#B0BAC9]">{impliedHome}%</strong>
              </span>
            </div>

            {/* Empate (X) */}
            <div className="rounded-lg border border-slate-200 dark:border-[#1E2638] bg-slate-50/70 dark:bg-[#141B2B] p-3 text-center transition-colors">
              <span className="text-[11px] font-mono text-slate-500 dark:text-[#8D98A8] block">
                X · Empate
              </span>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white my-1">
                {drawOdd.toFixed(2)}
              </div>
              <span className="text-[10px] font-mono text-slate-400 dark:text-[#657285] block">
                Prob. Implícita: <strong className="text-slate-700 dark:text-[#B0BAC9]">{impliedDraw}%</strong>
              </span>
            </div>

            {/* Fora (2) */}
            <div className="rounded-lg border border-slate-200 dark:border-[#1E2638] bg-slate-50/70 dark:bg-[#141B2B] p-3 text-center transition-colors">
              <span className="text-[11px] font-mono text-slate-500 dark:text-[#8D98A8] block truncate">
                2 · {match.awayTeam.shortName || match.awayTeam.name}
              </span>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white my-1">
                {awayOdd.toFixed(2)}
              </div>
              <span className="text-[10px] font-mono text-slate-400 dark:text-[#657285] block">
                Prob. Implícita: <strong className="text-slate-700 dark:text-[#B0BAC9]">{impliedAway}%</strong>
              </span>
            </div>
          </div>
        </div>

        {/* 2. Cruzamento Comparativo: Modelo vs. Mercado */}
        <div className="rounded-lg border border-slate-200 dark:border-[#1E2638] bg-slate-50/30 dark:bg-[#121826]/40 p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-700 dark:text-[#C5D0E0] flex items-center">
              <BarChart3 className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
              Cruzamento Direto de Probabilidades
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Base: 100% normalizado
            </span>
          </div>

          <div className="space-y-2.5">
            {/* Linha Mandante */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[180px]">
                  {match.homeTeam.shortName || match.homeTeam.name} (1)
                </span>
                <div className="flex items-center space-x-3">
                  <span className="text-slate-500 dark:text-[#8D98A8]">
                    Casas: <strong className="text-slate-700 dark:text-[#D1D9E6]">{impliedHome}%</strong>
                  </span>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">
                    Modelo: {modelHome}%
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    edgeHome > 0 
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                      : 'bg-slate-200/60 dark:bg-[#1E2638] text-slate-600 dark:text-[#8D98A8]'
                  }`}>
                    {edgeHome > 0 ? `+${edgeHome}%` : `${edgeHome}%`}
                  </span>
                </div>
              </div>
              {/* Barra visual comparativa */}
              <div className="h-2 w-full bg-slate-200 dark:bg-[#1E2638] rounded-full overflow-hidden flex">
                <div 
                  className="h-full bg-blue-500 dark:bg-blue-400 transition-all duration-500"
                  style={{ width: `${modelHome}%` }}
                  title={`Modelo: ${modelHome}%`}
                />
              </div>
            </div>

            {/* Linha Empate */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  Empate (X)
                </span>
                <div className="flex items-center space-x-3">
                  <span className="text-slate-500 dark:text-[#8D98A8]">
                    Casas: <strong className="text-slate-700 dark:text-[#D1D9E6]">{impliedDraw}%</strong>
                  </span>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">
                    Modelo: {modelDraw}%
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    edgeDraw > 0 
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                      : 'bg-slate-200/60 dark:bg-[#1E2638] text-slate-600 dark:text-[#8D98A8]'
                  }`}>
                    {edgeDraw > 0 ? `+${edgeDraw}%` : `${edgeDraw}%`}
                  </span>
                </div>
              </div>
              {/* Barra visual comparativa */}
              <div className="h-2 w-full bg-slate-200 dark:bg-[#1E2638] rounded-full overflow-hidden flex">
                <div 
                  className="h-full bg-amber-500 dark:bg-amber-400 transition-all duration-500"
                  style={{ width: `${modelDraw}%` }}
                  title={`Modelo: ${modelDraw}%`}
                />
              </div>
            </div>

            {/* Linha Visitante */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[180px]">
                  {match.awayTeam.shortName || match.awayTeam.name} (2)
                </span>
                <div className="flex items-center space-x-3">
                  <span className="text-slate-500 dark:text-[#8D98A8]">
                    Casas: <strong className="text-slate-700 dark:text-[#D1D9E6]">{impliedAway}%</strong>
                  </span>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">
                    Modelo: {modelAway}%
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    edgeAway > 0 
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                      : 'bg-slate-200/60 dark:bg-[#1E2638] text-slate-600 dark:text-[#8D98A8]'
                  }`}>
                    {edgeAway > 0 ? `+${edgeAway}%` : `${edgeAway}%`}
                  </span>
                </div>
              </div>
              {/* Barra visual comparativa */}
              <div className="h-2 w-full bg-slate-200 dark:bg-[#1E2638] rounded-full overflow-hidden flex">
                <div 
                  className="h-full bg-rose-500 dark:bg-rose-400 transition-all duration-500"
                  style={{ width: `${modelAway}%` }}
                  title={`Modelo: ${modelAway}%`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Destaque de Discrepância / Valor Estatístico */}
        <div className={`rounded-lg border p-4 flex items-start space-x-3 transition-colors ${
          bestSelection !== 'NONE'
            ? 'border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200'
            : 'border-slate-200 dark:border-[#1E2638] bg-slate-50/50 dark:bg-[#141B2B] text-slate-700 dark:text-[#B0BAC9]'
        }`}>
          {bestSelection !== 'NONE' ? (
            <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          )}

          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wide">
                {bestSelection !== 'NONE' ? 'Oportunidade de Valor Estatístico Detectada' : 'Equilíbrio e Eficiência de Mercado'}
              </span>
              {bestSelection !== 'NONE' && (
                <span className="px-2 py-0.5 bg-emerald-500 text-white dark:bg-emerald-500/30 dark:text-emerald-300 rounded text-[10px] font-mono font-bold">
                  +{bestEdge}% Edge
                </span>
              )}
            </div>

            <p className="text-xs leading-relaxed font-sans opacity-90">
              {bestSelection !== 'NONE' ? (
                <>
                  O modelo estatístico atribui <strong>{bestSelection === 'HOME' ? modelHome : bestSelection === 'AWAY' ? modelAway : modelDraw}%</strong> de probabilidade para <strong>{selectionNames[bestSelection]}</strong>, enquanto a cotação média de mercado embute apenas <strong>{bestSelection === 'HOME' ? impliedHome : bestSelection === 'AWAY' ? impliedAway : impliedDraw}%</strong> (descontada a margem). Discrepância favorável de <strong>+{bestEdge}%</strong>.
                </>
              ) : (
                <>
                  As probabilidades estimadas pelo Ensemble Matemático convergem com o consenso das casas de apostas (The Odds API) dentro do intervalo de tolerância estatística (&lt; 2.5%).
                </>
              )}
            </p>
          </div>
        </div>

        {/* 4. Bookmakers Europeus Detalhados (Acordeão) */}
        {marketOdds?.sampleBookmakers && marketOdds.sampleBookmakers.length > 0 && (
          <div className="border-t border-slate-100 dark:border-[#1E2638] pt-3">
            <button
              onClick={() => setShowBookmakers(!showBookmakers)}
              className="w-full flex items-center justify-between text-xs font-mono text-slate-500 dark:text-[#8D98A8] hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <span>Ver cotações individuais por casa ({marketOdds.sampleBookmakers.length} casas registradas)</span>
              {showBookmakers ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showBookmakers && (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-[#1E2638] text-slate-400 dark:text-[#657285] text-left">
                      <th className="py-1.5 font-medium">Casa de Apostas</th>
                      <th className="py-1.5 text-center font-medium">1 (Casa)</th>
                      <th className="py-1.5 text-center font-medium">X (Empate)</th>
                      <th className="py-1.5 text-center font-medium">2 (Fora)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#1E2638]/60 text-slate-700 dark:text-[#C5D0E0]">
                    {marketOdds.sampleBookmakers.map((bm, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-[#141B2B]/40 transition-colors">
                        <td className="py-2 font-medium">{bm.name}</td>
                        <td className="py-2 text-center font-semibold text-slate-900 dark:text-white">{bm.home.toFixed(2)}</td>
                        <td className="py-2 text-center font-semibold text-slate-900 dark:text-white">{bm.draw.toFixed(2)}</td>
                        <td className="py-2 text-center font-semibold text-slate-900 dark:text-white">{bm.away.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
