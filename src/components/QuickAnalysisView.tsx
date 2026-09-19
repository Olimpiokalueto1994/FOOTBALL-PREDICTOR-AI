import React, { useState } from 'react';
import { queryPredictor, searchLiveMatch } from '../services/api';
import { 
  Search, 
  Sparkles, 
  Send, 
  ExternalLink, 
  ArrowRight, 
  Clock,
  TrendingUp,
  AlertTriangle,
  Newspaper,
  ShieldCheck,
  Target,
  Percent
} from 'lucide-react';
import { Language, translations } from '../i18n/translations';
import { Match, LiveMatchAnalysisResult } from '../types/football';
import { MatchProbabilityBar } from './MatchProbabilityBar';

interface QuickAnalysisViewProps {
  onSelectMatch: (matchId: string) => void;
  language: Language;
  matches: Match[];
  initialQuery?: string;
}

export const QuickAnalysisView: React.FC<QuickAnalysisViewProps> = ({
  onSelectMatch,
  language,
  matches,
  initialQuery = '',
}) => {
  const t = translations[language];
  const [queryText, setQueryText] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [liveResult, setLiveResult] = useState<LiveMatchAnalysisResult | null>(null);
  const [textResult, setTextResult] = useState<{
    answer: string;
    relatedMatchId?: string;
    sources?: { title: string; uri: string }[];
  } | null>(null);

  const handleSearch = async (text: string) => {
    const q = (text || queryText).trim();
    if (!q || loading) return;

    setLoading(true);
    setQueryText(q);
    setLiveResult(null);
    setTextResult(null);

    try {
      // Check if query looks like a match confrontation (e.g. contains "vs", "x", "contra", or two teams)
      const isConfrontation = /vs| x |contra|jogos|partida/i.test(q) || q.split(' ').length <= 5;

      if (isConfrontation) {
        const liveAnalysis = await searchLiveMatch(q);
        setLiveResult(liveAnalysis);
      } else {
        const res = await queryPredictor(q);
        setTextResult(res);
      }
    } catch (err) {
      console.error('Erro na análise rápida:', err);
      setTextResult({
        answer: 'Ocorreu uma instabilidade temporária ao buscar dados ao vivo na internet. As probabilidades computadas continuam acessíveis no catálogo de jogos.',
      });
    } finally {
      setLoading(false);
    }
  };

  const sampleQueries = [
    'Petro de Luanda vs Sagrada Esperança',
    'Real Madrid vs Barcelona notícias e desfalques',
    'Arsenal vs Manchester City odds e prováveis escalações',
    'Flamengo vs Palmeiras xG projetado e retrospecto',
    'Sporting vs Porto cotações e análise',
  ];

  return (
    <div id="quick-analysis-view" className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-[#1E2638] pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
            <Search className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-[#F5F7FA] font-mono tracking-tight">
              Análise Rápida & Pesquisa com Google Search
            </h1>
            <p className="text-xs text-slate-500 dark:text-[#8D98A8]">
              Pesquise QUALQUER confronto no mundo, consulte odds reais de mercado, desfalques recentes e projeções estatísticas.
            </p>
          </div>
        </div>
      </div>

      {/* Prominent Search Bar */}
      <div className="rounded-xl border border-slate-200 dark:border-[#1E2638] bg-white dark:bg-[#0E131F] p-5 shadow-xs space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(queryText);
          }}
          className="relative flex items-center"
        >
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 dark:text-[#8D98A8]">
            <Sparkles className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
          </div>
          <input
            id="quick-search-input"
            type="text"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="Digite dois times (ex: Petro de Luanda vs Sagrada Esperança, Arsenal vs City)..."
            className="w-full rounded-xl border border-slate-200 dark:border-[#1E2638] bg-slate-50 dark:bg-[#121826] py-3.5 pl-12 pr-32 text-sm text-slate-900 dark:text-[#F5F7FA] placeholder-slate-400 dark:placeholder-[#5A667A] focus:border-emerald-500 focus:bg-white dark:focus:bg-[#121826] focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-sans"
          />
          <button
            type="submit"
            disabled={loading || !queryText.trim()}
            className="absolute right-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 text-xs font-bold font-mono transition-all disabled:opacity-40 flex items-center space-x-1.5 shadow-xs"
          >
            {loading ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                <span>Buscando...</span>
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                <span>Pesquisar</span>
              </>
            )}
          </button>
        </form>

        {/* Suggested Queries Chips */}
        <div className="space-y-2 pt-1">
          <span className="text-[11px] font-mono text-slate-500 dark:text-[#5A667A] uppercase tracking-wider block">
            Sugestões de Análise Rápida:
          </span>
          <div className="flex flex-wrap gap-2">
            {sampleQueries.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSearch(q)}
                disabled={loading}
                className="rounded-lg border border-slate-200 dark:border-[#1E2638] bg-slate-50 dark:bg-[#121826] px-3 py-1.5 text-xs text-slate-600 dark:text-[#8D98A8] hover:border-emerald-500/40 hover:text-slate-900 dark:hover:text-[#F5F7FA] transition-colors text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading Skeleton Indicator */}
      {loading && (
        <div className="rounded-xl border border-slate-200 dark:border-[#1E2638] bg-white dark:bg-[#0E131F] p-8 text-center space-y-3">
          <div className="inline-flex h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <p className="text-xs font-mono text-slate-600 dark:text-[#8D98A8]">
            Pesquisando na web via Google Search Grounding: apurando notícias, odds de mercado e modelando probabilidades...
          </p>
        </div>
      )}

      {/* 1. Structured Live Match Analysis Card */}
      {liveResult && (
        <div className="rounded-xl border border-emerald-500/30 bg-white dark:bg-[#0E131F] p-6 shadow-sm space-y-6">
          {/* Header of Live Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-[#1E2638] pb-4 gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Apuração em Tempo Real & Modelagem Probabilística
                </span>
                <span className={`rounded px-2 py-0.5 text-[10px] font-mono font-semibold ${
                  liveResult.isQuotaLimited
                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                }`}>
                  {liveResult.isQuotaLimited ? 'Motor Estatístico Local' : 'Google Grounding'}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC] mt-1">
                {liveResult.homeTeam} <span className="text-slate-400">vs</span> {liveResult.awayTeam}
              </h2>
              <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-[#8D98A8] font-mono mt-1">
                <span>{liveResult.competition}</span>
                <span>•</span>
                <span>{liveResult.matchDate}</span>
                {liveResult.venue && (
                  <>
                    <span>•</span>
                    <span className="truncate">{liveResult.venue}</span>
                  </>
                )}
              </div>
            </div>

            <div className="text-right sm:self-center">
              <span className="text-[10px] font-mono text-slate-500 dark:text-[#8D98A8] block">SINAL DO MODELO</span>
              <span className={`inline-block rounded px-2 py-0.5 text-xs font-mono font-bold ${
                liveResult.signalStrength === 'STRONG'
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                  : 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30'
              }`}>
                {liveResult.signalStrength}
              </span>
            </div>
          </div>

          {/* Probabilities 1X2 */}
          <div className="rounded-xl border border-slate-200 dark:border-[#1E293B] bg-slate-50/50 dark:bg-[#121824] p-4 space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
              Probabilidades Estimadas (1X2)
            </span>
            <MatchProbabilityBar
              homeProb={liveResult.probabilities.home}
              drawProb={liveResult.probabilities.draw}
              awayProb={liveResult.probabilities.away}
              homeName={liveResult.homeTeam}
              awayName={liveResult.awayTeam}
            />
          </div>

          {/* Key Metrics Bento (Odds, xG, Over/Under, BTTS) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono tabular-nums">
            {/* Market Odds */}
            <div className="rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#121824] p-3 space-y-1">
              <span className="text-[10px] text-slate-500 dark:text-[#8D98A8] uppercase flex items-center">
                <Percent className="h-3 w-3 mr-1 text-emerald-500" /> Odds de Mercado
              </span>
              <div className="flex justify-between text-xs font-bold text-slate-900 dark:text-slate-200">
                <span>1: {liveResult.marketOdds.home.toFixed(2)}</span>
                <span>X: {liveResult.marketOdds.draw.toFixed(2)}</span>
                <span>2: {liveResult.marketOdds.away.toFixed(2)}</span>
              </div>
              <span className="text-[9px] text-slate-400 block truncate" title={liveResult.marketOdds.bookmakersFound}>
                {liveResult.marketOdds.bookmakersFound || 'Consenso apurado'}
              </span>
            </div>

            {/* Expected Goals (xG) */}
            <div className="rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#121824] p-3 space-y-1">
              <span className="text-[10px] text-slate-500 dark:text-[#8D98A8] uppercase flex items-center">
                <Target className="h-3 w-3 mr-1 text-blue-500" /> xG Projetado
              </span>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-200">
                {liveResult.expectedGoals.home.toFixed(2)} vs {liveResult.expectedGoals.away.toFixed(2)}
              </div>
              <span className="text-[9px] text-slate-400 block">
                Total: {liveResult.expectedGoals.total.toFixed(2)} gols
              </span>
            </div>

            {/* Over / Under 2.5 */}
            <div className="rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#121824] p-3 space-y-1">
              <span className="text-[10px] text-slate-500 dark:text-[#8D98A8] uppercase">Over / Under 2.5</span>
              <div className="flex justify-between text-xs font-bold text-slate-900 dark:text-slate-200">
                <span className="text-emerald-600 dark:text-emerald-400">+{liveResult.overUnder25.over}%</span>
                <span className="text-slate-500">-{liveResult.overUnder25.under}%</span>
              </div>
              <span className="text-[9px] text-slate-400 block">Mercado de gols</span>
            </div>

            {/* Top Scores */}
            <div className="rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#121824] p-3 space-y-1">
              <span className="text-[10px] text-slate-500 dark:text-[#8D98A8] uppercase">Placares Prováveis</span>
              <div className="flex space-x-2 text-xs font-bold text-slate-900 dark:text-slate-200">
                {liveResult.topScores.map((s, idx) => (
                  <span key={idx} className="rounded bg-slate-200/60 dark:bg-[#1A2333] px-1.5 py-0.5">
                    {s.score}
                  </span>
                ))}
              </div>
              <span className="text-[9px] text-slate-400 block">Matriz de Poisson</span>
            </div>
          </div>

          {/* Veredicto Objetivo */}
          <div className="rounded-lg border-l-4 border-l-emerald-500 bg-slate-50 dark:bg-[#141A29] p-4">
            <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block mb-1">
              Veredicto Probabilístico
            </span>
            <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans font-medium">
              {liveResult.verdict}
            </p>
          </div>

          {/* Arguments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* A favor do Mandante */}
            <div className="rounded-xl border border-slate-200 dark:border-[#1E2638] bg-slate-50/50 dark:bg-[#101622] p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 flex items-center">
                <TrendingUp className="h-3.5 w-3.5 mr-1.5" /> A Favor: {liveResult.homeTeam}
              </span>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                {liveResult.favorsHome.map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* A favor do Visitante */}
            <div className="rounded-xl border border-slate-200 dark:border-[#1E2638] bg-slate-50/50 dark:bg-[#101622] p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-blue-700 dark:text-blue-400 flex items-center">
                <TrendingUp className="h-3.5 w-3.5 mr-1.5" /> A Favor: {liveResult.awayTeam}
              </span>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                {liveResult.favorsAway.map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Breaking News & Riscos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Notícias Recentes */}
            {liveResult.breakingNews && liveResult.breakingNews.length > 0 && (
              <div className="rounded-xl border border-slate-200 dark:border-[#1E2638] bg-slate-50/50 dark:bg-[#101622] p-4 space-y-2">
                <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 flex items-center">
                  <Newspaper className="h-3.5 w-3.5 mr-1.5 text-amber-500" /> Notícias & Escalações Recentes
                </span>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  {liveResult.breakingNews.map((news, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{news}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Riscos e Incertezas */}
            {liveResult.risksAndUncertainties && liveResult.risksAndUncertainties.length > 0 && (
              <div className="rounded-xl border border-slate-200 dark:border-[#1E2638] bg-slate-50/50 dark:bg-[#101622] p-4 space-y-2">
                <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 flex items-center">
                  <AlertTriangle className="h-3.5 w-3.5 mr-1.5 text-rose-500" /> Riscos & Incertezas da Partida
                </span>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  {liveResult.risksAndUncertainties.map((risk, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-rose-500 font-bold">•</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sources Grounding */}
          {liveResult.sources && liveResult.sources.length > 0 && (
            <div className="pt-3 border-t border-slate-200 dark:border-[#1E2638] flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500 dark:text-[#8D98A8]">
              <span className="text-slate-400">Fontes & Referências:</span>
              {liveResult.sources.map((src, idx) => 
                src.uri.startsWith('local://') ? (
                  <span
                    key={idx}
                    className="inline-flex items-center space-x-1 rounded bg-slate-100 dark:bg-[#141A29] px-2.5 py-1 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#232D42] text-[11px]"
                  >
                    <span className="truncate max-w-[280px]">{src.title}</span>
                  </span>
                ) : (
                  <a
                    key={idx}
                    href={src.uri}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center space-x-1 rounded bg-slate-100 dark:bg-[#141A29] px-2.5 py-1 text-blue-600 dark:text-blue-400 hover:text-blue-500 border border-slate-200 dark:border-[#232D42] text-[11px]"
                  >
                    <span className="truncate max-w-[200px]">{src.title}</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                )
              )}
            </div>
          )}
        </div>
      )}

      {/* 2. Textual QA Result (for general inquiries) */}
      {textResult && (
        <div className="rounded-xl border border-emerald-500/30 bg-white dark:bg-[#0E131F] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1E2638] pb-3">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Resposta Analítica & Contexto em Tempo Real
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-500 dark:text-[#8D98A8]">
              Gemini 3.8 Flash + Google Grounding
            </span>
          </div>

          <div className="text-sm text-slate-800 dark:text-[#F5F7FA] leading-relaxed whitespace-pre-line font-sans">
            {textResult.answer}
          </div>

          {textResult.relatedMatchId && (
            <div className="pt-2 border-t border-slate-200 dark:border-[#1E2638]">
              <button
                onClick={() => onSelectMatch(textResult.relatedMatchId!)}
                className="inline-flex items-center space-x-2 rounded-lg bg-emerald-500/15 border border-emerald-500/40 px-4 py-2 text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 transition-all"
              >
                <span>Ver Veredicto Completo Desta Partida</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {textResult.sources && textResult.sources.length > 0 && (
            <div className="pt-3 border-t border-slate-200 dark:border-[#1E2638] flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500 dark:text-[#8D98A8]">
              <span className="text-slate-400">Fontes Web Consultadas:</span>
              {textResult.sources.map((src, idx) => (
                <a
                  key={idx}
                  href={src.uri}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center space-x-1 rounded bg-slate-100 dark:bg-[#141A29] px-2.5 py-1 text-blue-600 dark:text-blue-400 hover:text-blue-500 border border-slate-200 dark:border-[#232D42] text-[11px]"
                >
                  <span className="truncate max-w-[180px]">{src.title}</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Available Matches Shortcuts */}
      <div className="rounded-xl border border-slate-200 dark:border-[#1E2638] bg-white dark:bg-[#0E131F] p-5 space-y-3">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-[#8D98A8] block">
          Jogos Prontos no Catálogo:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {matches.slice(0, 6).map((m) => (
            <button
              key={m.id}
              onClick={() => onSelectMatch(m.id)}
              className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-[#1A2234] bg-slate-50 dark:bg-[#121826] p-3 text-left hover:border-emerald-500/40 hover:bg-slate-100 dark:hover:bg-[#151C2C] transition-all group"
            >
              <div>
                <span className="text-[11px] font-mono text-slate-400 dark:text-[#5A667A] block">{m.competition}</span>
                <span className="text-xs font-bold text-slate-800 dark:text-[#F5F7FA] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors block">
                  {m.homeTeam.shortName} vs {m.awayTeam.shortName}
                </span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

