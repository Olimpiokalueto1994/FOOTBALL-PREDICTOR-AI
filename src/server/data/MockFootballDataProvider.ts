import { 
  IFootballDataProvider, 
  Match, 
  HistoricalMatchEval, 
  TeamStats, 
  PlayerInjury, 
  DataProviderHealth 
} from '../../types/football';
import { INITIAL_MATCHES_DATABASE } from './mockDatabase';
import { historicalEvaluationDataset } from '../engine/backtestEngine';

/**
 * MockFootballDataProvider
 * Implementação demonstrativa baseada em dados sintéticos controlados.
 * Identificada formalmente com isSynthetic: true.
 */
export class MockFootballDataProvider implements IFootballDataProvider {
  readonly name = 'MockFootballDataProvider (Sintético / Demonstrativo)';
  readonly isSynthetic = true;

  private matches: Map<string, Match> = new Map();

  constructor() {
    INITIAL_MATCHES_DATABASE.forEach(m => {
      this.matches.set(m.id, { ...m });
    });
  }

  async getMatches(filters?: { competition?: string; status?: string; search?: string; favoritesOnly?: boolean }): Promise<Match[]> {
    let list = Array.from(this.matches.values());

    if (filters?.competition && filters.competition !== 'ALL') {
      list = list.filter(m => m.competitionCode === filters.competition || m.competition === filters.competition);
    }
    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter(m => m.status === filters.status);
    }
    if (filters?.favoritesOnly) {
      list = list.filter(m => m.isFavorite);
    }
    if (filters?.search && filters.search.trim() !== '') {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(m => 
        m.homeTeam.name.toLowerCase().includes(q) ||
        m.awayTeam.name.toLowerCase().includes(q) ||
        m.homeTeam.shortName.toLowerCase().includes(q) ||
        m.awayTeam.shortName.toLowerCase().includes(q) ||
        m.competition.toLowerCase().includes(q) ||
        m.venue.toLowerCase().includes(q)
      );
    }

    return list;
  }

  async getMatchById(id: string): Promise<Match | null> {
    const match = this.matches.get(id);
    return match ? { ...match } : null;
  }

  async getHistoricalMatchesForBacktest(): Promise<HistoricalMatchEval[]> {
    return [...historicalEvaluationDataset];
  }

  async getTeamStats(teamId: string): Promise<TeamStats | null> {
    for (const m of this.matches.values()) {
      if (m.homeTeam.id === teamId) return m.homeTeam.stats;
      if (m.awayTeam.id === teamId) return m.awayTeam.stats;
    }
    return null;
  }

  async getInjuries(teamId: string): Promise<PlayerInjury[]> {
    for (const m of this.matches.values()) {
      if (m.homeTeam.id === teamId) return m.homeTeam.injuries;
      if (m.awayTeam.id === teamId) return m.awayTeam.injuries;
    }
    return [];
  }

  async checkHealth(): Promise<DataProviderHealth> {
    return {
      status: 'ONLINE',
      providerName: this.name,
      isSynthetic: true,
      message: '[MODO DEMONSTRAÇÃO / DADOS SINTÉTICOS] Base estática em memória para testes e calibração de pipeline.',
      cachedEntriesCount: this.matches.size,
    };
  }
}
