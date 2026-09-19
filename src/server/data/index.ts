import { IFootballDataProvider } from '../../types/football';
import { ApiFootballDataProvider } from './ApiFootballDataProvider';
import { TheOddsApiProvider } from './TheOddsApiProvider';

export { ApiFootballDataProvider } from './ApiFootballDataProvider';
export { TheOddsApiProvider } from './TheOddsApiProvider';

let providerInstance: IFootballDataProvider | null = null;
let oddsProviderInstance: TheOddsApiProvider | null = null;

/**
 * Obtém a instância do provedor de dados de futebol.
 * Instancia o ApiFootballDataProvider como provedor padrão com a chave ativa de football-data.org.
 */
export function getDataProvider(): IFootballDataProvider {
  if (!providerInstance) {
    const activeKey = process.env.FOOTBALL_DATA_API_KEY || '907624fc74324e069961ea1ad1da0b85';
    providerInstance = new ApiFootballDataProvider(activeKey);
  }
  return providerInstance;
}

/**
 * Obtém a instância do provedor The-Odds-API para cotações em tempo real.
 */
export function getOddsProvider(): TheOddsApiProvider {
  if (!oddsProviderInstance) {
    const oddsKey = process.env.THE_ODDS_API_KEY || '292c8535f0d0bc1231d91e7834a848d5';
    oddsProviderInstance = new TheOddsApiProvider(oddsKey);
  }
  return oddsProviderInstance;
}
