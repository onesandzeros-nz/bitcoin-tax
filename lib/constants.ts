// SQLite does not support enums, so we define string constants here.
// These must match the values stored in the database.

export const TransactionSource = {
  EASY_CRYPTO: 'EASY_CRYPTO',
  LIGHTNING: 'LIGHTNING',
  XAPO: 'XAPO',
  KRAKEN: 'KRAKEN',
  COINCORNER: 'COINCORNER',
} as const;

export type TransactionSource = (typeof TransactionSource)[keyof typeof TransactionSource];

export const TransactionType = {
  BUY: 'BUY',
  SELL: 'SELL',
  TRANSFER: 'TRANSFER',
  FEE: 'FEE',
  CASHBACK: 'CASHBACK',
} as const;

export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];

export const ImportBatchStatus = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
} as const;

export type ImportBatchStatus = (typeof ImportBatchStatus)[keyof typeof ImportBatchStatus];
