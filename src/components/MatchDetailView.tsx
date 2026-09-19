import React, { useState } from 'react';
import { Match, PredictionResult } from '../types/football';
import { MatchProbabilityBar } from './MatchProbabilityBar';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  Activity,
  Users,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Layers,
  History,
  Info
} from 'lucide-react';
import { Language, translations } from '../i18n/translations';
import { runPrediction } from '../services/api';

interface MatchDetailViewProps {
  match: Match;
  onBack: () => void;
  language: Language;
  onOpenTransparencyModal: () => void;
  onUpdateMatchPrediction: (matchId: string, pred: PredictionResult) => void;
}

export const MatchDetailView: React.FC<MatchDetailViewProps> = ({
  match,
  onBack,
  language,
  onOpenTransparencyModal,
  onUpdateMatchPrediction,
}) => {
  const t = translations[language];
  const [activeMarketTab, setActiveMarketTab] = useState<'1x2' | 'doubleChance' | 'goals' | 'btts' | 'props'>('1x2');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');

  const pred = match.prediction;
  const home = match.homeTeam;
  const away = match.awayTeam;

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    const steps = [
      'Analisando forma recente e gols esperados (xG)...',
      'Calculando ratings Elo com ajuste de mando (+65 Elo)...',
      'Avaliando boletim médico e índice de disponibilidade...',
      'Processando calendário e índice de fadiga...',
      'Executando distribuição bivariada de Poisson (Dixon-Coles)...',
      'Processando árvores de decisão e regressão logística...',
      'Calibrando probabilidades via Platt Scaling...',
      'Consultando AI Football Analyst para síntese...',
    ];

    for (const step of steps) {
      setAnalysisStep(step);
      await new Promise((r) => setTimeout(r, 220));
    }

    try {
      const result = await runPrediction(match.id);
      onUpdateMatchPrediction(match.id, result);
    } catch (err) {
      console.error('Error running prediction:', err);
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  const getSignalBadge = (signal?: string) => {
    switch (signal) {
      case 'STRONG':
        return <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-xs font-mono font-semibold text-emerald-400">Sinal Forte</span>;
      case 'MODERATE':
        return <span className="rounded bg-blue-500/10 border border-blue-500/30 px-2.5 py-1 text-xs font-mono font-semibold text-blue-400">Sinal Moderado</span>;
      case 'WEAK':
        return <span className="rounded bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 text-xs font-mono font-semibold text-amber-400">Sinal Fraco</span>;
      default:
        return <span className="rounded bg-zinc-800 border border-zinc-700 px-2.5 py-1 text-xs font-mono font-semibold text-zinc-400">Sem Vantagem Clara</span>;
    }
  };

  return (
    <div id="match-detail-view" className="space-y-6 pb-16">
      {/* Back button & quick action */}
      <div className="flex items-center justify-between">
        <button
          id="btn-back-to-dashboard"
          onClick={onBack}
          className="flex items-center space-x-1.5 text-xs font-mono text-[#8D98A8] hover:text-[#F5F7FA] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar ao Dashboard</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            id="btn-transparency-modal-trigger"
            onClick={onOpenTransparencyModal}
            className="flex items-center space-x-1 rounded-md border border-[#252D3A] bg-[#10151F] px-2.5 py-1.5 text-xs font-mono text-[#8D98A8] hover:text-[#F5F7FA] hover:bg-[#151C28]"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
            <span>{t.howCalculated}</span>
          </button>
        </div>
      </div>

      {/* MATCH HEADER (Section 8) */}
      <div id="match-header-card" className="rounded-xl border border-[#252D3A] bg-[#10151F] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#8D98A8] border-b border-[#252D3A] pb-3">
          <div className="flex items-center space-x-2">
            <span className="text-base">{match.competitionLogo}</span>
            <span className="font-semibold text-[#F5F7FA]">{match.competition}</span>
            <span>•</span>
            <span>{match.round}</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <Calendar className="mr-1 h-3.5 w-3.5" />
              {new Date(match.utcDate).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
            <span className="flex items-center">
              <Clock className="mr-1 h-3.5 w-3.5" />
              {new Date(match.utcDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="flex items-center text-zinc-400">
              <MapPin className="mr-1 h-3.5 w-3.5" />
              {match.venue}
            </span>
          </div>
        </div>

        {/* Big Teams Face-Off */}
        <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Home team */}
          <div className="flex items-center space-x-4 w-full md:w-5/12">
            <img src={home.logo} alt={home.name} className="h-16 w-16 rounded-full border border-[#252D3A] object-cover p-1 bg-[#151C28]" />
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-[#F5F7FA]">{home.name}</h2>
                <span className="rounded bg-[#151C28] px-2 py-0.5 text-xs font-mono text-[#8D98A8] border border-[#252D3A]">
                  #{home.leaguePosition}
                </span>
              </div>
              <div className="mt-1 flex items-center space-x-3 text-xs font-mono text-[#8D98A8]">
                <span>Rating Elo: <strong className="text-[#F5F7FA]">{home.stats.eloRating}</strong></span>
                <span>•</span>
                <span>xG: <strong className="text-[#F5F7FA]">{home.stats.xG}</strong></span>
              </div>
            </div>
          </div>

          {/* Versus & Status */}
          <div className="text-center">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#8D98A8]">VS</span>
            <div className="mt-1">
              {getSignalBadge(pred?.signalStrength)}
            </div>
          </div>

          {/* Away team */}
          <div className="flex items-center justify-end space-x-4 w-full md:w-5/12 text-right">
            <div>
              <div className="flex items-center justify-end space-x-2">
                <span className="rounded bg-[#151C28] px-2 py-0.5 text-xs font-mono text-[#8D98A8] border border-[#252D3A]">
                  #{away.leaguePosition}
                </span>
                <h2 className="text-xl font-bold text-[#F5F7FA]">{away.name}</h2>
              </div>
              <div className="mt-1 flex items-center justify-end space-x-3 text-xs font-mono text-[#8D98A8]">
                <span>xG: <strong className="text-[#F5F7FA]">{away.stats.xG}</strong></span>
                <span>•</span>
                <span>Rating Elo: <strong className="text-[#F5F7FA]">{away.stats.eloRating}</strong></span>
              </div>
            </div>
            <img src={away.logo} alt={away.name} className="h-16 w-16 rounded-full border border-[#252D3A] object-cover p-1 bg-[#151C28]" />
          </div>
        </div>

        {/* Action Button: Recalculate / Deep Analyze */}
        <div className="mt-6 pt-4 border-t border-[#252D3A] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-[#8D98A8] font-mono">
            {isAnalyzing ? (
              <span className="flex items-center text-emerald-400">
                <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                {analysisStep}
              </span>
            ) : (
              <span>Última recalibração: {pred ? new Date(pred.timestamp).toLocaleTimeString() : 'Pendente'}</span>
            )}
          </div>

          <button
            id="btn-recalculate-analysis"
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-5 py-2 text-xs font-mono font-semibold text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/60 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'PROCESSANDO MODELOS...' : '[ RECALCULAR / ANALISAR ]'}</span>
          </button>
        </div>
      </div>

      {/* PREDICTION SUMMARY (Section 8.1 & 74) */}
      {pred && (
        <div id="prediction-summary-card" className="rounded-xl border border-[#252D3A] bg-[#10151F] p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#252D3A] pb-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                MODEL OUTPUT • PROBABILISTIC ESTIMATES
              </span>
              <h3 className="text-xl font-bold text-[#F5F7FA] font-mono mt-0.5">
                Resumo da Previsão do Ensemble
              </h3>
            </div>

            {/* Three-Tier Trust Metrics (Section 56) */}
            <div className="flex flex-wrap gap-2 font-mono text-xs">
              <div className="rounded border border-[#252D3A] bg-[#151C28] px-3 py-1">
                <span className="text-[#8D98A8]">Data Confidence:</span>{' '}
                <span className="font-semibold text-emerald-400">{pred.dataConfidence}%</span>
              </div>
              <div className="rounded border border-[#252D3A] bg-[#151C28] px-3 py-1">
                <span className="text-[#8D98A8]">Confiabilidade do Modelo:</span>{' '}
                <span className="font-semibold text-blue-400">{pred.modelReliability}</span>
              </div>
            </div>
          </div>

          {/* 1X2 Probabilities Highlight */}
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3 text-center font-mono">
              <div className="rounded-lg border border-[#252D3A] bg-[#151C28] p-3">
                <span className="block text-xs text-[#8D98A8] uppercase">{home.shortName} (Casa)</span>
                <span className="text-2xl font-extrabold text-emerald-400">{pred.probabilities.oneXTwo.home}%</span>
              </div>
              <div className="rounded-lg border border-[#252D3A] bg-[#151C28] p-3">
                <span className="block text-xs text-[#8D98A8] uppercase">Empate</span>
                <span className="text-2xl font-extrabold text-zinc-300">{pred.probabilities.oneXTwo.draw}%</span>
              </div>
              <div className="rounded-lg border border-[#252D3A] bg-[#151C28] p-3">
                <span className="block text-xs text-[#8D98A8] uppercase">{away.shortName} (Fora)</span>
                <span className="text-2xl font-extrabold text-blue-400">{pred.probabilities.oneXTwo.away}%</span>
              </div>
            </div>

            {/* Full-width probability bar */}
            <MatchProbabilityBar
              homeProb={pred.probabilities.oneXTwo.home}
              drawProb={pred.probabilities.oneXTwo.draw}
              awayProb={pred.probabilities.oneXTwo.away}
              homeName={home.shortName}
              awayName={away.shortName}
            />
          </div>

          {/* Value Discrepancy Signal (Section 61 & 62) */}
          {pred.marketDiscrepancy?.hasValueSignal && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3.5 text-xs font-mono flex items-start space-x-3">
              <TrendingUp className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-emerald-400 uppercase">Discrepância Estatística Detectada</span>
                <p className="text-[#8D98A8] mt-0.5">
                  O modelo estima probabilidade de {pred.marketDiscrepancy.modelProb}% para {pred.marketDiscrepancy.selection === 'HOME' ? home.shortName : away.shortName}, enquanto o consenso implícito do mercado é de {pred.marketDiscrepancy.impliedMarketProb}%.
                  Diferencial estatístico de <strong className="text-[#F5F7FA]">+{pred.marketDiscrepancy.edgePercentage} pp</strong>.
                </p>
              </div>
            </div>
          )}

          {/* Expected goals & top probable scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Expected Goals */}
            <div className="rounded-lg border border-[#252D3A] bg-[#151C28] p-4 font-mono space-y-2">
              <span className="text-xs text-[#8D98A8] uppercase font-semibold block">Gols Esperados (xG Modelado)</span>
              <div className="flex items-center justify-between text-base font-bold text-[#F5F7FA]">
                <span>{home.shortName}: {pred.probabilities.expectedGoals.home}</span>
                <span className="text-[#8D98A8]">—</span>
                <span>{away.shortName}: {pred.probabilities.expectedGoals.away}</span>
              </div>
              <span className="text-xs text-[#8D98A8] block">
                Total Esperado na Partida: <strong className="text-emerald-400">{pred.probabilities.expectedGoals.total} gols</strong>
              </span>
            </div>

            {/* Top Scorelines */}
            <div className="rounded-lg border border-[#252D3A] bg-[#151C28] p-4 font-mono space-y-2">
              <span className="text-xs text-[#8D98A8] uppercase font-semibold block">Placares Mais Prováveis</span>
              <div className="flex flex-wrap gap-2">
                {pred.probabilities.topScores.slice(0, 5).map((score) => (
                  <div key={score.score} className="rounded border border-[#252D3A] bg-[#10151F] px-2.5 py-1 text-xs">
                    <span className="font-bold text-[#F5F7FA]">{score.score}</span>{' '}
                    <span className="text-emerald-400">({score.probability}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PREDICTION MARKETS TABBED VIEW (Section 9) */}
      {pred && (
        <div id="markets-container" className="rounded-xl border border-[#252D3A] bg-[#10151F] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#252D3A] pb-3">
            <h4 className="text-base font-bold text-[#F5F7FA] font-mono">
              Mercados Modelados
            </h4>

            {/* Tabs */}
            <div className="flex space-x-1 font-mono text-xs">
              <button
                onClick={() => setActiveMarketTab('1x2')}
                className={`px-3 py-1 rounded transition-colors ${activeMarketTab === '1x2' ? 'bg-[#151C28] text-emerald-400 font-semibold border border-[#252D3A]' : 'text-[#8D98A8]'}`}
              >
                1X2
              </button>
              <button
                onClick={() => setActiveMarketTab('doubleChance')}
                className={`px-3 py-1 rounded transition-colors ${activeMarketTab === 'doubleChance' ? 'bg-[#151C28] text-emerald-400 font-semibold border border-[#252D3A]' : 'text-[#8D98A8]'}`}
              >
                Dupla Chance
              </button>
              <button
                onClick={() => setActiveMarketTab('goals')}
                className={`px-3 py-1 rounded transition-colors ${activeMarketTab === 'goals' ? 'bg-[#151C28] text-emerald-400 font-semibold border border-[#252D3A]' : 'text-[#8D98A8]'}`}
              >
                Mais / Menos Gols
              </button>
              <button
                onClick={() => setActiveMarketTab('btts')}
                className={`px-3 py-1 rounded transition-colors ${activeMarketTab === 'btts' ? 'bg-[#151C28] text-emerald-400 font-semibold border border-[#252D3A]' : 'text-[#8D98A8]'}`}
              >
                Ambas Marcam
              </button>
              <button
                onClick={() => setActiveMarketTab('props')}
                className={`px-3 py-1 rounded transition-colors ${activeMarketTab === 'props' ? 'bg-[#151C28] text-emerald-400 font-semibold border border-[#252D3A]' : 'text-[#8D98A8]'}`}
              >
                Escanteios & Cartões
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="font-mono text-xs pt-1">
            {activeMarketTab === '1x2' && (
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded border border-[#252D3A] bg-[#151C28] p-3 text-center">
                  <span className="text-[#8D98A8] block">Vitória {home.shortName} (1)</span>
                  <span className="text-lg font-bold text-emerald-400">{pred.probabilities.oneXTwo.home}%</span>
                </div>
                <div className="rounded border border-[#252D3A] bg-[#151C28] p-3 text-center">
                  <span className="text-[#8D98A8] block">Empate (X)</span>
                  <span className="text-lg font-bold text-zinc-300">{pred.probabilities.oneXTwo.draw}%</span>
                </div>
                <div className="rounded border border-[#252D3A] bg-[#151C28] p-3 text-center">
                  <span className="text-[#8D98A8] block">Vitória {away.shortName} (2)</span>
                  <span className="text-lg font-bold text-blue-400">{pred.probabilities.oneXTwo.away}%</span>
                </div>
              </div>
            )}

            {activeMarketTab === 'doubleChance' && (
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded border border-[#252D3A] bg-[#151C28] p-3 text-center">
                  <span className="text-[#8D98A8] block">Casa ou Empate (1X)</span>
                  <span className="text-lg font-bold text-emerald-400">{pred.probabilities.doubleChance.homeOrDraw}%</span>
                </div>
                <div className="rounded border border-[#252D3A] bg-[#151C28] p-3 text-center">
                  <span className="text-[#8D98A8] block">Empate ou Fora (X2)</span>
                  <span className="text-lg font-bold text-zinc-300">{pred.probabilities.doubleChance.drawOrAway}%</span>
                </div>
                <div className="rounded border border-[#252D3A] bg-[#151C28] p-3 text-center">
                  <span className="text-[#8D98A8] block">Casa ou Fora (12)</span>
                  <span className="text-lg font-bold text-blue-400">{pred.probabilities.doubleChance.homeOrAway}%</span>
                </div>
              </div>
            )}

            {activeMarketTab === 'goals' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded border border-[#252D3A] bg-[#151C28] p-3 text-center">
                  <span className="text-[#8D98A8] block">Mais de 1.5</span>
                  <span className="text-lg font-bold text-[#F5F7FA]">{pred.probabilities.overUnder.over15}%</span>
                  <span className="text-[10px] text-[#8D98A8] block mt-1">Menos: {pred.probabilities.overUnder.under15}%</span>
                </div>
                <div className="rounded border border-[#252D3A] bg-[#151C28] p-3 text-center">
                  <span className="text-[#8D98A8] block">Mais de 2.5</span>
                  <span className="text-lg font-bold text-emerald-400">{pred.probabilities.overUnder.over25}%</span>
                  <span className="text-[10px] text-[#8D98A8] block mt-1">Menos: {pred.probabilities.overUnder.under25}%</span>
                </div>
                <div className="rounded border border-[#252D3A] bg-[#151C28] p-3 text-center">
                  <span className="text-[#8D98A8] block">Mais de 3.5</span>
                  <span className="text-lg font-bold text-[#F5F7FA]">{pred.probabilities.overUnder.over35}%</span>
                  <span className="text-[10px] text-[#8D98A8] block mt-1">Menos: {pred.probabilities.overUnder.under35}%</span>
                </div>
                <div className="rounded border border-[#252D3A] bg-[#151C28] p-3 text-center">
                  <span className="text-[#8D98A8] block">Mais de 0.5</span>
                  <span className="text-lg font-bold text-[#F5F7FA]">{pred.probabilities.overUnder.over05}%</span>
                  <span className="text-[10px] text-[#8D98A8] block mt-1">Menos: {pred.probabilities.overUnder.under05}%</span>
                </div>
              </div>
            )}

            {activeMarketTab === 'btts' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded border border-[#252D3A] bg-[#151C28] p-3 text-center">
                  <span className="text-[#8D98A8] block">Ambas Marcam — SIM</span>
                  <span className="text-xl font-bold text-emerald-400">{pred.probabilities.bothTeamsToScore.yes}%</span>
                </div>
                <div className="rounded border border-[#252D3A] bg-[#151C28] p-3 text-center">
                  <span className="text-[#8D98A8] block">Ambas Marcam — NÃO</span>
                  <span className="text-xl font-bold text-zinc-300">{pred.probabilities.bothTeamsToScore.no}%</span>
                </div>
              </div>
            )}

            {activeMarketTab === 'props' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded border border-[#252D3A] bg-[#151C28] p-3 text-center">
                  <span className="text-[#8D98A8] block">Escanteios Esperados</span>
                  <span className="text-lg font-bold text-emerald-400">{pred.probabilities.expectedCorners?.total ?? 10.2}</span>
                  <span className="text-[10px] text-[#8D98A8] block mt-1">
                    {home.shortName}: {pred.probabilities.expectedCorners?.home ?? 5.5} | {away.shortName}: {pred.probabilities.expectedCorners?.away ?? 4.7}
                  </span>
                </div>
                <div className="rounded border border-[#252D3A] bg-[#151C28] p-3 text-center">
                  <span className="text-[#8D98A8] block">Cartões Esperados</span>
                  <span className="text-lg font-bold text-amber-400">{pred.probabilities.expectedCards?.total ?? 4.4}</span>
                  <span className="text-[10px] text-[#8D98A8] block mt-1">
                    {home.shortName}: {pred.probabilities.expectedCards?.home ?? 2.1} | {away.shortName}: {pred.probabilities.expectedCards?.away ?? 2.3}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* EXPLAINABILITY FACTORS ("Why this prediction?") (Section 28) */}
      {pred && pred.factors.length > 0 && (
        <div id="explainability-factors-section" className="rounded-xl border border-[#252D3A] bg-[#10151F] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#252D3A] pb-3">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                QUANTITATIVE EXPLAINABILITY • FACTOR WATERFALL
              </span>
              <h4 className="text-base font-bold text-[#F5F7FA] font-mono mt-0.5">
                Por que o modelo chegou a esta previsão?
              </h4>
            </div>
            <span className="text-xs font-mono text-[#8D98A8]">
              {pred.factors.length} fatores quantitativos
            </span>
          </div>

          <div className="space-y-2.5">
            {pred.factors.map((factor, idx) => {
              const isPositive = factor.direction === 'FAVORS_HOME';
              return (
                <div
                  key={idx}
                  className="rounded-lg border border-[#252D3A] bg-[#151C28] p-3.5 flex items-start justify-between gap-4 font-mono text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-[#F5F7FA]">{factor.name}</span>
                      <span className="rounded bg-[#10151F] px-1.5 py-0.5 text-[10px] text-[#8D98A8] border border-[#252D3A]">
                        {factor.category}
                      </span>
                    </div>
                    <p className="text-xs text-[#8D98A8] font-sans">{factor.description}</p>
                  </div>

                  <div className="shrink-0 text-right">
                    <span className={`text-sm font-bold ${isPositive ? 'text-emerald-400' : 'text-blue-400'}`}>
                      {isPositive ? '+' : '-'}{factor.impactPercentage}%
                    </span>
                    <span className="block text-[10px] text-[#8D98A8]">
                      {isPositive ? `Favorece ${home.shortName}` : `Favorece ${away.shortName}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI FOOTBALL ANALYST (Section 27 & 75) */}
      {pred && (
        <div id="ai-analyst-section" className="rounded-xl border border-emerald-500/30 bg-[#10151F] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#252D3A] pb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <h4 className="text-base font-bold text-[#F5F7FA] font-mono">
                AI Football Analyst
              </h4>
            </div>
            <span className="text-[11px] font-mono text-emerald-400">
              {pred.aiAnalysis.modelUsed}
            </span>
          </div>

          <p className="text-sm text-[#F5F7FA] leading-relaxed">
            {pred.aiAnalysis.summary}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Favors Home */}
            <div className="rounded-lg border border-[#252D3A] bg-[#151C28] p-4 text-xs space-y-2">
              <span className="font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                O que favorece {home.shortName}
              </span>
              <ul className="space-y-1.5 text-[#8D98A8]">
                {pred.aiAnalysis.favorsHome.map((item, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-emerald-400 font-bold">+</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Favors Away */}
            <div className="rounded-lg border border-[#252D3A] bg-[#151C28] p-4 text-xs space-y-2">
              <span className="font-mono font-bold text-blue-400 uppercase tracking-wider block">
                O que favorece {away.shortName}
              </span>
              <ul className="space-y-1.5 text-[#8D98A8]">
                {pred.aiAnalysis.favorsAway.map((item, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-blue-400 font-bold">+</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Uncertainties & What Could Change (Section 76) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-[#252D3A] bg-[#151C28] p-4 text-xs space-y-2">
              <span className="font-mono font-bold text-amber-400 uppercase tracking-wider block flex items-center">
                <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />
                Principais Incertezas & Riscos
              </span>
              <ul className="space-y-1 text-[#8D98A8]">
                {pred.aiAnalysis.mainUncertainties.map((item, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-amber-400">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-[#252D3A] bg-[#151C28] p-4 text-xs space-y-2">
              <span className="font-mono font-bold text-purple-400 uppercase tracking-wider block flex items-center">
                <HelpCircle className="mr-1.5 h-3.5 w-3.5" />
                O que pode alterar esta previsão?
              </span>
              <ul className="space-y-1 text-[#8D98A8]">
                {pred.aiAnalysis.whatCouldChange.map((item, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-purple-400">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Tactical Overview */}
          {pred.aiAnalysis.tacticalOverview && (
            <div className="rounded-lg border border-[#252D3A] bg-[#151C28] p-3 text-xs text-[#8D98A8]">
              <strong className="text-[#F5F7FA] font-mono">Encaixe Tático:</strong> {pred.aiAnalysis.tacticalOverview}
            </div>
          )}
        </div>
      )}

      {/* MATCH INTELLIGENCE: STATS & SQUAD AVAILABILITY (Section 10-15) */}
      <div id="match-intelligence-section" className="rounded-xl border border-[#252D3A] bg-[#10151F] p-6 space-y-6">
        <h4 className="text-base font-bold text-[#F5F7FA] font-mono border-b border-[#252D3A] pb-3">
          {t.matchIntelligence} & Comparativo
        </h4>

        {/* Comparison grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form & Metrics */}
          <div className="space-y-3 font-mono text-xs">
            <span className="text-xs text-[#8D98A8] uppercase font-semibold block">Forma Recente (Últimos 5 jogos)</span>
            <div className="flex items-center justify-between rounded border border-[#252D3A] bg-[#151C28] p-3">
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-[#F5F7FA] mr-2">{home.shortName}:</span>
                {home.stats.last5.map((res, i) => (
                  <span
                    key={i}
                    className={`h-5 w-5 rounded flex items-center justify-center font-bold text-[10px] ${
                      res === 'W' ? 'bg-emerald-500/20 text-emerald-400' : res === 'D' ? 'bg-zinc-700 text-zinc-300' : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {res}
                  </span>
                ))}
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-[#F5F7FA] mr-2">{away.shortName}:</span>
                {away.stats.last5.map((res, i) => (
                  <span
                    key={i}
                    className={`h-5 w-5 rounded flex items-center justify-center font-bold text-[10px] ${
                      res === 'W' ? 'bg-emerald-500/20 text-emerald-400' : res === 'D' ? 'bg-zinc-700 text-zinc-300' : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {res}
                  </span>
                ))}
              </div>
            </div>

            {/* Fatigue Index */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-[#8D98A8]">
                <span>Índice de Fadiga:</span>
                <span>
                  {home.shortName} <strong className="text-[#F5F7FA]">{home.stats.fatigueIndex}/100</strong> vs {away.shortName} <strong className="text-[#F5F7FA]">{away.stats.fatigueIndex}/100</strong>
                </span>
              </div>
              <div className="flex h-2 w-full overflow-hidden rounded bg-zinc-800">
                <div style={{ width: `${home.stats.fatigueIndex}%` }} className="bg-amber-500" />
                <div style={{ width: `${away.stats.fatigueIndex}%` }} className="bg-blue-500" />
              </div>
            </div>

            {/* Rest days */}
            <div className="flex justify-between text-xs text-[#8D98A8] pt-1">
              <span>Dias de Descanso:</span>
              <span>{home.shortName}: <strong>{home.stats.restDays} dias</strong> | {away.shortName}: <strong>{away.stats.restDays} dias</strong></span>
            </div>
          </div>

          {/* Squad Availability & Injuries (Section 13 & 14) */}
          <div className="space-y-3 font-mono text-xs">
            <span className="text-xs text-[#8D98A8] uppercase font-semibold block">Disponibilidade do Elenco</span>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded border border-[#252D3A] bg-[#151C28] p-3 text-center">
                <span className="text-[#8D98A8] block">{home.shortName}</span>
                <span className="text-xl font-bold text-emerald-400">
                  {home.lineup?.availabilityScore ?? 90}/100
                </span>
                <span className="text-[10px] text-[#8D98A8] block mt-1">
                  {home.injuries.length} desfalques relatados
                </span>
              </div>

              <div className="rounded border border-[#252D3A] bg-[#151C28] p-3 text-center">
                <span className="text-[#8D98A8] block">{away.shortName}</span>
                <span className="text-xl font-bold text-blue-400">
                  {away.lineup?.availabilityScore ?? 85}/100
                </span>
                <span className="text-[10px] text-[#8D98A8] block mt-1">
                  {away.injuries.length} desfalques relatados
                </span>
              </div>
            </div>

            {/* Listed Injuries */}
            <div className="space-y-1.5 pt-1">
              {[...home.injuries.map(i => ({ ...i, team: home.shortName })), ...away.injuries.map(i => ({ ...i, team: away.shortName }))].map((inj, idx) => (
                <div key={idx} className="flex items-center justify-between rounded bg-[#151C28] px-2.5 py-1 text-[11px]">
                  <span className="text-[#F5F7FA]">
                    <strong className="text-[#8D98A8] mr-1">[{inj.team}]</strong>
                    {inj.player} ({inj.position})
                  </span>
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                    inj.status === 'OUT' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {inj.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* HEAD TO HEAD HISTORY (Section 17) */}
      <div id="h2h-section" className="rounded-xl border border-[#252D3A] bg-[#10151F] p-6 space-y-3">
        <h4 className="text-base font-bold text-[#F5F7FA] font-mono border-b border-[#252D3A] pb-3">
          {t.headToHead}
        </h4>
        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 font-mono text-xs">
          {match.headToHead.map((h, i) => (
            <div key={i} className="rounded-lg border border-[#252D3A] bg-[#151C28] p-3">
              <div className="flex justify-between text-[#8D98A8] text-[10px]">
                <span>{h.date}</span>
                <span>{h.competition}</span>
              </div>
              <div className="mt-2 flex items-center justify-between font-bold text-[#F5F7FA]">
                <span>{h.homeTeam}</span>
                <span className="rounded bg-[#10151F] px-2 py-0.5 text-emerald-400">
                  {h.homeScore} - {h.awayScore}
                </span>
                <span>{h.awayTeam}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PREDICTION TIMELINE (Section 33) */}
      {pred && pred.timeline.length > 0 && (
        <div id="timeline-section" className="rounded-xl border border-[#252D3A] bg-[#10151F] p-6 space-y-3">
          <div className="flex items-center space-x-2 border-b border-[#252D3A] pb-3">
            <History className="h-4 w-4 text-emerald-400" />
            <h4 className="text-base font-bold text-[#F5F7FA] font-mono">
              {t.predictionTimeline} (Evolução das Probabilidades)
            </h4>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {pred.timeline.map((entry, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-[#252D3A] bg-[#151C28] p-3 gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-[#F5F7FA]">{entry.label}</span>
                    <span className="text-[10px] text-emerald-400">{entry.version}</span>
                    <span className="text-[10px] text-[#8D98A8]">({entry.timestamp})</span>
                  </div>
                  <p className="text-[11px] text-[#8D98A8] font-sans mt-0.5">{entry.triggerEvent}</p>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <span className="text-emerald-400 font-bold">{home.shortName}: {entry.homeProb}%</span>
                  <span className="text-zinc-400 font-bold">X: {entry.drawProb}%</span>
                  <span className="text-blue-400 font-bold">{away.shortName}: {entry.awayProb}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AUDITABLE DATA SOURCES (Section 30) */}
      <div id="sources-section" className="rounded-xl border border-[#252D3A] bg-[#10151F] p-6 space-y-3">
        <div className="flex items-center justify-between border-b border-[#252D3A] pb-3">
          <h4 className="text-base font-bold text-[#F5F7FA] font-mono">
            {t.sources}
          </h4>
          <span className="text-xs font-mono text-[#8D98A8]">
            Rastreabilidade e Auditoria
          </span>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2 font-mono text-xs">
          {match.sources.map((src, i) => (
            <div key={i} className="rounded-lg border border-[#252D3A] bg-[#151C28] p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#F5F7FA]">{src.name}</span>
                <span className={`rounded px-1.5 py-0.2 text-[10px] ${
                  src.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                }`}>
                  {src.status}
                </span>
              </div>
              <p className="text-[11px] text-[#8D98A8] font-sans">{src.snippet}</p>
              <div className="flex justify-between text-[10px] text-[#8D98A8] pt-1">
                <span>{src.type}</span>
                <span>{src.updatedAt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
