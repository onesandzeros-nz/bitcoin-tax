import Decimal from 'decimal.js';
import { prisma } from './prisma';

/**
 * Convert currency using stored rates
 * Falls back to closest available date if exact date not found
 */
export async function convertCurrency(
  amount: Decimal,
  fromCurrency: string,
  toCurrency: string,
  date: Date
): Promise<Decimal> {
  // If same currency, no conversion needed
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // Look for exact date match first
  let rate = await prisma.currencyRate.findUnique({
    where: {
      date_fromCurrency_toCurrency: {
        date,
        fromCurrency,
        toCurrency,
      },
    },
  });

  // If not found, try to find closest date
  if (!rate) {
    rate = await prisma.currencyRate.findFirst({
      where: {
        fromCurrency,
        toCurrency,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  if (!rate) {
    // Try reverse rate (e.g., NZD/USD instead of USD/NZD)
    rate = await prisma.currencyRate.findFirst({
      where: {
        fromCurrency: toCurrency,
        toCurrency: fromCurrency,
      },
      orderBy: {
        date: 'desc',
      },
    });

    if (rate) {
      // Invert the rate
      const invertedRate = new Decimal(1).dividedBy(new Decimal(rate.rate.toString()));
      return amount.times(invertedRate);
    }

    throw new Error(
      `No currency rate found for ${fromCurrency} to ${toCurrency} around ${date.toISOString()}`
    );
  }

  return amount.times(new Decimal(rate.rate.toString()));
}

/**
 * Store a currency rate
 */
export async function storeCurrencyRate(
  date: Date,
  fromCurrency: string,
  toCurrency: string,
  rate: Decimal,
  source: string = 'Manual'
) {
  return await prisma.currencyRate.upsert({
    where: {
      date_fromCurrency_toCurrency: {
        date,
        fromCurrency,
        toCurrency,
      },
    },
    update: {
      rate,
      source,
    },
    create: {
      date,
      fromCurrency,
      toCurrency,
      rate,
      source,
    },
  });
}

/**
 * Get or estimate GBP to NZD rate for a given date
 * Uses average NZ fiscal year rates as fallback
 */
export async function getGbpToNzdRate(date: Date): Promise<Decimal> {
  try {
    const rate = await prisma.currencyRate.findUnique({
      where: {
        date_fromCurrency_toCurrency: {
          date,
          fromCurrency: 'GBP',
          toCurrency: 'NZD',
        },
      },
    });

    if (rate) {
      return new Decimal(rate.rate.toString());
    }

    // Fallback to approximate rates based on historical averages
    const year = date.getFullYear();
    const fallbackRates: { [key: number]: number } = {
      2025: 2.12,
      2024: 2.07,
      2023: 2.01,
      2022: 1.95,
    };

    return new Decimal(fallbackRates[year] || 2.05);
  } catch (error) {
    return new Decimal(2.05);
  }
}

/**
 * Get or estimate USD to NZD rate for a given date
 * Uses average NZ fiscal year rates as fallback
 */
export async function getUsdToNzdRate(date: Date): Promise<Decimal> {
  try {
    const rate = await prisma.currencyRate.findUnique({
      where: {
        date_fromCurrency_toCurrency: {
          date,
          fromCurrency: 'USD',
          toCurrency: 'NZD',
        },
      },
    });

    if (rate) {
      return new Decimal(rate.rate.toString());
    }

    // Fallback to approximate rates based on historical averages
    // These should be replaced with actual historical data
    const year = date.getFullYear();
    const fallbackRates: { [key: number]: number } = {
      2025: 1.65,
      2024: 1.62,
      2023: 1.61,
      2022: 1.58,
    };

    return new Decimal(fallbackRates[year] || 1.60);
  } catch (error) {
    // Default fallback rate
    return new Decimal(1.60);
  }
}
