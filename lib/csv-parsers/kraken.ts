import { parse } from 'csv-parse/sync';
import Decimal from 'decimal.js';
import { TransactionSource, TransactionType } from '@prisma/client';
import { ParsedTransaction, CSVParser } from './types';
import { getUsdToNzdRate } from '../currency-converter';

/**
 * Kraken CSV Parser
 * Format: txid, ordertxid, pair, ..., time, type, ordertype, price, cost, fee, vol, ...
 */
export class KrakenParser implements CSVParser {
  async parse(fileContent: string): Promise<ParsedTransaction[]> {
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as Record<string, any>[];

    const transactions: ParsedTransaction[] = [];

    for (const record of records) {
      try {
        const date = new Date(record['time']);
        const type = record['type']; // "buy" or "sell"
        const priceUsd = new Decimal(record['price'] || '0'); // USD per BTC
        const costUsd = new Decimal(record['cost'] || '0'); // Total USD
        const feeUsd = new Decimal(record['fee'] || '0'); // USD fee
        const btcVol = new Decimal(record['vol'] || '0'); // BTC amount

        // Convert USD to NZD
        const usdToNzd = await getUsdToNzdRate(date);

        const priceNzd = priceUsd.times(usdToNzd);
        const costNzd = costUsd.times(usdToNzd);
        const feeNzd = feeUsd.times(usdToNzd);

        let transactionType: TransactionType;
        let btcAmount: Decimal;
        let fiatAmount: Decimal;

        if (type === 'buy') {
          transactionType = TransactionType.BUY;
          btcAmount = btcVol; // Positive
          fiatAmount = costNzd.plus(feeNzd); // Total cost including fee
        } else if (type === 'sell') {
          transactionType = TransactionType.SELL;
          btcAmount = btcVol.negated(); // Negative
          fiatAmount = costNzd.minus(feeNzd); // Proceeds after fee
        } else {
          console.warn('Unknown Kraken transaction type:', type, record);
          continue;
        }

        transactions.push({
          source: TransactionSource.KRAKEN,
          transactionDate: date,
          type: transactionType,
          btcAmount,
          fiatAmount,
          fiatCurrency: 'NZD',
          feeAmount: feeNzd,
          feeCurrency: 'NZD',
          price: priceNzd,
          sourceReference: record['txid'],
          rawData: record,
        });
      } catch (error) {
        console.error('Error parsing Kraken record:', record, error);
        throw error;
      }
    }

    return transactions;
  }
}
