import { Match, PredictionResult, BacktestSummary } from '../types/football';

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

export async function queryPredictor(query: string): Promise<{ answer: string; relatedMatchId?: string }> {
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
