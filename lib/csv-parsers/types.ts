import { TransactionType, TransactionSource } from '../constants';
import Decimal from 'decimal.js';

export interface ParsedTransaction {
  source: TransactionSource;
  transactionDate: Date;
  type: TransactionType;
  btcAmount: Decimal;
  fiatAmount: Decimal;
  fiatCurrency: string;
  feeAmount?: Decimal;
  feeCurrency?: string;
  price: Decimal;
  sourceReference?: string;
  rawData: string;
}

export interface CSVParser {
  parse(fileContent: string): Promise<ParsedTransaction[]>;
}
