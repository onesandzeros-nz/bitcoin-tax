import { parse } from 'csv-parse/sync';
import Decimal from 'decimal.js';
import { TransactionSource, TransactionType } from '@prisma/client';
import { ParsedTransaction, CSVParser } from './types';

/**
 * Easy Crypto CSV Parser
 * Format: Date, Order ID, Type, From symbol, To symbol, From amount, To amount, ...
 * All transactions are SELL (BTC to NZD)
 */
export class EasyCryptoParser implements CSVParser {
  async parse(fileContent: string): Promise<ParsedTransaction[]> {
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as Record<string, any>[];

    const transactions: ParsedTransaction[] = [];

    for (const record of records) {
      try {
        const date = new Date(record['Date']);
        const btcAmount = new Decimal(record['From amount'] || '0');
        const nzdAmount = new Decimal(record['To amount'] || '0');

        // Calculate price (NZD per BTC)
        const price = btcAmount.greaterThan(0)
          ? nzdAmount.dividedBy(btcAmount)
          : new Decimal(0);

        transactions.push({
          source: TransactionSource.EASY_CRYPTO,
          transactionDate: date,
          type: TransactionType.SELL, // Easy Crypto orders are all sells
          btcAmount: btcAmount.negated(), // Negative for sells
          fiatAmount: nzdAmount, // Positive (received NZD)
          fiatCurrency: 'NZD',
          price,
          sourceReference: record['Order ID'],
          rawData: record,
        });
      } catch (error) {
        console.error('Error parsing Easy Crypto record:', record, error);
        throw error;
      }
    }

    return transactions;
  }
}
