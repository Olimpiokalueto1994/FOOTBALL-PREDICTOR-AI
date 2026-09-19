import { IFootballDataProvider } from '../../types/football';
import { ApiFootballDataProvider } from './ApiFootballDataProvider';
import { MockFootballDataProvider } from './MockFootballDataProvider';

let providerInstance: IFootballDataProvider | null = null;

/**
 * Obtém a instância do provedor de dados de futebol.
 * Se houver API_FOOTBALL_KEY ou FOOTBALL_DATA_API_KEY, utiliza o ApiFootballDataProvider;
 * caso contrário, utiliza o MockFootballDataProvider (dados sintéticos controlados).
 */
export function getDataProvider(): IFootballDataProvider {
  if (!providerInstance) {
    if (process.env.API_FOOTBALL_KEY || process.env.FOOTBALL_DATA_API_KEY) {
      providerInstance = new ApiFootballDataProvider();
    } else {
      providerInstance = new MockFootballDataProvider();
    }
  }
  return providerInstance;
}
