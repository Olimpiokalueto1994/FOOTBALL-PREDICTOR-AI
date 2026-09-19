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
      <div className="flex h-64 items-center justify-center font-mono text-xs text-slate-500 dark:text-[#8D98A8]">
        Carregando métricas de validação walk-forward...
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#10151F] p-8 text-center font-mono text-xs text-rose-500">
        Não foi possível carregar o resumo de backtest.
      </div>
    );
  }

  return (
    <div id="model-performance-view" className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-[#1E2638] pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold">
                BACKTESTING & CALIBRAÇÃO
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-[#F5F7FA] font-mono mt-0.5">
              Performance & Validação dos Modelos
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#8D98A8] mt-0.5 font-sans">
              Auditoria de previsões sob protocolo walk-forward de 500 partidas.
            </p>
          </div>

          <button
            onClick={onOpenTransparencyModal}
            className="flex items-center space-x-1.5 rounded-lg border border-slate-200 dark:border-[#1E2638] bg-white dark:bg-[#0E131F] px-3 py-1.5 text-xs font-mono text-slate-700 dark:text-[#8D98A8] hover:text-slate-900 dark:hover:text-[#F5F7FA] hover:bg-slate-50 dark:hover:bg-[#151C2C] w-fit transition-colors shadow-xs"
          >
            <ShieldCheck className="h-4 w-4 text-blue-500 dark:text-blue-400" />
            <span>Ver Metodologia & Fórmulas</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
        <div className="rounded-lg border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#10151F] p-4 shadow-xs">
          <span className="text-[11px] text-slate-500 dark:text-[#8D98A8] uppercase block">Brier Score Médio</span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">{summary.brierScore}</span>
          <span className="text-[10px] text-slate-400 dark:text-[#8D98A8] mt-0.5 block">Ideal: &lt; 0.200 (Benchmark Pro)</span>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#10151F] p-4 shadow-xs">
          <span className="text-[11px] text-slate-500 dark:text-[#8D98A8] uppercase block">Log Loss Médio</span>
          <span className="text-2xl font-bold text-slate-900 dark:text-[#F5F7FA] mt-1 block">{summary.logLoss}</span>
          <span className="text-[10px] text-slate-400 dark:text-[#8D98A8] mt-0.5 block">Entropia cruzada calibrada</span>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#10151F] p-4 shadow-xs">
          <span className="text-[11px] text-slate-500 dark:text-[#8D98A8] uppercase block">Acurácia Geral</span>
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1 block">{summary.overallAccuracy}%</span>
          <span className="text-[10px] text-slate-400 dark:text-[#8D98A8] mt-0.5 block">Base de {summary.evaluatedMatchesCount} jogos avaliados</span>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#10151F] p-4 shadow-xs">
          <span className="text-[11px] text-slate-500 dark:text-[#8D98A8] uppercase block">Status de Drift</span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block flex items-center space-x-1.5">
            <CheckCircle2 className="h-5 w-5" />
            <span>{summary.modelDriftStatus}</span>
          </span>
          <span className="text-[10px] text-slate-400 dark:text-[#8D98A8] mt-0.5 block">Sem desvio de distribuição</span>
        </div>
      </div>

      {/* Calibration Curve Section (Section 59 & 80) */}
      <div className="rounded-xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#10151F] p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#252D3A] pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-[#F5F7FA] font-mono">
              Curva de Calibração (Probabilidade Prevista vs Frequência Real Observada)
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#8D98A8] mt-0.5">
              Uma probabilidade de 70% deve se concretizar em exatamente 7 de cada 10 vezes. Platt Scaling aplicado.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
            ECE: {summary.calibrationError}%
          </span>
        </div>

        <div className="space-y-4 pt-2 font-mono text-xs">
          {summary.buckets.map((bucket, idx) => {
            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-slate-500 dark:text-[#8D98A8]">
                  <span className="font-bold text-slate-800 dark:text-[#F5F7FA]">Faixa {bucket.bucketRange}</span>
                  <span>
                    Previsto: <strong className="text-emerald-600 dark:text-emerald-400">{bucket.predictedAvg}%</strong> | Observado:{' '}
                    <strong className="text-blue-600 dark:text-blue-400">{bucket.actualFrequency}%</strong> ({bucket.sampleCount} partidas)
                  </span>
                </div>

                <div className="flex h-3 w-full overflow-hidden rounded bg-slate-100 dark:bg-[#151C28] border border-slate-200 dark:border-[#252D3A]">
                  <div style={{ width: `${bucket.actualFrequency}%` }} className="bg-emerald-500" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Breakdown by Competition & Model Ensemble Weights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* League breakdown */}
        <div className="rounded-xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#10151F] p-6 space-y-3 font-mono text-xs shadow-xs">
          <h4 className="text-sm font-bold text-slate-900 dark:text-[#F5F7FA] border-b border-slate-200 dark:border-[#252D3A] pb-2">
            Desempenho por Competição
          </h4>

          <div className="space-y-2.5">
            {summary.byLeague.map((lb, i) => (
              <div key={i} className="flex items-center justify-between rounded bg-slate-50 dark:bg-[#151C28] p-2.5 border border-slate-200 dark:border-[#252D3A]">
                <span className="font-bold text-slate-900 dark:text-[#F5F7FA]">{lb.league}</span>
                <div className="flex space-x-3 text-[11px]">
                  <span className="text-slate-500 dark:text-[#8D98A8]">{lb.matches} jogos</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Brier: {lb.brierScore}</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">Acurácia: {lb.accuracy}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ensemble Structure */}
        <div className="rounded-xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#10151F] p-6 space-y-3 font-mono text-xs shadow-xs">
          <h4 className="text-sm font-bold text-slate-900 dark:text-[#F5F7FA] border-b border-slate-200 dark:border-[#252D3A] pb-2 flex items-center">
            <Cpu className="mr-1.5 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Pesos Atuais do Ensemble
          </h4>

          <div className="space-y-2">
            <div className="rounded bg-slate-50 dark:bg-[#151C28] p-2.5 border border-slate-200 dark:border-[#252D3A] flex justify-between">
              <span className="text-slate-800 dark:text-[#F5F7FA]">Bivariate Dixon-Coles Poisson</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">35%</span>
            </div>
            <div className="rounded bg-slate-50 dark:bg-[#151C28] p-2.5 border border-slate-200 dark:border-[#252D3A] flex justify-between">
              <span className="text-slate-800 dark:text-[#F5F7FA]">Dynamic Elo (+65 Mando de Campo)</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">25%</span>
            </div>
            <div className="rounded bg-slate-50 dark:bg-[#151C28] p-2.5 border border-slate-200 dark:border-[#252D3A] flex justify-between">
              <span className="text-slate-800 dark:text-[#F5F7FA]">Regressão Logística Multi-Fatorial</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">20%</span>
            </div>
            <div className="rounded bg-slate-50 dark:bg-[#151C28] p-2.5 border border-slate-200 dark:border-[#252D3A] flex justify-between">
              <span className="text-slate-800 dark:text-[#F5F7FA]">Árvores de Decisão & Heurísticas</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">20%</span>
            </div>
          </div>

          <div className="rounded border border-slate-200 dark:border-[#252D3A] bg-slate-50/50 dark:bg-[#151C28]/50 p-3 text-[11px] text-slate-500 dark:text-[#8D98A8] font-sans">
            Calibração contínua baseada em minimização estrita da função de perda Log Loss (Brier Loss).
          </div>
        </div>
      </div>
    </div>
  );
};
