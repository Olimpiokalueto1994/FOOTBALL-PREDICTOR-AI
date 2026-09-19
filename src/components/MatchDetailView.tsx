import React, { useState, useEffect } from 'react';
import { Match, PredictionResult, DetailedMarketOdds } from '../types/football';
import { MatchProbabilityBar } from './MatchProbabilityBar';
import { MarketConsensusCard } from './MarketConsensusCard';
import {
  ArrowLeft,
  Clock,
  MapPin,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Flame,
  Globe,
  Newspaper,
  Sliders,
  Calculator
} from 'lucide-react';
import { Language, translations } from '../i18n/translations';
import { runPrediction, getMatchOdds } from '../services/api';

interface MatchDetailViewProps {
  match: Match;
  onBack: () => void;
  language: Language;
  onOpenTransparencyModal: () => void;
  onUpdateMatchPrediction: (matchId: string, pred: PredictionResult) => void;
  onValidateBet?: (match: Match) => void;
}

export const MatchDetailView: React.FC<MatchDetailViewProps> = ({
  match,
  onBack,
  language,
  onOpenTransparencyModal,
  onUpdateMatchPrediction,
  onValidateBet,
}) => {
  const t = translations[language];
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [marketOdds, setMarketOdds] = useState<DetailedMarketOdds | null>(null);
  const [isLoadingOdds, setIsLoadingOdds] = useState(false);

  // Carrega as odds em tempo real da The-Odds-API para o confronto
  const loadOdds = async () => {
    setIsLoadingOdds(true);
    try {
      const data = await getMatchOdds(match.id);
      setMarketOdds(data);
    } catch (err) {
      console.warn('Falha ao obter cotações da partida:', err);
    } finally {
      setIsLoadingOdds(false);
    }
  };

  const [liveSearchScore, setLiveSearchScore] = useState<{ home: number; away: number; minute?: number; status?: string } | null>(null);
  const [isLiveSearching, setIsLiveSearching] = useState(false);

  const handleCheckLiveWeb = async () => {
    setIsLiveSearching(true);
    setAnalysisError(null);
    try {
      const { searchLiveMatch } = await import('../services/api');
      const result = await searchLiveMatch(`${match.homeTeam.name} vs ${match.awayTeam.name} placar atualizado de hoje ao vivo`);
      if (result && result.liveScore) {
        setLiveSearchScore({
          home: result.liveScore.home,
          away: result.liveScore.away,
          minute: result.liveScore.minute,
          status: result.status,
        });
      } else {
        setAnalysisError('Placar ao vivo não encontrado na busca web ou o jogo ainda não iniciou.');
      }
    } catch (err: any) {
      console.error(err);
      setAnalysisError('Falha ao consultar placar ao vivo via web: ' + (err.message || err));
    } finally {
      setIsLiveSearching(false);
    }
  };

  useEffect(() => {
    loadOdds();
  }, [match.id]);

  const pred = match.prediction;
  const probs = pred?.probabilities?.oneXTwo || { home: 48, draw: 28, away: 24 };
  const topScores = pred?.probabilities?.topScores?.slice(0, 3) || [
    { score: '2-1', home: 2, away: 1, probability: 16 },
    { score: '1-1', home: 1, away: 1, probability: 14 },
    { score: '2-0', home: 2, away: 0, probability: 12 },
  ];
  const over25 = pred?.probabilities?.overUnder?.over25 || 56;
  const under25 = pred?.probabilities?.overUnder?.under25 || 44;
  const bttsYes = pred?.probabilities?.bothTeamsToScore?.yes || 58;
  const bttsNo = pred?.probabilities?.bothTeamsToScore?.no || 42;
  const xGHome = pred?.probabilities?.expectedGoals?.home || 1.65;
  const xGAway = pred?.probabilities?.expectedGoals?.away || 1.12;

  // Most probable scenario text
  let verdictTitle = '';
  if (probs.home >= 50) {
    verdictTitle = `Cenário Mais Provável: Vitória do Mandante (${probs.home}%)`;
  } else if (probs.away >= 50) {
    verdictTitle = `Cenário Mais Provável: Vitória do Visitante (${probs.away}%)`;
  } else if (probs.home > probs.away) {
    verdictTitle = `Cenário Mais Provável: Vantagem do Mandante (${probs.home}% vs ${probs.away}%)`;
  } else {
    verdictTitle = `Cenário Mais Provável: Vantagem do Visitante (${probs.away}% vs ${probs.home}%)`;
  }

  // Signal badge mapping
  const signalMap = {
    STRONG: { label: 'Sinal Forte', bg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400' },
    MODERATE: { label: 'Sinal Moderado', bg: 'bg-blue-500/15 border-blue-500/40 text-blue-400' },
    WEAK: { label: 'Sinal Fraco / Incerteza Alta', bg: 'bg-amber-500/15 border-amber-500/40 text-amber-400' },
    NO_SIGNAL: { label: 'Incerteza Alta (Sem Sinal Claro)', bg: 'bg-rose-500/15 border-rose-500/40 text-rose-400' },
  };
  const signalInfo = signalMap[pred?.signalStrength || 'MODERATE'];

  // Handle re-analyze with real-time Google Search
  const handleReanalyze = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const [updated] = await Promise.all([
        runPrediction(match.id),
        loadOdds(),
      ]);
      onUpdateMatchPrediction(match.id, updated);
    } catch (err) {
      console.error(err);
      setAnalysisError('Não foi possível atualizar a análise online no momento.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div id="match-detail-view" className="space-y-6 pb-12">
      {/* Top Back Navigation & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-[#1E2638] pb-4">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-xs font-mono font-medium text-slate-500 dark:text-[#8D98A8] hover:text-slate-900 dark:hover:text-[#F5F7FA] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar para Jogos</span>
        </button>

        <div className="flex items-center space-x-3">
          {onValidateBet && (
            <button
              onClick={() => onValidateBet(match)}
              className="flex items-center space-x-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-3 py-1.5 text-xs font-mono font-semibold transition-colors shadow-xs"
            >
              <Calculator className="h-3.5 w-3.5" />
              <span>Simular Aposta (EV+)</span>
            </button>
          )}

          <button
            onClick={onOpenTransparencyModal}
            className="flex items-center space-x-1.5 rounded-lg border border-slate-200 dark:border-[#1E2638] bg-white dark:bg-[#0E131F] px-3 py-1.5 text-xs font-mono text-slate-700 dark:text-[#8D98A8] hover:text-slate-900 dark:hover:text-[#F5F7FA] hover:bg-slate-50 dark:hover:bg-[#151C2C] transition-colors shadow-xs"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
            <span>Ver Metodologia</span>
          </button>

          {/* Botão de Checagem de Placar Live via Web */}
          {match.status !== 'FINISHED' && (
            <button
              onClick={handleCheckLiveWeb}
              disabled={isLiveSearching}
              className="flex items-center space-x-1.5 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 px-3 py-1.5 text-xs font-mono font-semibold transition-colors shadow-xs animate-pulse"
            >
              <Globe className={`h-3.5 w-3.5 ${isLiveSearching ? 'animate-spin' : ''}`} />
              <span>{isLiveSearching ? 'Buscando Live...' : 'Checar Placar Live via Web'}</span>
            </button>
          )}

          <button
            onClick={handleReanalyze}
            disabled={isAnalyzing}
            className="flex items-center space-x-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3.5 py-1.5 text-xs font-mono font-semibold transition-all disabled:opacity-50 shadow-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Consultando Google Search...' : 'Atualizar com Dados Live'}</span>
          </button>
        </div>
      </div>

      {analysisError && (
        <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-300 font-mono">
          {analysisError}
        </div>
      )}

      {/* Match Header Banner */}
      <div className="rounded-xl border border-slate-200 dark:border-[#1E2638] bg-white dark:bg-[#0E131F] p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-xs font-mono text-emerald-600 dark:text-emerald-400">
              <span className="font-bold uppercase tracking-wider">{match.competition}</span>
              <span className="text-slate-300 dark:text-[#323E56]">•</span>
              <span className="text-slate-500 dark:text-[#8D98A8]">{match.round || 'Rodada Regular'}</span>
              {(match.status === 'LIVE' || liveSearchScore) && (
                <>
                  <span className="text-slate-300 dark:text-[#323E56]">•</span>
                  <span className="inline-flex items-center space-x-1 bg-red-500/10 text-red-600 dark:text-red-400 px-2 py-0.5 rounded border border-red-500/20 animate-pulse text-[10px] font-bold">
                    🔴 AO VIVO {(match.minute || liveSearchScore?.minute) ? `${match.minute || liveSearchScore?.minute}'` : ''}
                  </span>
                </>
              )}
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-[#F5F7FA] sm:text-3xl tracking-tight flex items-center flex-wrap gap-2">
              <span>{match.homeTeam.name}</span>
              {(match.status === 'LIVE' || liveSearchScore) ? (
                <span className="inline-flex items-center space-x-1 text-2xl font-black text-[#EF4444] dark:text-[#F87171] tracking-tight bg-red-50 dark:bg-red-950/30 px-3.5 py-1 rounded-xl border border-red-100 dark:border-red-900/40 animate-pulse">
                  {liveSearchScore ? liveSearchScore.home : (match.homeScore ?? 0)} - {liveSearchScore ? liveSearchScore.away : (match.awayScore ?? 0)}
                </span>
              ) : (
                <span className="text-slate-400 dark:text-[#5A667A] font-light">vs</span>
              )}
              <span>{match.awayTeam.name}</span>
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500 dark:text-[#8D98A8] pt-1">
              <span className="flex items-center space-x-1.5">
                <Clock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{match.utcDate}</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <MapPin className="h-3.5 w-3.5 text-slate-400 dark:text-[#5A667A]" />
                <span>{match.venue}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`rounded-full border px-3 py-1 text-xs font-mono font-semibold ${signalInfo.bg}`}>
              {signalInfo.label}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. CARD PRINCIPAL — O CENÁRIO MAIS PROVÁVEL (Destaque Visual)             */}
      {/* ========================================================================= */}
      <section id="section-most-probable-scenario" className="rounded-xl border border-emerald-500/30 dark:border-emerald-500/40 bg-gradient-to-b from-emerald-50/40 to-white dark:from-[#0E1724] dark:to-[#0A0E17] p-6 shadow-sm space-y-6">
        <div className="border-b border-slate-200 dark:border-[#1E2638] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">
              VEREDICTO PROBABILÍSTICO
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-[#F5F7FA] font-mono mt-0.5">
              {verdictTitle}
            </h2>
          </div>
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-600 dark:text-[#8D98A8] bg-white dark:bg-[#121826] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#1E2638] shadow-xs">
            <span>xG Projetado:</span>
            <strong className="text-emerald-600 dark:text-emerald-400">{xGHome}</strong>
            <span>x</span>
            <strong className="text-blue-600 dark:text-blue-400">{xGAway}</strong>
          </div>
        </div>

        {/* 1X2 Probabilities Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono text-slate-600 dark:text-[#8D98A8]">
            <span>{match.homeTeam.shortName} ({probs.home}%)</span>
            <span>Empate ({probs.draw}%)</span>
            <span>{match.awayTeam.shortName} ({probs.away}%)</span>
          </div>
          <MatchProbabilityBar 
            homeProb={probs.home}
            drawProb={probs.draw}
            awayProb={probs.away}
            homeName={match.homeTeam.shortName} 
            awayName={match.awayTeam.shortName} 
          />
        </div>

        {/* Grid: Placares Mais Cotados & Mercados Sugeridos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Placares Mais Cotados */}
          <div className="rounded-lg border border-slate-200 dark:border-[#1E2638] bg-white dark:bg-[#0E131F] p-4 space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-[#8D98A8] block">
              Placares Mais Cotados (Dixon-Coles)
            </span>
            <div className="grid grid-cols-3 gap-2">
              {topScores.map((score, idx) => (
                <div key={idx} className="rounded-lg bg-slate-50 dark:bg-[#141A29] border border-slate-200 dark:border-[#232D42] p-2.5 text-center">
                  <span className="font-mono text-lg font-extrabold text-slate-900 dark:text-[#F5F7FA] block">
                    {score.score}
                  </span>
                  <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">
                    {score.probability}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Mercados Sugeridos (Over/Under & BTTS) */}
          <div className="rounded-lg border border-slate-200 dark:border-[#1E2638] bg-white dark:bg-[#0E131F] p-4 space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-[#8D98A8] block">
              Mercados Sugeridos
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              {/* Over / Under */}
              <div className="rounded-lg bg-slate-50 dark:bg-[#141A29] border border-slate-200 dark:border-[#232D42] p-2.5">
                <span className="text-slate-500 dark:text-[#8D98A8] block text-[11px]">Total de Gols</span>
                <div className="flex justify-between items-center mt-1">
                  <span className="font-bold text-slate-900 dark:text-[#F5F7FA]">Over 2.5:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{over25}%</span>
                </div>
                <div className="flex justify-between items-center text-slate-500 dark:text-[#8D98A8] text-[11px] mt-0.5">
                  <span>Under 2.5:</span>
                  <span>{under25}%</span>
                </div>
              </div>

              {/* Both Teams To Score */}
              <div className="rounded-lg bg-slate-50 dark:bg-[#141A29] border border-slate-200 dark:border-[#232D42] p-2.5">
                <span className="text-slate-500 dark:text-[#8D98A8] block text-[11px]">Ambas Marcam</span>
                <div className="flex justify-between items-center mt-1">
                  <span className="font-bold text-slate-900 dark:text-[#F5F7FA]">Sim:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{bttsYes}%</span>
                </div>
                <div className="flex justify-between items-center text-slate-500 dark:text-[#8D98A8] text-[11px] mt-0.5">
                  <span>Não:</span>
                  <span>{bttsNo}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. CONSENSO DO MERCADO EM TEMPO REAL (THE ODDS API)                       */}
      {/* ========================================================================= */}
      <MarketConsensusCard
        match={match}
        marketOdds={marketOdds}
        modelProbabilities={probs}
        isLoading={isLoadingOdds}
        onRefreshOdds={loadOdds}
      />

      {/* ========================================================================= */}
      {/* 3. PAINEL DE CRUZAMENTO DE DADOS PÚBLICOS (Live Data & Contexto)          */}
      {/* ========================================================================= */}
      <section id="section-public-data-panel" className="rounded-xl border border-slate-200 dark:border-[#1E2638] bg-white dark:bg-[#0E131F] p-6 space-y-5 shadow-xs">
        <div className="border-b border-slate-200 dark:border-[#1E2638] pb-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Globe className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-[#F5F7FA]">
              Cruzamento de Dados Públicos & Notícias em Tempo Real
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500 dark:text-[#8D98A8]">
            Google Search Grounding
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Consenso do Mercado */}
          <div className="rounded-lg border border-slate-200 dark:border-[#1A2234] bg-slate-50 dark:bg-[#121826] p-4 space-y-2">
            <span className="text-xs font-mono font-bold uppercase text-blue-600 dark:text-blue-400 flex items-center">
              <TrendingUp className="mr-1.5 h-3.5 w-3.5" />
              Consenso de Mercado vs Probabilidade do Modelo
            </span>
            <p className="text-xs text-slate-600 dark:text-[#8D98A8] font-sans leading-relaxed">
              {pred?.aiAnalysis?.marketConsensus || 
                `As probabilidades implícitas de mercado estimam equilíbrio com valor detectado em favor de ${match.homeTeam.shortName}. O modelo aponta ${probs.home}% contra cotações médias de 2.10.`}
            </p>
            {pred?.marketDiscrepancy && (
              <div className="rounded bg-slate-200/60 dark:bg-[#161E30] px-3 py-1.5 text-xs font-mono text-slate-900 dark:text-[#F5F7FA] flex justify-between">
                <span className="text-slate-500 dark:text-[#8D98A8]">Margem de Discrepância:</span>
                <strong className={pred.marketDiscrepancy.hasValueSignal ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-[#8D98A8]'}>
                  +{pred.marketDiscrepancy.edgePercentage}% em {pred.marketDiscrepancy.selection}
                </strong>
              </div>
            )}
          </div>

          {/* Notícias de Última Hora & Fóruns */}
          <div className="rounded-lg border border-slate-200 dark:border-[#1A2234] bg-slate-50 dark:bg-[#121826] p-4 space-y-2">
            <span className="text-xs font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400 flex items-center">
              <Newspaper className="mr-1.5 h-3.5 w-3.5" />
              Últimas Notícias, Escalações & Clima dos Vestiários
            </span>
            <p className="text-xs text-slate-600 dark:text-[#8D98A8] font-sans leading-relaxed">
              {pred?.aiAnalysis?.liveNewsSummary || 
                `Escalações prováveis mantidas sem novos desfalques de última hora. Noticiário esportivo destaca foco máximo dos elencos na disputa territorial e ritmo de posse.`}
            </p>
            {pred?.aiAnalysis?.breakingNewsPoints && pred.aiAnalysis.breakingNewsPoints.length > 0 && (
              <ul className="space-y-1 text-xs text-slate-600 dark:text-[#8D98A8] font-sans">
                {pred.aiAnalysis.breakingNewsPoints.map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-1.5">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Desfalques Confirmados */}
        <div className="rounded-lg border border-slate-200 dark:border-[#1A2234] bg-slate-50 dark:bg-[#121826] p-4 space-y-3">
          <span className="text-xs font-mono font-bold uppercase text-slate-600 dark:text-[#8D98A8] block">
            Desfalques & Boletim Médico Confirmado
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div>
              <span className="font-bold text-slate-900 dark:text-[#F5F7FA] block mb-1">{match.homeTeam.name}:</span>
              {match.homeTeam.injuries.length === 0 ? (
                <span className="text-slate-400 dark:text-[#5A667A]">Elenco 100% disponível.</span>
              ) : (
                <ul className="space-y-1 text-slate-600 dark:text-[#8D98A8]">
                  {match.homeTeam.injuries.map((inj, idx) => (
                    <li key={idx} className="flex items-center space-x-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                      <span className="font-semibold text-slate-900 dark:text-[#F5F7FA]">{inj.player}</span>
                      <span className="text-slate-400 dark:text-[#5A667A]">({inj.status} - {inj.importance})</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <span className="font-bold text-slate-900 dark:text-[#F5F7FA] block mb-1">{match.awayTeam.name}:</span>
              {match.awayTeam.injuries.length === 0 ? (
                <span className="text-slate-400 dark:text-[#5A667A]">Elenco 100% disponível.</span>
              ) : (
                <ul className="space-y-1 text-slate-600 dark:text-[#8D98A8]">
                  {match.awayTeam.injuries.map((inj, idx) => (
                    <li key={idx} className="flex items-center space-x-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                      <span className="font-semibold text-slate-900 dark:text-[#F5F7FA]">{inj.player}</span>
                      <span className="text-slate-400 dark:text-[#5A667A]">({inj.status} - {inj.importance})</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Fontes de Pesquisa do Google (Grounding) */}
        {pred?.aiAnalysis?.searchSources && pred.aiAnalysis.searchSources.length > 0 && (
          <div className="pt-1 flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-[#8D98A8]">
            <span className="text-slate-400 dark:text-[#5A667A]">Fontes consultadas:</span>
            {pred.aiAnalysis.searchSources.map((source, idx) => (
              <a
                key={idx}
                href={source.uri}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center space-x-1 rounded bg-slate-100 dark:bg-[#141A29] px-2 py-0.5 text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors border border-slate-200 dark:border-[#232D42]"
              >
                <span className="truncate max-w-[150px]">{source.title}</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            ))}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 3. FATORES DECISIVOS (Por que esse palpite?)                               */}
      {/* ========================================================================= */}
      <section id="section-decisive-factors" className="rounded-xl border border-slate-200 dark:border-[#1E2638] bg-white dark:bg-[#0E131F] p-6 space-y-5 shadow-xs">
        <div className="border-b border-slate-200 dark:border-[#1E2638] pb-3 flex items-center justify-between">
          <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-[#F5F7FA]">
            Fatores Decisivos: Por que esse palpite?
          </h3>
          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
            Explicabilidade dos Modelos
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pontos a favor do Mandante */}
          <div className="rounded-lg border border-slate-200 dark:border-[#1E2638] bg-slate-50 dark:bg-[#121826] p-4 space-y-2.5">
            <span className="text-xs font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400 flex items-center">
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
              A favor de {match.homeTeam.name}
            </span>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-[#8D98A8] font-sans">
              {(pred?.aiAnalysis?.favorsHome || [
                `Vantagem de jogar no ${match.venue} com apoio da torcida.`,
                `Eficiência ofensiva com ${match.homeTeam.stats.goalsFor} gols marcados.`,
                `Diferencial positivo no rating Elo ponderado (+65 no mando).`
              ]).map((point, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-emerald-500 font-bold mt-0.5">•</span>
                  <span className="leading-relaxed text-slate-800 dark:text-[#F5F7FA]">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pontos a favor do Visitante */}
          <div className="rounded-lg border border-slate-200 dark:border-[#1E2638] bg-slate-50 dark:bg-[#121826] p-4 space-y-2.5">
            <span className="text-xs font-mono font-bold uppercase text-blue-600 dark:text-blue-400 flex items-center">
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
              A favor de {match.awayTeam.name}
            </span>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-[#8D98A8] font-sans">
              {(pred?.aiAnalysis?.favorsAway || [
                `Capacidade em transições rápidas e bolas paradas.`,
                `Qualidade técnica em jogadores de decisão do setor ofensivo.`,
                `Histórico de competitividade em confrontos diretos recentes.`
              ]).map((point, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-blue-500 font-bold mt-0.5">•</span>
                  <span className="leading-relaxed text-slate-800 dark:text-[#F5F7FA]">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* O que pode derrubar o palpite */}
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 space-y-2">
          <span className="text-xs font-mono font-bold uppercase text-amber-600 dark:text-amber-400 flex items-center">
            <AlertTriangle className="mr-1.5 h-4 w-4" />
            O que pode derrubar o palpite? (Riscos & Incertezas)
          </span>
          <ul className="space-y-1.5 text-xs text-amber-900/90 dark:text-amber-200/90 font-sans">
            {(pred?.aiAnalysis?.whatCouldChange || [
              'Desfalque de última hora no aquecimento antes da partida.',
              'Gol precoce nos primeiros 10 minutos forçando mudança estrutural de esquema tático.',
              'Desgaste acumulado de viagens recentes gerando queda física no segundo tempo.'
            ]).map((risk, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-amber-500 font-bold mt-0.5">•</span>
                <span className="leading-relaxed">{risk}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
};
