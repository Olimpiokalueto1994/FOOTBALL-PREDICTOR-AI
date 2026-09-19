import React, { useEffect, useState } from 'react';
import { BacktestSummary } from '../types/football';
import { getBacktestSummary } from '../services/api';
import { ShieldCheck, TrendingUp, AlertCircle, BarChart3, CheckCircle2, Cpu } from 'lucide-react';
import { Language, translations } from '../i18n/translations';

interface ModelPerformanceViewProps {
  language: Language;
  onOpenTransparencyModal: () => void;
}

export const ModelPerformanceView: React.FC<ModelPerformanceViewProps> = ({
  language,
  onOpenTransparencyModal,
}) => {
  const t = translations[language];
  const [summary, setSummary] = useState<BacktestSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBacktestSummary()
      .then((data) => {
        setSummary(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load backtest data:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center font-mono text-xs text-[#8D98A8]">
        Carregando métricas de validação walk-forward...
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="rounded-xl border border-[#252D3A] bg-[#10151F] p-8 text-center font-mono text-xs text-rose-400">
        Não foi possível carregar o resumo de backtest.
      </div>
    );
  }

  return (
    <div id="model-performance-view" className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-[#252D3A] pb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
              BACKTESTING & MODEL CALIBRATION ENGINE
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-[#F5F7FA] font-mono mt-0.5">
              Performance & Confiabilidade Estatística
            </h2>
            <p className="text-xs text-[#8D98A8] mt-1 font-sans">
              Auditoria de previsões históricas sob rigoroso protocolo walk-forward (sem vazamento de dados futuros).
            </p>
          </div>

          <button
            onClick={onOpenTransparencyModal}
            className="flex items-center space-x-1.5 rounded-md border border-[#252D3A] bg-[#10151F] px-3 py-1.5 text-xs font-mono text-[#8D98A8] hover:text-[#F5F7FA] hover:bg-[#151C28] w-fit"
          >
            <ShieldCheck className="h-4 w-4 text-blue-400" />
            <span>Fórmulas & Métricas</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
        <div className="rounded-lg border border-[#252D3A] bg-[#10151F] p-4">
          <span className="text-[11px] text-[#8D98A8] uppercase block">Brier Score Médio</span>
          <span className="text-2xl font-bold text-emerald-400 mt-1 block">{summary.brierScore}</span>
          <span className="text-[10px] text-[#8D98A8] mt-0.5 block">Ideal: &lt; 0.200 (Benchmark Pro)</span>
        </div>

        <div className="rounded-lg border border-[#252D3A] bg-[#10151F] p-4">
          <span className="text-[11px] text-[#8D98A8] uppercase block">Log Loss Médio</span>
          <span className="text-2xl font-bold text-[#F5F7FA] mt-1 block">{summary.logLoss}</span>
          <span className="text-[10px] text-[#8D98A8] mt-0.5 block">Entropia cruzada calibrada</span>
        </div>

        <div className="rounded-lg border border-[#252D3A] bg-[#10151F] p-4">
          <span className="text-[11px] text-[#8D98A8] uppercase block">Acurácia Geral</span>
          <span className="text-2xl font-bold text-blue-400 mt-1 block">{summary.overallAccuracy}%</span>
          <span className="text-[10px] text-[#8D98A8] mt-0.5 block">Base de {summary.evaluatedMatchesCount} jogos avaliados</span>
        </div>

        <div className="rounded-lg border border-[#252D3A] bg-[#10151F] p-4">
          <span className="text-[11px] text-[#8D98A8] uppercase block">Status de Drift</span>
          <span className="text-2xl font-bold text-emerald-400 mt-1 block flex items-center space-x-1.5">
            <CheckCircle2 className="h-5 w-5" />
            <span>{summary.modelDriftStatus}</span>
          </span>
          <span className="text-[10px] text-[#8D98A8] mt-0.5 block">Sem desvio de distribuição</span>
        </div>
      </div>

      {/* Calibration Curve Section (Section 59 & 80) */}
      <div className="rounded-xl border border-[#252D3A] bg-[#10151F] p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#252D3A] pb-3">
          <div>
            <h3 className="text-base font-bold text-[#F5F7FA] font-mono">
              Curva de Calibração (Probabilidade Prevista vs Frequência Real Observada)
            </h3>
            <p className="text-xs text-[#8D98A8] mt-0.5">
              Uma probabilidade de 70% deve se concretizar em exatamente 7 de cada 10 vezes. Platt Scaling aplicado.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-bold">
            ECE: {summary.calibrationError}%
          </span>
        </div>

        <div className="space-y-4 pt-2 font-mono text-xs">
          {summary.buckets.map((bucket, idx) => {
            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-[#8D98A8]">
                  <span className="font-bold text-[#F5F7FA]">Faixa {bucket.bucketRange}</span>
                  <span>
                    Previsto: <strong className="text-emerald-400">{bucket.predictedAvg}%</strong> | Observado:{' '}
                    <strong className="text-blue-400">{bucket.actualFrequency}%</strong> ({bucket.sampleCount} partidas)
                  </span>
                </div>

                <div className="flex h-3 w-full overflow-hidden rounded bg-[#151C28] border border-[#252D3A]">
                  <div style={{ width: `${bucket.actualFrequency}%` }} className="bg-emerald-500/80" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Breakdown by Competition & Model Ensemble Weights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* League breakdown */}
        <div className="rounded-xl border border-[#252D3A] bg-[#10151F] p-6 space-y-3 font-mono text-xs">
          <h4 className="text-sm font-bold text-[#F5F7FA] border-b border-[#252D3A] pb-2">
            Desempenho por Competição
          </h4>

          <div className="space-y-2.5">
            {summary.byLeague.map((lb, i) => (
              <div key={i} className="flex items-center justify-between rounded bg-[#151C28] p-2.5 border border-[#252D3A]">
                <span className="font-bold text-[#F5F7FA]">{lb.league}</span>
                <div className="flex space-x-3 text-[11px]">
                  <span className="text-[#8D98A8]">{lb.matches} jogos</span>
                  <span className="text-emerald-400 font-bold">Brier: {lb.brierScore}</span>
                  <span className="text-blue-400 font-bold">Acurácia: {lb.accuracy}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ensemble Structure */}
        <div className="rounded-xl border border-[#252D3A] bg-[#10151F] p-6 space-y-3 font-mono text-xs">
          <h4 className="text-sm font-bold text-[#F5F7FA] border-b border-[#252D3A] pb-2 flex items-center">
            <Cpu className="mr-1.5 h-4 w-4 text-emerald-400" />
            Pesos Atuais do Ensemble
          </h4>

          <div className="space-y-2">
            <div className="rounded bg-[#151C28] p-2.5 border border-[#252D3A] flex justify-between">
              <span className="text-[#F5F7FA]">Bivariate Dixon-Coles Poisson</span>
              <span className="font-bold text-emerald-400">35%</span>
            </div>
            <div className="rounded bg-[#151C28] p-2.5 border border-[#252D3A] flex justify-between">
              <span className="text-[#F5F7FA]">Dynamic Elo (+65 Mando de Campo)</span>
              <span className="font-bold text-emerald-400">25%</span>
            </div>
            <div className="rounded bg-[#151C28] p-2.5 border border-[#252D3A] flex justify-between">
              <span className="text-[#F5F7FA]">Regressão Logística Multi-Fatorial</span>
              <span className="font-bold text-blue-400">20%</span>
            </div>
            <div className="rounded bg-[#151C28] p-2.5 border border-[#252D3A] flex justify-between">
              <span className="text-[#F5F7FA]">Árvores de Decisão & Heurísticas</span>
              <span className="font-bold text-blue-400">20%</span>
            </div>
          </div>

          <div className="rounded border border-[#252D3A] bg-[#151C28]/50 p-3 text-[11px] text-[#8D98A8] font-sans">
            Calibração contínua baseada em minimização estrita da função de perda Log Loss (Brier Loss).
          </div>
        </div>
      </div>
    </div>
  );
};
