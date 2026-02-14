import { parse } from 'csv-parse/sync';
import Decimal from 'decimal.js';
import { TransactionSource, TransactionType } from '@prisma/client';
import { ParsedTransaction, CSVParser } from './types';

/**
 * Lightning Pay CSV Parser
 * Format: Date, Sent Amount, Sent Currency, Received Amount, Received Currency, Fee Amount, Fee Currency, ...
 */
export class LightningParser implements CSVParser {
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
        const sentAmount = new Decimal(record['Sent Amount'] || '0');
        const sentCurrency = record['Sent Currency'];
        const receivedAmount = new Decimal(record['Received Amount'] || '0');
        const receivedCurrency = record['Received Currency'];
        const feeAmount = record['Fee Amount'] ? new Decimal(record['Fee Amount']) : undefined;
        const feeCurrency = record['Fee Currency'];

        let type: TransactionType;
        let btcAmount: Decimal;
        let fiatAmount: Decimal;
        let price: Decimal;

        if (sentCurrency === 'NZD' && receivedCurrency === 'BTC') {
          // BUY: Sent NZD, Received BTC
          type = TransactionType.BUY;
          btcAmount = receivedAmount;
          fiatAmount = sentAmount;
          price = btcAmount.greaterThan(0)
            ? fiatAmount.dividedBy(btcAmount)
            : new Decimal(0);
        } else if (sentCurrency === 'BTC' && receivedCurrency === 'NZD') {
          // SELL: Sent BTC, Received NZD
          type = TransactionType.SELL;
          btcAmount = sentAmount.negated();
          fiatAmount = receivedAmount;
          price = sentAmount.greaterThan(0)
            ? receivedAmount.dividedBy(sentAmount)
            : new Decimal(0);
        } else if (sentCurrency === 'BTC' && receivedCurrency === 'BTC') {
          // TRANSFER: BTC to BTC (potentially on-chain transfer with fee)
          type = TransactionType.TRANSFER;
          btcAmount = receivedAmount.minus(sentAmount); // Net change
          fiatAmount = new Decimal(0);
          price = new Decimal(0);
        } else {
          // Unknown transaction type, skip or throw
          console.warn('Unknown Lightning transaction type:', record);
          continue;
        }

        transactions.push({
          source: TransactionSource.LIGHTNING,
          transactionDate: date,
          type,
          btcAmount,
          fiatAmount,
          fiatCurrency: 'NZD',
          feeAmount,
          feeCurrency,
          price,
          sourceReference: record['TxHash'],
          rawData: record,
        });
      } catch (error) {
        console.error('Error parsing Lightning record:', record, error);
        throw error;
      }
    }

    return transactions;
  }
}
