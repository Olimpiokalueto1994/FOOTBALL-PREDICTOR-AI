import React, { useState, useEffect } from 'react';
import { Match, TrackedBet, BetSummaryStats, CurrencyCode } from '../types/football';
import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  AlertCircle, 
  Trash2, 
  Play, 
  Clock, 
  Coins, 
  Percent, 
  Layers, 
  ShieldCheck, 
  ExternalLink,
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import { Language } from '../i18n/translations';
import { getBets, settleBets, deleteBet } from '../services/api';
import { formatMoney, CURRENCIES } from '../utils/currency';

interface PredictionHistoryViewProps {
  matches: Match[];
  onSelectMatch: (id: string) => void;
  language: Language;
  currency?: CurrencyCode;
  onNavigateToValidator?: () => void;
}

export const PredictionHistoryView: React.FC<PredictionHistoryViewProps> = ({
  matches,
  onSelectMatch,
  language,
  currency = 'AOA',
  onNavigateToValidator,
}) => {
  const [bets, setBets] = useState<TrackedBet[]>([]);
  const [summary, setSummary] = useState<BetSummaryStats>({
    totalBets: 0,
    settledBets: 0,
    pendingBets: 0,
    wonBets: 0,
    lostBets: 0,
    voidBets: 0,
    totalStaked: 0,
    totalProfitLoss: 0,
    roi: 0,
    winRate: 0,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [settling, setSettling] = useState<boolean>(false);
  const [settleMessage, setSettleMessage] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'WON' | 'LOST' | 'VOID'>('ALL');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch persisted bets on load
  const loadBetsData = async () => {
    try {
      setLoading(true);
      const data = await getBets();
      setBets(data.bets || []);
      setSummary(data.summary);
    } catch (err) {
      console.error('Erro ao carregar apostas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBetsData();
  }, []);

  // Run the settlement engine (Auditar e Liquidar)
  const handleSettleAll = async () => {
    try {
      setSettling(true);
      setSettleMessage(null);
      const res = await settleBets();
      await loadBetsData();
      if (res.settledCount > 0) {
        setSettleMessage(`Auditoria concluída com sucesso! ${res.settledCount} aposta(s) liquidada(s) com base nos placares reais.`);
      } else {
        setSettleMessage('Auditoria executada: nenhuma aposta pendente apta para liquidação no momento.');
      }
    } catch (err: any) {
      console.error('Erro ao auditar apostas:', err);
      setSettleMessage('Falha ao comunicar com o motor de liquidação pós-jogo.');
    } finally {
      setSettling(false);
    }
  };

  // Settle a single specific bet
  const handleSettleSingle = async (betId: string) => {
    try {
      setSettling(true);
      await settleBets(betId);
      await loadBetsData();
      setSettleMessage(`Aposta ${betId} auditada e atualizada com sucesso.`);
    } catch (err) {
      console.error('Erro ao liquidar aposta individual:', err);
    } finally {
      setSettling(false);
    }
  };

  // Delete a bet
  const handleDeleteBet = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Tem certeza de que deseja remover esta aposta do histórico?')) return;
    try {
      setDeletingId(id);
      const res = await deleteBet(id);
      if (res.success) {
        setBets(prev => prev.filter(b => b.id !== id));
        setSummary(res.summary);
      }
    } catch (err) {
      console.error('Erro ao excluir aposta:', err);
    } finally {
      setDeletingId(null);
    }
  };

  // Filtered bets list
  const filteredBets = bets.filter((b) => {
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const query = filterQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      b.match_title.toLowerCase().includes(query) ||
      b.competition.toLowerCase().includes(query) ||
      b.market_label.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  return (
    <div id="prediction-history-view" className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-[#1E2638] pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold font-mono">
              AUDITORIA PÓS-JOGO • BANCA REAL (SQLITE)
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-mono">
              Persistência Ativa
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
            Auditoria & Gestão de Banca
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Acompanhe o desempenho quantitativo de todas as entradas validadas. Os resultados são auditados 
            confrontando o mercado escolhido com o placar final oficial das partidas.
          </p>
        </div>

        {/* Global Action: Auditar e Liquidar */}
        <div className="flex items-center space-x-3 shrink-0">
          <button
            id="btn-settle-all-bets"
            onClick={handleSettleAll}
            disabled={settling}
            className="inline-flex items-center space-x-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 py-2.5 font-semibold text-xs shadow-sm hover:shadow transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${settling ? 'animate-spin' : ''}`} />
            <span>{settling ? 'Auditando Resultados...' : 'Auditar e Liquidar Apostas'}</span>
          </button>

          {onNavigateToValidator && (
            <button
              onClick={onNavigateToValidator}
              className="inline-flex items-center space-x-1.5 rounded-xl border border-slate-300 dark:border-[#252D3A] bg-white dark:bg-[#10151F] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#151C28] px-3.5 py-2.5 font-semibold text-xs shadow-2xs transition-all"
            >
              <PlusCircle className="h-3.5 w-3.5 text-blue-500" />
              <span>Nova Aposta</span>
            </button>
          )}
        </div>
      </div>

      {/* Settle feedback notification */}
      {settleMessage && (
        <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3.5 text-xs text-blue-800 dark:text-blue-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-blue-500 shrink-0" />
            <span>{settleMessage}</span>
          </div>
          <button 
            onClick={() => setSettleMessage(null)}
            className="text-[10px] text-blue-600 dark:text-blue-400 underline ml-3"
          >
            Fechar
          </button>
        </div>
      )}

      {/* 4 Indicadores Globais de Desempenho da Banca */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Apostado (Stake Acumulado) */}
        <div className="rounded-2xl border border-slate-200 dark:border-[#1E2638] bg-white dark:bg-[#0B101B] p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-medium">Total Apostado (Stake)</span>
            <Coins className="h-3.5 w-3.5 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {formatMoney(summary.totalStaked, currency)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>Volume em circulação</span>
            <span className="font-mono">{summary.totalBets} aposta(s)</span>
          </div>
        </div>

        {/* Card 2: Lucro / Prejuízo Líquido (P&L) */}
        <div className="rounded-2xl border border-slate-200 dark:border-[#1E2638] bg-white dark:bg-[#0B101B] p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-medium">Lucro / Prejuízo Líquido (P&L)</span>
            {summary.totalProfitLoss >= 0 ? (
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-rose-500" />
            )}
          </div>
          <div
            className={`text-2xl font-black font-mono ${
              summary.totalProfitLoss > 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : summary.totalProfitLoss < 0
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            {formatMoney(summary.totalProfitLoss, currency, true)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>Retorno total obtido</span>
            <span className="font-mono">{formatMoney(summary.totalStaked + summary.totalProfitLoss, currency)}</span>
          </div>
        </div>

        {/* Card 3: Retorno Sobre Investimento (ROI) */}
        <div className="rounded-2xl border border-slate-200 dark:border-[#1E2638] bg-white dark:bg-[#0B101B] p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-medium">R.O.I. Global da Banca</span>
            <Percent className="h-3.5 w-3.5 text-indigo-500" />
          </div>
          <div
            className={`text-2xl font-black font-mono ${
              summary.roi > 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : summary.roi < 0
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            {summary.roi > 0 ? '+' : ''}
            {summary.roi.toFixed(1)}%
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>Rendimento ponderado</span>
            <span className="font-mono">{summary.settledBets} liquidada(s)</span>
          </div>
        </div>

        {/* Card 4: Taxa de Acerto (Win Rate %) */}
        <div className="rounded-2xl border border-slate-200 dark:border-[#1E2638] bg-white dark:bg-[#0B101B] p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-medium">Taxa de Acerto (Win Rate)</span>
            <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {summary.winRate.toFixed(1)}%
          </div>
          <div className="mt-2 flex items-center space-x-2 text-[11px]">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{summary.wonBets} Green</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-rose-600 dark:text-rose-400 font-bold">{summary.lostBets} Red</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-amber-500 font-medium">{summary.pendingBets} Pendente</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
        {/* Status Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'ALL'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-[#131926] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#1A2337]'
            }`}
          >
            Todas ({bets.length})
          </button>
          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'PENDING'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-2xs'
                : 'bg-slate-100 dark:bg-[#131926] text-amber-600 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-[#1A2337]'
            }`}
          >
            Pendentes ({summary.pendingBets})
          </button>
          <button
            onClick={() => setStatusFilter('WON')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'WON'
                ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                : 'bg-slate-100 dark:bg-[#131926] text-emerald-600 dark:text-emerald-400 hover:bg-slate-200 dark:hover:bg-[#1A2337]'
            }`}
          >
            Green ({summary.wonBets})
          </button>
          <button
            onClick={() => setStatusFilter('LOST')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'LOST'
                ? 'bg-rose-600 text-white font-bold shadow-2xs'
                : 'bg-slate-100 dark:bg-[#131926] text-rose-600 dark:text-rose-400 hover:bg-slate-200 dark:hover:bg-[#1A2337]'
            }`}
          >
            Red ({summary.lostBets})
          </button>
          {summary.voidBets > 0 && (
            <button
              onClick={() => setStatusFilter('VOID')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === 'VOID'
                  ? 'bg-slate-600 text-white font-bold shadow-2xs'
                : 'bg-slate-100 dark:bg-[#131926] text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#1A2337]'
              }`}
            >
              Reembolsadas ({summary.voidBets})
            </button>
          )}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filtrar partida ou liga..."
            className="w-full rounded-xl border border-slate-200 dark:border-[#20293D] bg-white dark:bg-[#0F1626] py-1.5 pl-9 pr-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none shadow-2xs"
          />
        </div>
      </div>

      {/* Bets Table / Cards Container */}
      <div className="rounded-2xl border border-slate-200 dark:border-[#1E2638] bg-white dark:bg-[#0B101B] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 font-mono flex flex-col items-center justify-center space-y-2">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
            <span>Consultando banco de dados SQLite persistente...</span>
          </div>
        ) : filteredBets.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 flex flex-col items-center justify-center space-y-3">
            <Layers className="h-8 w-8 text-slate-300 dark:text-slate-700" />
            <p className="font-medium text-slate-600 dark:text-slate-300">
              Nenhuma aposta encontrada para o filtro selecionado.
            </p>
            <p className="text-[11px] text-slate-400 max-w-md">
              Acesse a aba <strong>Simular / Validar Aposta</strong> para calcular o valor esperado de qualquer confronto 
              e salvá-lo diretamente na banca.
            </p>
            {onNavigateToValidator && (
              <button
                onClick={onNavigateToValidator}
                className="mt-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 font-semibold text-xs"
              >
                Simular Nova Aposta Agora
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-[#1A2233] bg-slate-50 dark:bg-[#0E1422] text-slate-500 dark:text-slate-400 font-medium">
                <tr>
                  <th className="py-3.5 px-4">Status & Auditoria</th>
                  <th className="py-3.5 px-4">Partida / Competição</th>
                  <th className="py-3.5 px-3 text-center">Placar</th>
                  <th className="py-3.5 px-4">Mercado Selecionado</th>
                  <th className="py-3.5 px-3 text-right">Odd / Fair</th>
                  <th className="py-3.5 px-3 text-right">EV (%)</th>
                  <th className="py-3.5 px-4 text-right">Stake</th>
                  <th className="py-3.5 px-4 text-right">P&L Resultado</th>
                  <th className="py-3.5 px-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#161D2B]">
                {filteredBets.map((bet) => {
                  const isWon = bet.status === 'WON';
                  const isLost = bet.status === 'LOST';
                  const isPending = bet.status === 'PENDING';
                  const isVoid = bet.status === 'VOID';

                  return (
                    <tr
                      key={bet.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-[#121927]/60 transition-colors"
                    >
                      {/* Status Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isWon && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                            <CheckCircle className="h-3 w-3" />
                            <span>GREEN</span>
                          </span>
                        )}
                        {isLost && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30">
                            <XCircle className="h-3 w-3" />
                            <span>RED</span>
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                            <Clock className="h-3 w-3" />
                            <span>PENDENTE</span>
                          </span>
                        )}
                        {isVoid && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-500/15 text-slate-700 dark:text-slate-400 border border-slate-500/30">
                            <span>VOID</span>
                          </span>
                        )}
                      </td>

                      {/* Partida & Competição */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {bet.match_title}
                        </div>
                        <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                          {bet.competition}
                        </div>
                      </td>

                      {/* Placar Final */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {bet.score_home !== null && bet.score_away !== null ? (
                          <span className="font-mono font-bold px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white">
                            {bet.score_home} - {bet.score_away}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-mono">
                            Aguardando
                          </span>
                        )}
                      </td>

                      {/* Mercado Escolhido */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {bet.market_label}
                        </span>
                        <div className="text-[10px] text-slate-400 uppercase font-mono">
                          {bet.market_chosen}
                        </div>
                      </td>

                      {/* Odd / Fair */}
                      <td className="py-3 px-3 text-right whitespace-nowrap font-mono">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {bet.odd.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Fair: {bet.fair_odd ? bet.fair_odd.toFixed(2) : '-'}
                        </div>
                      </td>

                      {/* EV (%) */}
                      <td className="py-3 px-3 text-right whitespace-nowrap font-mono">
                        <span
                          className={`font-bold ${
                            bet.ev_value > 0
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {bet.ev_value > 0 ? '+' : ''}
                          {bet.ev_value.toFixed(1)}%
                        </span>
                      </td>

                      {/* Stake */}
                      <td className="py-3 px-4 text-right whitespace-nowrap font-mono font-bold text-slate-900 dark:text-white">
                        {formatMoney(bet.stake, bet.currency || currency)}
                      </td>

                      {/* P&L Resultado */}
                      <td className="py-3 px-4 text-right whitespace-nowrap font-mono">
                        {isPending ? (
                          <span className="text-[11px] text-amber-500 font-medium">
                            Aberto
                          </span>
                        ) : bet.profit_loss !== null ? (
                          <span
                            className={`font-bold text-xs ${
                              bet.profit_loss > 0
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : bet.profit_loss < 0
                                ? 'text-rose-600 dark:text-rose-400'
                                : 'text-slate-500'
                            }`}
                          >
                            {formatMoney(bet.profit_loss, bet.currency || currency, true)}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-1.5">
                          {isPending && (
                            <button
                              onClick={() => handleSettleSingle(bet.id)}
                              disabled={settling}
                              title="Auditar e Liquidar este jogo agora"
                              className="p-1 rounded-md text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                            >
                              <Play className="h-3.5 w-3.5 fill-current" />
                            </button>
                          )}
                          <button
                            onClick={(e) => handleDeleteBet(bet.id, e)}
                            disabled={deletingId === bet.id}
                            title="Remover aposta do banco de dados"
                            className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Audit Methodology Note */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-[#1E2638] bg-slate-50/50 dark:bg-[#0B101B]/50 text-xs text-slate-500 dark:text-slate-400 flex items-start space-x-3">
        <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            Regra de Auditoria Imutável do Motor Quantitativo:
          </span>
          <p className="leading-relaxed">
            As apostas são liquidadas exclusivamente com base no resultado em tempo normal (90 minutos + acréscimos). 
            Em caso de vitória (GREEN), o P&L líquido é calculado como <code className="font-mono text-emerald-600 dark:text-emerald-400">(Stake × Odd) - Stake</code>. 
            Em caso de derrota (RED), o P&L é rigorosamente <code className="font-mono text-rose-600 dark:text-rose-400">-Stake</code>. 
            Todas as métricas de R.O.I. e taxa de acerto são calculadas em tempo real sobre a tabela persistente do SQLite.
          </p>
        </div>
      </div>
    </div>
  );
};
