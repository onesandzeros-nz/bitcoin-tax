import { parse } from 'csv-parse/sync';
import Decimal from 'decimal.js';
import { TransactionSource, TransactionType } from '@prisma/client';
import { ParsedTransaction, CSVParser } from './types';
import { getUsdToNzdRate } from '../currency-converter';

/**
 * Xapo CSV Parser
 * Format: Processing Date/Time, Transaction Date/Time, Action Taken, Currency, Amount, BTC Spot/FX, USD Amount, ...
 */
export class XapoParser implements CSVParser {
  async parse(fileContent: string): Promise<ParsedTransaction[]> {
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as Record<string, any>[];

    const transactions: ParsedTransaction[] = [];

    for (const record of records) {
      try {
        // Use Transaction Date/Time, not Processing Date/Time
        const date = new Date(record['Transaction Date/Time']);
        const action = record['Action Taken'];
        const currency = record['Currency'];
        const amount = new Decimal(record['Amount'] || '0');
        const btcSpotRate = record['BTC Spot/FX'] ? new Decimal(record['BTC Spot/FX']) : new Decimal(0);
        const usdAmount = record['USD Amount'] ? new Decimal(record['USD Amount']) : new Decimal(0);

        let type: TransactionType;
        let btcAmount: Decimal;
        let fiatAmount: Decimal;
        let price: Decimal;

        // Convert USD to NZD
        const usdToNzd = await getUsdToNzdRate(date);

        if (action === 'Card Cashback Redemption') {
          // CASHBACK: Received BTC as cashback
          type = TransactionType.CASHBACK;
          btcAmount = amount; // Positive BTC amount
          fiatAmount = usdAmount.times(usdToNzd); // USD value converted to NZD
          price = btcAmount.greaterThan(0)
            ? fiatAmount.dividedBy(btcAmount)
            : new Decimal(0);
        } else if (action === 'Exchange BTC to USD') {
          // SELL: Sold BTC for USD
          type = TransactionType.SELL;
          btcAmount = amount; // Already negative
          fiatAmount = usdAmount.abs().times(usdToNzd); // Convert USD to NZD
          price = amount.abs().greaterThan(0)
            ? usdAmount.abs().dividedBy(amount.abs()).times(usdToNzd)
            : new Decimal(0);
        } else if (action === 'Received BTC' || action === 'Sent BTC' || action === 'Transaction') {
          // TRANSFER: Moving BTC between wallets, not a taxable event
          type = TransactionType.TRANSFER;
          btcAmount = amount;
          fiatAmount = usdAmount.abs().times(usdToNzd);
          price = btcAmount.abs().greaterThan(0)
            ? fiatAmount.dividedBy(btcAmount.abs())
            : new Decimal(0);
        } else if (action.toLowerCase().includes('subscription fee')) {
          // FEE
          type = TransactionType.FEE;
          btcAmount = amount; // Could be negative
          fiatAmount = usdAmount.times(usdToNzd);
          price = new Decimal(0);
        } else if (action === 'Exchange USD to BTC') {
          // BUY: Exchanged USD for BTC
          type = TransactionType.BUY;
          btcAmount = amount; // Positive BTC amount
          fiatAmount = usdAmount.abs().times(usdToNzd); // USD spent converted to NZD
          price = btcAmount.greaterThan(0)
            ? fiatAmount.dividedBy(btcAmount)
            : new Decimal(0);
        } else {
          // Unknown action, skip or log
          console.warn('Unknown Xapo action:', action, record);
          continue;
        }

        transactions.push({
          source: TransactionSource.XAPO,
          transactionDate: date,
          type,
          btcAmount,
          fiatAmount,
          fiatCurrency: 'NZD', // Already converted
          price,
          sourceReference: record['Counterparty'] || record['Sub Description'],
          rawData: record,
        });
      } catch (error) {
        console.error('Error parsing Xapo record:', record, error);
        throw error;
      }
    }

    return transactions;
  }
}
