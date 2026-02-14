import { TransactionSource } from '@prisma/client';
import { EasyCryptoParser } from './easy-crypto';
import { LightningParser } from './lightning';
import { XapoParser } from './xapo';
import { KrakenParser } from './kraken';
import { CoinCornerParser } from './coincorner';
import { CSVParser } from './types';

export * from './types';

export function getParser(source: TransactionSource): CSVParser {
  switch (source) {
    case TransactionSource.EASY_CRYPTO:
      return new EasyCryptoParser();
    case TransactionSource.LIGHTNING:
      return new LightningParser();
    case TransactionSource.XAPO:
      return new XapoParser();
    case TransactionSource.KRAKEN:
      return new KrakenParser();
    case TransactionSource.COINCORNER:
      return new CoinCornerParser();
    default:
      throw new Error(`Unknown transaction source: ${source}`);
  }
}
