import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Sparkles, 
  HelpCircle, 
  ExternalLink, 
  ArrowRight, 
  RefreshCw, 
  Sliders, 
  Percent, 
  DollarSign, 
  ShieldAlert, 
  ShieldCheck,
  Globe2,
  Info
} from 'lucide-react';
import { Match, BetValidationResult, BetMarketType, CurrencyCode } from '../types/football';
import { validateBet, saveBet } from '../services/api';
import { Language } from '../i18n/translations';
import { formatMoney, CURRENCIES } from '../utils/currency';

interface CustomBetValidatorProps {
  matches: Match[];
  language?: Language;
  initialMatch?: Match | null;
  onSelectMatch?: (matchId: string) => void;
  currency?: CurrencyCode;
  onNavigateToHistory?: () => void;
}

export const CustomBetValidator: React.FC<CustomBetValidatorProps> = ({
  matches,
  language = 'pt',
  initialMatch = null,
  onSelectMatch,
  currency = 'AOA',
  onNavigateToHistory,
}) => {
  // Form State
  const [matchQuery, setMatchQuery] = useState<string>(
    initialMatch ? `${initialMatch.homeTeam.name} vs ${initialMatch.awayTeam.name}` : ''
  );
  const [selectedMarket, setSelectedMarket] = useState<BetMarketType>('HOME');
  const [customMarketLabel, setCustomMarketLabel] = useState<string>('');
  const [offeredOdd, setOfferedOdd] = useState<string>('1.85');
  const [stake, setStake] = useState<string>('5000');
  const [manualProbOverride, setManualProbOverride] = useState<number | null>(null);

  // Status & Results
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [savedBetSuccess, setSavedBetSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<BetValidationResult | null>(null);
  const [showFormulas, setShowFormulas] = useState<boolean>(false);

  // Quick preset suggestions for arbitrary/out-of-database matches
  const quickSuggestions = [
    'Petro de Luanda vs 1º de Agosto',
    'Sagrada Esperança vs Recreativo do Libolo',
    'Flamengo vs Palmeiras',
    'Real Madrid vs Barcelona',
    'Sporting vs Benfica',
    'Boca Juniors vs River Plate',
  ];

  // Quick market options
  const marketOptions: { value: BetMarketType; label: string; desc: string }[] = [
    { value: 'HOME', label: 'Vitória Mandante (1)', desc: 'Triunfo da equipe que joga em casa' },
    { value: 'DRAW', label: 'Empate (X)', desc: 'Igualdade no placar ao término do tempo normal' },
    { value: 'AWAY', label: 'Vitória Visitante (2)', desc: 'Triunfo da equipe visitante' },
    { value: 'OVER_25', label: 'Mais de 2.5 Gols', desc: 'Total da partida somando 3 ou mais gols' },
    { value: 'UNDER_25', label: 'Menos de 2.5 Gols', desc: 'Total da partida somando 2 ou menos gols' },
    { value: 'BTTS_YES', label: 'Ambas Marcam: Sim', desc: 'Ambos os times marcam ao menos 1 gol' },
    { value: 'BTTS_NO', label: 'Ambas Marcam: Não', desc: 'Ao menos um time não marca gol (Clean sheet)' },
    { value: 'DOUBLE_1X', label: 'Dupla Chance (1X)', desc: 'Vitória do Mandante ou Empate' },
    { value: 'DOUBLE_X2', label: 'Dupla Chance (X2)', desc: 'Empate ou Vitória do Visitante' },
    { value: 'DOUBLE_12', label: 'Dupla Chance (12)', desc: 'Vitória de qualquer um dos dois times' },
    { value: 'CUSTOM', label: 'Mercado Personalizado', desc: 'Outro mercado específico com probabilidade definida' },
  ];

  // Run validation
  const handleValidate = async (e?: React.FormEvent, probOverride?: number) => {
    if (e) e.preventDefault();

    const query = matchQuery.trim();
    if (!query) {
      setError('Por favor, informe o nome da partida ou confronto (ex: Petro de Luanda vs 1º de Agosto).');
      return;
    }

    const oddNum = parseFloat(offeredOdd.replace(',', '.'));
    if (isNaN(oddNum) || oddNum <= 1.0) {
      setError('A odd oferecida pela casa de apostas deve ser maior que 1.00 (ex: 1.85).');
      return;
    }

    const stakeNum = parseFloat(stake.replace(',', '.')) || 100;

    setLoading(true);
    setError(null);

    try {
      setSavedBetSuccess(null);
      const res = await validateBet({
        matchQuery: query,
        market: selectedMarket,
        marketLabel: selectedMarket === 'CUSTOM' ? customMarketLabel : undefined,
        offeredOdd: oddNum,
        stake: stakeNum,
        manualProbability: typeof probOverride === 'number' ? probOverride : (manualProbOverride ?? undefined),
      });

      setValidationResult(res);
    } catch (err: any) {
      console.error('Erro ao validar aposta:', err);
      setError(err.message || 'Falha ao processar simulação da aposta.');
    } finally {
      setLoading(false);
    }
  };

  // Save bet into SQLite persistent bankroll
  const handleSaveBet = async () => {
    if (!validationResult) return;
    try {
      setSaving(true);
      const matchId = (validationResult.identifiedMatch as any).id || (initialMatch ? initialMatch.id : `custom-${Date.now()}`);
      const res = await saveBet({
        match_id: matchId,
        match_title: `${validationResult.identifiedMatch.homeTeam} vs ${validationResult.identifiedMatch.awayTeam}`,
        competition: validationResult.identifiedMatch.competition || 'Competição Oficial',
        market_chosen: validationResult.market.key,
        market_label: validationResult.market.label,
        odd: validationResult.offeredOdd,
        stake: validationResult.stake,
        currency: currency,
        predicted_prob: validationResult.estimatedProbability,
        fair_odd: validationResult.fairOdd,
        ev_value: validationResult.expectedValuePercentage,
      });
      setSavedBetSuccess(res.bet.id);
    } catch (err: any) {
      console.error('Erro ao salvar aposta no SQLite:', err);
      setError(err.message || 'Falha ao persistir aposta no banco de dados SQLite.');
    } finally {
      setSaving(false);
    }
  };

  // When initialMatch changes or is provided
  useEffect(() => {
    if (initialMatch) {
      setMatchQuery(`${initialMatch.homeTeam.name} vs ${initialMatch.awayTeam.name}`);
    }
  }, [initialMatch]);

  // If user adjusts manual probability slider on existing result
  const handleProbSliderChange = (newProb: number) => {
    setManualProbOverride(newProb);
    handleValidate(undefined, newProb);
  };

  const handleResetManualProb = () => {
    setManualProbOverride(null);
    handleValidate(undefined, undefined);
  };

  return (
    <div id="custom-bet-validator-view" className="space-y-8 pb-16">
      {/* Top Banner & Context */}
      <div className="rounded-2xl border border-slate-200 dark:border-[#1E2638] bg-white dark:bg-[#0B101B] p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
              <Calculator className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Validador de Apostas & Valor Esperado (+EV)
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Matemática EV+
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
                Insira <strong>qualquer partida do mundo</strong> (da lista ou avulsa pesquisada na web) e a odd oferecida pela casa. 
                O sistema calcula matematicamente se a aposta possui <strong>vantagem real (Valor Esperado Positivo)</strong> ou se a casa está cobrando margem excessiva.
              </p>
            </div>
          </div>

          {/* Preset Pill Actions */}
          <button
            type="button"
            onClick={() => setShowFormulas(!showFormulas)}
            className="inline-flex items-center space-x-1.5 self-start md:self-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <HelpCircle className="h-3.5 w-3.5 text-blue-500" />
            <span>{showFormulas ? 'Ocultar Fórmulas' : 'Entender Fórmulas Matemáticas'}</span>
          </button>
        </div>

        {/* Mathematical Formulas Transparency Drawer */}
        {showFormulas && (
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-[#1E2638] grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#121826] border border-slate-200/80 dark:border-slate-800">
              <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                1. Probabilidade Implícita da Casa
              </span>
              <code className="text-[11px] font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded">
                P_implícita = (1 / Odd) × 100%
              </code>
              <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                A porcentagem de vitórias que a casa de apostas exige para que você não tenha prejuízo no longo prazo.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#121826] border border-slate-200/80 dark:border-slate-800">
              <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                2. Valor Esperado Unitário (EV)
              </span>
              <code className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                EV = (P_real × (Odd - 1)) - (1 - P_real)
              </code>
              <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                Se <strong>EV &gt; 0</strong>, a aposta tem lucro matemático esperado. Se <strong>EV ≤ 0</strong>, a desvantagem é da casa.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#121826] border border-slate-200/80 dark:border-slate-800">
              <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                3. Odd Mínima Justa (Break-even)
              </span>
              <code className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded">
                Odd_Justa = 1 / P_real
              </code>
              <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                Cotação de equilíbrio exata. A odd oferecida pela casa precisa ser estritamente superior a esse valor.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Input Form */}
      <div className="rounded-2xl border border-slate-200 dark:border-[#1E2638] bg-white dark:bg-[#0B101B] p-6 shadow-xs">
        <form onSubmit={handleValidate} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Campo 1: Partida / Confronto */}
            <div className="lg:col-span-6 space-y-1.5">
              <label htmlFor="match-query-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                1. Partida ou Confronto <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="match-query-input"
                  type="text"
                  value={matchQuery}
                  onChange={(e) => setMatchQuery(e.target.value)}
                  placeholder="Ex: Petro de Luanda vs 1º de Agosto ou escolha da lista"
                  className="w-full rounded-xl border border-slate-300 dark:border-[#222D42] bg-slate-50 dark:bg-[#101623] px-4 py-2.5 pl-10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                />
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              </div>

              {/* Quick Preset Badges */}
              <div className="pt-1.5">
                <div className="flex items-center space-x-1 text-[11px] text-slate-500 dark:text-slate-400 mb-1.5">
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  <span>Exemplos de jogos fora da lista (pesquisa web automática):</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {quickSuggestions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setMatchQuery(item)}
                      className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Partidas de Hoje Rápidas */}
              {matches && matches.length > 0 && (
                <div className="pt-2">
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 block mb-1">
                    Ou selecione um jogo do catálogo de hoje:
                  </span>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        const m = matches.find((x) => x.id === e.target.value);
                        if (m) setMatchQuery(`${m.homeTeam.name} vs ${m.awayTeam.name}`);
                      }
                    }}
                    className="w-full rounded-lg border border-slate-200 dark:border-[#1E2638] bg-white dark:bg-[#0D1322] px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      -- Selecionar partida de hoje ({matches.length} disponíveis) --
                    </option>
                    {matches.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.competition}: {m.homeTeam.shortName} vs {m.awayTeam.shortName}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Campo 2: Mercado / Escolha */}
            <div className="lg:col-span-3 space-y-1.5">
              <label htmlFor="market-select" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                2. Mercado / Escolha <span className="text-rose-500">*</span>
              </label>
              <select
                id="market-select"
                value={selectedMarket}
                onChange={(e) => setSelectedMarket(e.target.value as BetMarketType)}
                className="w-full rounded-xl border border-slate-300 dark:border-[#222D42] bg-slate-50 dark:bg-[#101623] px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              >
                {marketOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {selectedMarket === 'CUSTOM' && (
                <div className="mt-2">
                  <input
                    type="text"
                    value={customMarketLabel}
                    onChange={(e) => setCustomMarketLabel(e.target.value)}
                    placeholder="Nome do mercado (ex: Escanteios Over 9.5)"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400"
                  />
                </div>
              )}

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {marketOptions.find((o) => o.value === selectedMarket)?.desc}
              </p>
            </div>

            {/* Campo 3: Odd Oferecida pela Casa */}
            <div className="lg:col-span-3 space-y-1.5">
              <label htmlFor="odd-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                3. Odd da Casa de Apostas <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="odd-input"
                  type="text"
                  inputMode="decimal"
                  value={offeredOdd}
                  onChange={(e) => setOfferedOdd(e.target.value)}
                  placeholder="Ex: 1.85"
                  className="w-full rounded-xl border border-slate-300 dark:border-[#222D42] bg-slate-50 dark:bg-[#101623] px-4 py-2.5 pl-9 text-base font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                />
                <Percent className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              </div>

              {/* Stake Opcional para cálculo de ganhos com Moeda */}
              <div className="pt-2 flex items-center space-x-2">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
                  Valor Aposta ({CURRENCIES[currency]?.symbol || 'Kz'}):
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={stake}
                  onChange={(e) => setStake(e.target.value)}
                  placeholder="5000"
                  className="w-28 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 py-1 text-xs font-mono font-bold text-slate-800 dark:text-slate-200"
                />
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  {currency}
                </span>
              </div>
            </div>
          </div>

          {/* Submit Button & Error */}
          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400 flex items-center space-x-2">
              <XCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#1A2233]">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
              <Globe2 className="h-3.5 w-3.5 text-blue-500 shrink-0" />
              <span>
                Jogos não catalogados são apurados em tempo real na web via <strong>Gemini Search Grounding</strong>.
              </span>
            </div>

            <button
              id="validate-bet-button"
              type="submit"
              disabled={loading}
              className="inline-flex items-center space-x-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-6 py-2.5 font-semibold text-sm shadow-sm hover:shadow transition-all"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Apurando & Calculando EV...</span>
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4" />
                  <span>Calcular Decisão Matemática</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Decision Card & Results Display */}
      {validationResult && (
        <div id="bet-validation-result-container" className="space-y-6">
          {/* 1. Main Decision Verdict Banner (VERDE para EV > 0, VERMELHO para EV <= 0) */}
          <div
            id="bet-verdict-card"
            className={`rounded-2xl border p-6 transition-all shadow-sm ${
              validationResult.isPositiveEV
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100'
                : 'border-rose-500/40 bg-rose-500/10 text-rose-900 dark:text-rose-100'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex items-start space-x-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${
                    validationResult.isPositiveEV
                      ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
                      : 'border-rose-500/40 bg-rose-500/20 text-rose-600 dark:text-rose-300'
                  }`}
                >
                  {validationResult.isPositiveEV ? (
                    <CheckCircle2 className="h-7 w-7" />
                  ) : (
                    <XCircle className="h-7 w-7" />
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold tracking-wider uppercase border ${
                        validationResult.isPositiveEV
                          ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                          : 'border-rose-500/40 bg-rose-500/20 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      {validationResult.verdictTitle}
                    </span>

                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      {validationResult.identifiedMatch.competition} • {validationResult.identifiedMatch.homeTeam} vs {validationResult.identifiedMatch.awayTeam}
                    </span>

                    {validationResult.identifiedMatch.isLiveSearched && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-500/20">
                        <Globe2 className="h-3 w-3" />
                        <span>Apurado na Web ao Vivo</span>
                      </span>
                    )}
                  </div>

                  {/* Veredicto Visual Claro e Explicação Exata */}
                  <div className="mt-3 text-sm md:text-base font-medium leading-relaxed">
                    <p>{validationResult.explanation}</p>
                  </div>

                  {/* Summary Badges */}
                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-mono">
                    <span className="px-2.5 py-1 rounded-lg bg-white/70 dark:bg-black/30 border border-black/5 dark:border-white/10">
                      Mercado: <strong>{validationResult.market.label}</strong>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-white/70 dark:bg-black/30 border border-black/5 dark:border-white/10">
                      Odd Oferecida: <strong>{validationResult.offeredOdd.toFixed(2)}</strong>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-white/70 dark:bg-black/30 border border-black/5 dark:border-white/10">
                      Odd Mínima Justa: <strong>{validationResult.fairOdd.toFixed(2)}</strong>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-white/70 dark:bg-black/30 border border-black/5 dark:border-white/10">
                      Valor Esperado (EV):{' '}
                      <strong className={validationResult.isPositiveEV ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                        {validationResult.expectedValuePercentage > 0 ? '+' : ''}
                        {validationResult.expectedValuePercentage.toFixed(1)}%
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Edge Metric Highlight */}
              <div
                className={`rounded-xl border p-4 text-center shrink-0 min-w-[150px] ${
                  validationResult.isPositiveEV
                    ? 'border-emerald-500/30 bg-emerald-500/10'
                    : 'border-rose-500/30 bg-rose-500/10'
                }`}
              >
                <span className="text-[11px] uppercase tracking-wider font-semibold opacity-80 block">
                  Vantagem Matemática
                </span>
                <span className="text-2xl font-black mt-0.5 block">
                  {validationResult.edgePercentage > 0 ? '+' : ''}
                  {validationResult.edgePercentage.toFixed(1)}%
                </span>
                <span className="text-[10px] opacity-75 mt-1 block">
                  {validationResult.isPositiveEV ? 'Favorável ao Apostador' : 'Margem da Casa'}
                </span>
              </div>
            </div>

            {/* Persistent Bankroll Action Bar */}
            <div className="mt-5 pt-4 border-t border-black/10 dark:border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-xs">
                {savedBetSuccess ? (
                  <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-300 font-semibold">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Aposta persistida no SQLite com status PENDENTE! Pronta para auditoria pós-jogo.</span>
                  </div>
                ) : (
                  <span className="opacity-80">
                    Deseja acompanhar esta entrada no histórico e auditar o resultado após o término?
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                {savedBetSuccess ? (
                  onNavigateToHistory && (
                    <button
                      type="button"
                      onClick={onNavigateToHistory}
                      className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-all"
                    >
                      <span>Ver no Histórico & Auditoria</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )
                ) : (
                  <button
                    id="btn-save-bet-to-bankroll"
                    type="button"
                    onClick={handleSaveBet}
                    disabled={saving}
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-xs font-bold shadow-sm transition-all disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Gravando no SQLite...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Salvar Aposta na Banca ({formatMoney(validationResult.stake, currency)})</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 2. Decomposição das Métricas Matemáticas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Probabilidade Implícita da Casa */}
            <div className="rounded-2xl border border-slate-200 dark:border-[#1E2638] bg-white dark:bg-[#0B101B] p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span>Probabilidade Implícita</span>
                <Percent className="h-3.5 w-3.5 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {validationResult.impliedProbability.toFixed(1)}%
              </div>
              <p className="mt-1 text-[11px] text-slate-400 font-mono">
                (1 / {validationResult.offeredOdd.toFixed(2)}) × 100
              </p>
              <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                Exigida pela cotação da casa para empate no zero a zero.
              </div>
            </div>

            {/* Card 2: Probabilidade Real Estimada */}
            <div className="rounded-2xl border border-slate-200 dark:border-[#1E2638] bg-white dark:bg-[#0B101B] p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span>Probabilidade Real Estimada</span>
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {validationResult.estimatedProbability.toFixed(1)}%
              </div>
              <p className="mt-1 text-[11px] text-slate-400 font-mono">
                Poisson/Ensemble ou Gemini Web
              </p>
              <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                Probabilidade verdadeira calculada do evento ocorrer.
              </div>
            </div>

            {/* Card 3: Cotação de Equilíbrio (Break-Even Odd) */}
            <div className="rounded-2xl border border-slate-200 dark:border-[#1E2638] bg-white dark:bg-[#0B101B] p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span>Odd Mínima Justa</span>
                <Calculator className="h-3.5 w-3.5 text-indigo-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {validationResult.fairOdd.toFixed(2)}
              </div>
              <p className="mt-1 text-[11px] text-slate-400 font-mono">
                1 / {(validationResult.estimatedProbability / 100).toFixed(3)}
              </p>
              <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                Ponto de corte neutro. Acima disso há valor positivo.
              </div>
            </div>

            {/* Card 4: Retorno com a Stake Informada */}
            <div className="rounded-2xl border border-slate-200 dark:border-[#1E2638] bg-white dark:bg-[#0B101B] p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span>Simulação da Stake ({formatMoney(validationResult.stake, currency)})</span>
                <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
                {formatMoney(validationResult.potentialReturn, currency)}
              </div>
              <p className="mt-1 text-[11px] text-slate-400 font-mono">
                Retorno Bruto se bater
              </p>
              <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                Lucro esperado ponderado:{' '}
                <strong className={validationResult.expectedProfit > 0 ? 'text-emerald-500' : 'text-rose-500'}>
                  {formatMoney(validationResult.expectedProfit, currency, true)}
                </strong>
              </div>
            </div>
          </div>

          {/* 3. Comparação Gráfica: Implícita vs Real */}
          <div className="rounded-2xl border border-slate-200 dark:border-[#1E2638] bg-white dark:bg-[#0B101B] p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Confronto de Probabilidades: Casa de Apostas vs Modelo Matemático
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Compare visualmente a probabilidade embutida na cotação com a estimativa do modelo
                </p>
              </div>

              {/* Botão de Ajuste Fino */}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">Simulação Rápida:</span>
                {manualProbOverride !== null && (
                  <button
                    type="button"
                    onClick={handleResetManualProb}
                    className="text-[11px] text-blue-600 dark:text-blue-400 underline hover:no-underline"
                  >
                    Restaurar original
                  </button>
                )}
              </div>
            </div>

            {/* Visual Bars */}
            <div className="space-y-3 pt-2">
              {/* Barra da Casa */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-600 dark:text-slate-300">
                    Probabilidade Implícita da Casa (Odd {validationResult.offeredOdd.toFixed(2)})
                  </span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
                    {validationResult.impliedProbability.toFixed(1)}%
                  </span>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-slate-400 dark:bg-slate-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, validationResult.impliedProbability)}%` }}
                  />
                </div>
              </div>

              {/* Barra do Modelo Real */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-blue-600 dark:text-blue-400 flex items-center space-x-1">
                    <span>Probabilidade Real Estimada do Modelo</span>
                    {manualProbOverride !== null && (
                      <span className="text-[10px] text-amber-500 font-semibold">(Ajustado)</span>
                    )}
                  </span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                    {validationResult.estimatedProbability.toFixed(1)}%
                  </span>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      validationResult.isPositiveEV
                        ? 'bg-emerald-500 dark:bg-emerald-400'
                        : 'bg-rose-500 dark:bg-rose-400'
                    }`}
                    style={{ width: `${Math.min(100, validationResult.estimatedProbability)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Slider interativo para testar diferentes cenários instantaneamente */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-[#1A2233] bg-slate-50 dark:bg-[#0E1524] rounded-xl p-4">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                  <Sliders className="h-3.5 w-3.5 text-blue-500" />
                  <span>Simular variação da probabilidade estimada:</span>
                </span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                  {validationResult.estimatedProbability.toFixed(1)}%
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="95"
                step="0.5"
                value={validationResult.estimatedProbability}
                onChange={(e) => handleProbSliderChange(parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>5% (Zebra Improvável)</span>
                <span>50% (Equilíbrio)</span>
                <span>95% (Favorito Absoluto)</span>
              </div>
            </div>
          </div>

          {/* 4. Contexto da Partida Identificada & Notícias de Campo */}
          {validationResult.modelContext && (
            <div className="rounded-2xl border border-slate-200 dark:border-[#1E2638] bg-white dark:bg-[#0B101B] p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center space-x-2">
                <Info className="h-4 w-4 text-blue-500" />
                <span>Dados de Inteligência do Confronto Identificado</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* 1X2 Probabilities */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#111726] border border-slate-200/60 dark:border-slate-800/80">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                    Distribuição 1X2 do Confronto
                  </span>
                  <div className="space-y-1.5 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Vitória {validationResult.identifiedMatch.homeTeam}:</span>
                      <strong className="text-slate-800 dark:text-slate-200">
                        {validationResult.modelContext.probabilities1X2.home}%
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Empate (X):</span>
                      <strong className="text-slate-800 dark:text-slate-200">
                        {validationResult.modelContext.probabilities1X2.draw}%
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Vitória {validationResult.identifiedMatch.awayTeam}:</span>
                      <strong className="text-slate-800 dark:text-slate-200">
                        {validationResult.modelContext.probabilities1X2.away}%
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Gols e Mercados Secundários */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#111726] border border-slate-200/60 dark:border-slate-800/80">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                    Projeção de Gols & BTTS
                  </span>
                  <div className="space-y-1.5 font-mono text-[11px]">
                    {validationResult.modelContext.overUnder25 && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Mais de 2.5 Gols:</span>
                        <strong className="text-slate-800 dark:text-slate-200">
                          {validationResult.modelContext.overUnder25.over}%
                        </strong>
                      </div>
                    )}
                    {validationResult.modelContext.btts && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Ambas Marcam (Sim):</span>
                        <strong className="text-slate-800 dark:text-slate-200">
                          {validationResult.modelContext.btts.yes}%
                        </strong>
                      </div>
                    )}
                    {validationResult.modelContext.expectedGoals && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">xG Total Esperado:</span>
                        <strong className="text-slate-800 dark:text-slate-200">
                          {validationResult.modelContext.expectedGoals.total} gols
                        </strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notícias / Desfalques */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#111726] border border-slate-200/60 dark:border-slate-800/80">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                    Fatores e Informações Recentes
                  </span>
                  {validationResult.modelContext.breakingNews && validationResult.modelContext.breakingNews.length > 0 ? (
                    <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                      {validationResult.modelContext.breakingNews.slice(0, 3).map((item, idx) => (
                        <li key={idx} className="flex items-start space-x-1.5">
                          <span className="text-blue-500">•</span>
                          <span className="line-clamp-2">{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[11px] text-slate-400">
                      Previsão calculada com base nos modelos estatísticos walk-forward e ratings Elo.
                    </p>
                  )}
                </div>
              </div>

              {/* Fontes auditáveis se houver busca na web */}
              {validationResult.sources && validationResult.sources.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1E2638]">
                  <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">
                    Fontes Auditadas na Web:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {validationResult.sources.map((src, i) => (
                      <a
                        key={i}
                        href={src.uri}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900"
                      >
                        <span>{src.title || 'Fonte de Notícia Esportiva'}</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
