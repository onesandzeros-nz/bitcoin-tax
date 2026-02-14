import Decimal from 'decimal.js';
import { TransactionType } from '@prisma/client';

export interface WACState {
  runningBalance: Decimal;
  runningCost: Decimal;
  wacPrice: Decimal;
}

export interface TransactionInput {
  id: string;
  type: TransactionType;
  btcAmount: Decimal;
  fiatAmount: Decimal;
  feeAmount?: Decimal | null;
  feeCurrency?: string | null;
  price: Decimal;
  transactionDate: Date;
}

export interface WACCalculationResult {
  transactionId: string;
  runningBalance: Decimal;
  runningCost: Decimal;
  wacPrice: Decimal;
  costBasis: Decimal;
  capitalGain: Decimal | null;
}

/**
 * Calculate WAC for a single transaction given the previous state
 */
export function calculateWACForTransaction(
  transaction: TransactionInput,
  previousState: WACState
): WACCalculationResult {
  const { type, btcAmount, fiatAmount, feeAmount, feeCurrency } = transaction;

  let newBalance = previousState.runningBalance;
  let newCost = previousState.runningCost;
  let newWac = previousState.wacPrice;
  let costBasis = new Decimal(0);
  let capitalGain: Decimal | null = null;

  // Convert Decimal if needed
  const btc = new Decimal(btcAmount);
  const fiat = new Decimal(fiatAmount);
  const fee = feeAmount ? new Decimal(feeAmount) : new Decimal(0);

  switch (type) {
    case TransactionType.BUY: {
      // Acquisition: Add to balance and cost basis
      const totalCost = fiat.plus(feeCurrency === 'NZD' || !feeCurrency ? fee : 0);

      newBalance = previousState.runningBalance.plus(btc);
      newCost = previousState.runningCost.plus(totalCost);

      // Calculate new WAC
      if (newBalance.greaterThan(0)) {
        newWac = newCost.dividedBy(newBalance);
      }

      costBasis = totalCost;
      capitalGain = null;

      break;
    }

    case TransactionType.CASHBACK: {
      // Cashback: BTC received at no cost, increases balance but not cost basis
      newBalance = previousState.runningBalance.plus(btc);
      newCost = previousState.runningCost;

      if (newBalance.greaterThan(0)) {
        newWac = newCost.dividedBy(newBalance);
      }

      costBasis = new Decimal(0);
      capitalGain = null;

      break;
    }

    case TransactionType.SELL: {
      // Disposal: Calculate capital gain and reduce balance/cost
      const btcSold = btc.abs();

      if (btcSold.greaterThan(previousState.runningBalance)) {
        throw new Error(
          `Insufficient BTC balance for sale on ${transaction.transactionDate}. ` +
          `Trying to sell ${btcSold} BTC but only have ${previousState.runningBalance} BTC`
        );
      }

      // Cost basis is the WAC price times the amount sold
      costBasis = previousState.wacPrice.times(btcSold);

      // Capital gain is sale proceeds minus cost basis
      // Subtract NZD fees from proceeds
      const proceeds = fiat.minus(feeCurrency === 'NZD' || !feeCurrency ? fee : 0);
      capitalGain = proceeds.minus(costBasis);

      // Update running totals
      newBalance = previousState.runningBalance.minus(btcSold);
      newCost = previousState.runningCost.minus(costBasis);

      // WAC price remains the same (or recalculate if needed)
      if (newBalance.greaterThan(0)) {
        newWac = newCost.dividedBy(newBalance);
      } else {
        newWac = new Decimal(0);
      }

      break;
    }

    case TransactionType.FEE: {
      // Fees paid in BTC are treated as disposals
      if (feeCurrency === 'BTC' || !feeCurrency) {
        const btcFee = fee.greaterThan(0) ? fee : btc.abs();

        if (btcFee.greaterThan(previousState.runningBalance)) {
          throw new Error(
            `Insufficient BTC balance for fee on ${transaction.transactionDate}`
          );
        }

        // Treat as disposal at market rate
        costBasis = previousState.wacPrice.times(btcFee);

        // If fiat amount represents the market value of the fee
        const marketValue = fiat.greaterThan(0) ? fiat : costBasis;
        capitalGain = marketValue.minus(costBasis);

        newBalance = previousState.runningBalance.minus(btcFee);
        newCost = previousState.runningCost.minus(costBasis);

        if (newBalance.greaterThan(0)) {
          newWac = newCost.dividedBy(newBalance);
        } else {
          newWac = new Decimal(0);
        }
      } else {
        // NZD fee - add to cost basis
        newCost = previousState.runningCost.plus(fee);
        newBalance = previousState.runningBalance;

        if (newBalance.greaterThan(0)) {
          newWac = newCost.dividedBy(newBalance);
        }

        costBasis = fee;
        capitalGain = null;
      }

      break;
    }

    case TransactionType.TRANSFER: {
      // Transfers don't trigger tax events in NZ
      // But may have BTC fees
      if (feeCurrency === 'BTC' && fee.greaterThan(0)) {
        // Fee is a disposal
        costBasis = previousState.wacPrice.times(fee);

        const marketValue = fiat.greaterThan(0) ? fiat : costBasis;
        capitalGain = marketValue.minus(costBasis);

        newBalance = previousState.runningBalance.minus(fee);
        newCost = previousState.runningCost.minus(costBasis);

        if (newBalance.greaterThan(0)) {
          newWac = newCost.dividedBy(newBalance);
        } else {
          newWac = new Decimal(0);
        }
      } else {
        // No change to WAC
        newBalance = previousState.runningBalance;
        newCost = previousState.runningCost;
        newWac = previousState.wacPrice;
        costBasis = new Decimal(0);
        capitalGain = null;
      }

      break;
    }

    default:
      throw new Error(`Unknown transaction type: ${type}`);
  }

  return {
    transactionId: transaction.id,
    runningBalance: newBalance,
    runningCost: newCost,
    wacPrice: newWac,
    costBasis,
    capitalGain,
  };
}

/**
 * Calculate WAC for multiple transactions sequentially
 */
export function calculateWACForTransactions(
  transactions: TransactionInput[],
  openingBalance: Decimal = new Decimal(0),
  openingCostBasis: Decimal = new Decimal(0)
): WACCalculationResult[] {
  // Calculate opening WAC
  const openingWac = openingBalance.greaterThan(0)
    ? openingCostBasis.dividedBy(openingBalance)
    : new Decimal(0);

  let currentState: WACState = {
    runningBalance: openingBalance,
    runningCost: openingCostBasis,
    wacPrice: openingWac,
  };

  const results: WACCalculationResult[] = [];

  // Sort transactions by date (important for WAC calculation)
  const sortedTransactions = [...transactions].sort(
    (a, b) => a.transactionDate.getTime() - b.transactionDate.getTime()
  );

  for (const transaction of sortedTransactions) {
    const result = calculateWACForTransaction(transaction, currentState);
    results.push(result);

    // Update state for next iteration
    currentState = {
      runningBalance: result.runningBalance,
      runningCost: result.runningCost,
      wacPrice: result.wacPrice,
    };
  }

  return results;
}

/**
 * Helper to convert Prisma Decimal to Decimal.js
 */
export function toDecimal(value: any): Decimal {
  if (value instanceof Decimal) {
    return value;
  }
  return new Decimal(value.toString());
}
