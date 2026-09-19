import { 
  Match, 
  PredictionResult, 
  BacktestSummary, 
  LiveMatchAnalysisResult, 
  DetailedMarketOdds,
  BetValidationRequest,
  BetValidationResult,
  TrackedBet,
  BetSummaryStats,
  SettleResponse,
  CurrencyCode
} from '../types/football';

export async function getMatches(params?: {
  competition?: string;
  status?: string;
  search?: string;
  favoritesOnly?: boolean;
}): Promise<Match[]> {
  const query = new URLSearchParams();
  if (params?.competition) query.set('competition', params.competition);
  if (params?.status) query.set('status', params.status);
  if (params?.search) query.set('search', params.search);
  if (params?.favoritesOnly) query.set('favoritesOnly', 'true');

  const res = await fetch(`/api/matches?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch matches');
  return res.json();
}

export async function getMatch(id: string): Promise<Match> {
  const res = await fetch(`/api/matches/${id}`);
  if (!res.ok) throw new Error('Failed to fetch match');
  return res.json();
}

export async function getMatchOdds(id: string): Promise<DetailedMarketOdds> {
  const res = await fetch(`/api/odds/${id}`);
  if (!res.ok) throw new Error('Failed to fetch match odds');
  return res.json();
}

export async function updateOddsApiKey(apiKey: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch('/api/admin/odds-key', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey }),
  });
  if (!res.ok) throw new Error('Failed to update The-Odds-API key');
  return res.json();
}

export async function runPrediction(id: string): Promise<PredictionResult> {
  const res = await fetch(`/api/predict/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to run prediction');
  return res.json();
}

export async function getBacktestSummary(): Promise<BacktestSummary> {
  const res = await fetch('/api/backtest');
  if (!res.ok) throw new Error('Failed to fetch backtest');
  return res.json();
}

export async function queryPredictor(query: string): Promise<{ 
  answer: string; 
  relatedMatchId?: string;
  sources?: { title: string; uri: string }[];
}> {
  const res = await fetch('/api/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error('Failed to query predictor');
  return res.json();
}

export async function toggleFavoriteMatch(id: string): Promise<{ id: string; isFavorite: boolean }> {
  const res = await fetch(`/api/matches/${id}/favorite`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to toggle favorite');
  return res.json();
}

export async function getAdminStatus(): Promise<any> {
  const res = await fetch('/api/admin/status');
  if (!res.ok) throw new Error('Failed to fetch admin status');
  return res.json();
}

export async function searchLiveMatch(query: string): Promise<LiveMatchAnalysisResult> {
  const res = await fetch('/api/live-search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error('Falha ao processar pesquisa ao vivo');
  return res.json();
}

export async function validateBet(payload: BetValidationRequest): Promise<BetValidationResult> {
  const res = await fetch('/api/validate-bet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Falha ao validar aposta personalizada');
  }
  return res.json();
}

export async function getBets(): Promise<{ bets: TrackedBet[]; summary: BetSummaryStats }> {
  const res = await fetch('/api/bets');
  if (!res.ok) throw new Error('Falha ao carregar histórico de apostas');
  return res.json();
}

export async function saveBet(bet: Partial<TrackedBet>): Promise<{ success: boolean; bet: TrackedBet; summary: BetSummaryStats }> {
  const res = await fetch('/api/bets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bet),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Falha ao salvar aposta no banco de dados');
  }
  return res.json();
}

export async function settleBets(betId?: string): Promise<SettleResponse> {
  const res = await fetch('/api/bets/settle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ betId }),
  });
  if (!res.ok) throw new Error('Falha ao auditar e liquidar apostas pós-jogo');
  return res.json();
}

export async function deleteBet(id: string): Promise<{ success: boolean; summary: BetSummaryStats }> {
  const res = await fetch(`/api/bets/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Falha ao excluir aposta');
  return res.json();
}

export async function getSettings(): Promise<{ currency: CurrencyCode }> {
  const res = await fetch('/api/settings');
  if (!res.ok) return { currency: 'AOA' };
  return res.json();
}

export async function updateSetting(key: string, value: string): Promise<{ success: boolean; key: string; value: string }> {
  const res = await fetch('/api/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, value }),
  });
  if (!res.ok) throw new Error('Falha ao salvar configuração');
  return res.json();
}

