import { parse } from 'csv-parse/sync';
import Decimal from 'decimal.js';
import { TransactionSource, TransactionType } from '@prisma/client';
import { ParsedTransaction, CSVParser } from './types';
import { getGbpToNzdRate } from '../currency-converter';

/**
 * CoinCorner CSV Parser
 * Format: Date & Time, Store/Website, Detail, Type, Tx ID, Price, Price Currency,
 *         Gross, Gross Currency, Fee, Fee Currency, Net, Net Currency, Balance, Balance Currency
 */
export class CoinCornerParser implements CSVParser {
  async parse(fileContent: string): Promise<ParsedTransaction[]> {
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as Record<string, any>[];

    const transactions: ParsedTransaction[] = [];

    for (const record of records) {
      try {
        const date = new Date(record['Date & Time']);
        const detail = record['Detail'] || '';
        const type = record['Type'];
        const priceStr = record['Price'];
        const gross = record['Gross'] ? new Decimal(record['Gross']) : new Decimal(0);
        const fee = record['Fee'] ? new Decimal(record['Fee']) : new Decimal(0);
        const net = record['Net'] ? new Decimal(record['Net']) : new Decimal(0);
        const txId = record['Tx ID'] || '';

        const gbpToNzd = await getGbpToNzdRate(date);

        if (type === 'Trade') {
          // Parse BTC amount from Detail field, e.g. "Sold 0.01063135 BTC" or "Bought 0.01 BTC"
          const soldMatch = detail.match(/Sold\s+([\d.]+)\s+BTC/i);
          const boughtMatch = detail.match(/Bought\s+([\d.]+)\s+BTC/i);

          if (soldMatch) {
            const btcAmount = new Decimal(soldMatch[1]).negated();
            const price = priceStr ? new Decimal(priceStr).times(gbpToNzd) : new Decimal(0);
            const fiatAmount = gross.abs().times(gbpToNzd);
            const feeNzd = fee.abs().times(gbpToNzd);

            transactions.push({
              source: TransactionSource.COINCORNER,
              transactionDate: date,
              type: TransactionType.SELL,
              btcAmount,
              fiatAmount,
              fiatCurrency: 'NZD',
              feeAmount: feeNzd,
              feeCurrency: 'NZD',
              price,
              sourceReference: txId || detail,
              rawData: record,
            });
          } else if (boughtMatch) {
            const btcAmount = new Decimal(boughtMatch[1]);
            const price = priceStr ? new Decimal(priceStr).times(gbpToNzd) : new Decimal(0);
            const fiatAmount = gross.abs().times(gbpToNzd);
            const feeNzd = fee.abs().times(gbpToNzd);

            transactions.push({
              source: TransactionSource.COINCORNER,
              transactionDate: date,
              type: TransactionType.BUY,
              btcAmount,
              fiatAmount,
              fiatCurrency: 'NZD',
              feeAmount: feeNzd,
              feeCurrency: 'NZD',
              price,
              sourceReference: txId || detail,
              rawData: record,
            });
          } else {
            console.warn('Unknown CoinCorner trade detail:', detail, record);
          }
        } else if (type === 'Bank withdrawal' || type === 'Bank deposit') {
          // Fiat movements, not crypto transactions - skip
          continue;
        } else if (type === 'Send' || type === 'Receive') {
          // BTC transfers between wallets
          const btcMatch = detail.match(/([\d.]+)\s+BTC/i);
          const btcAmount = btcMatch
            ? new Decimal(btcMatch[1]).times(type === 'Send' ? -1 : 1)
            : new Decimal(0);

          transactions.push({
            source: TransactionSource.COINCORNER,
            transactionDate: date,
            type: TransactionType.TRANSFER,
            btcAmount,
            fiatAmount: new Decimal(0),
            fiatCurrency: 'NZD',
            price: new Decimal(0),
            sourceReference: txId || detail,
            rawData: record,
          });
        } else {
          console.warn('Unknown CoinCorner type:', type, record);
          continue;
        }
      } catch (error) {
        console.error('Error parsing CoinCorner record:', record, error);
        throw error;
      }
    }

    return transactions;
  }
}
