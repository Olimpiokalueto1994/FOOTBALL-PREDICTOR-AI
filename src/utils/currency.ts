import { CurrencyCode, CurrencyConfig } from '../types/football';

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  AOA: {
    code: 'AOA',
    symbol: 'Kz',
    label: 'Kwanza Angolano (Kz)',
    position: 'suffix',
  },
  USD: {
    code: 'USD',
    symbol: '$',
    label: 'Dólar Americano ($)',
    position: 'prefix',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    label: 'Euro (€)',
    position: 'suffix',
  },
  BRL: {
    code: 'BRL',
    symbol: 'R$',
    label: 'Real Brasileiro (R$)',
    position: 'prefix',
  },
};

export const DEFAULT_CURRENCY: CurrencyCode = 'AOA';

/**
 * Formata um valor numérico na moeda especificada.
 * Padrão: Kwanza Angolano (Kz), ex: "10.000 Kz" ou "+25.400 Kz"
 */
export function formatMoney(
  amount: number | null | undefined,
  currency: CurrencyCode = 'AOA',
  showPlusSign = false
): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    amount = 0;
  }

  const config = CURRENCIES[currency] || CURRENCIES.AOA;
  const isNegative = amount < 0;
  const absVal = Math.abs(amount);

  // Formatação com separadores de milhar
  let formattedNumber = '';

  if (currency === 'AOA') {
    // Kwanza geralmente não usa centavos em apostas inteiras, usa no máximo 2 decimais se houver
    formattedNumber = absVal.toLocaleString('pt-AO', {
      minimumFractionDigits: absVal % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    });
  } else if (currency === 'BRL') {
    formattedNumber = absVal.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } else if (currency === 'EUR') {
    formattedNumber = absVal.toLocaleString('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } else {
    // USD
    formattedNumber = absVal.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  const sign = isNegative ? '-' : showPlusSign && amount > 0 ? '+' : '';

  if (config.position === 'prefix') {
    return `${sign}${config.symbol} ${formattedNumber}`;
  } else {
    return `${sign}${formattedNumber} ${config.symbol}`;
  }
}
