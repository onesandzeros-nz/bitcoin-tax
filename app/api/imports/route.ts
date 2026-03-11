import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getParser } from '@/lib/csv-parsers';
import { TransactionSource } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const source = formData.get('source') as TransactionSource;

    if (!file || !source) {
      return NextResponse.json(
        { error: 'File and source are required' },
        { status: 400 }
      );
    }

    // Read file content
    const fileContent = await file.text();

    // Create import batch
    const importBatch = await prisma.importBatch.create({
      data: {
        source,
        fileName: file.name,
        status: 'PENDING',
      },
    });

    try {
      // Parse CSV
      const parser = getParser(source);
      const parsedTransactions = await parser.parse(fileContent);

      // Fetch all existing transactions for this source to check for duplicates
      const existingTransactions = await prisma.transaction.findMany({
        where: { source },
        select: {
          id: true,
          transactionDate: true,
          btcAmount: true,
          sourceReference: true,
        },
      });

      // Build a lookup set for fast matching
      // Key: source + date ISO + btcAmount + sourceReference
      const existingKeys = new Map<string, string>();
      for (const tx of existingTransactions) {
        const key = [
          tx.transactionDate.toISOString(),
          tx.btcAmount.toString(),
          tx.sourceReference || '',
        ].join('|');
        existingKeys.set(key, tx.id);
      }

      let created = 0;
      let updated = 0;

      for (const tx of parsedTransactions) {
        const key = [
          tx.transactionDate.toISOString(),
          tx.btcAmount.toString(),
          tx.sourceReference || '',
        ].join('|');

        const existingId = existingKeys.get(key);

        if (existingId) {
          // Update existing transaction (type may have changed, e.g. BUY -> TRANSFER)
          await prisma.transaction.update({
            where: { id: existingId },
            data: {
              type: tx.type,
              fiatAmount: tx.fiatAmount,
              fiatCurrency: tx.fiatCurrency,
              feeAmount: tx.feeAmount,
              feeCurrency: tx.feeCurrency,
              price: tx.price,
              importBatchId: importBatch.id,
              rawData: tx.rawData,
            },
          });
          updated++;
        } else {
          await prisma.transaction.create({
            data: {
              source: tx.source,
              transactionDate: tx.transactionDate,
              type: tx.type,
              btcAmount: tx.btcAmount,
              fiatAmount: tx.fiatAmount,
              fiatCurrency: tx.fiatCurrency,
              feeAmount: tx.feeAmount,
              feeCurrency: tx.feeCurrency,
              price: tx.price,
              sourceReference: tx.sourceReference,
              importBatchId: importBatch.id,
              rawData: tx.rawData,
            },
          });
          created++;
        }
      }

      // Update import batch
      await prisma.importBatch.update({
        where: { id: importBatch.id },
        data: {
          status: 'SUCCESS',
          recordsImported: created + updated,
        },
      });

      return NextResponse.json({
        success: true,
        importBatchId: importBatch.id,
        recordsImported: created + updated,
        created,
        updated,
      });
    } catch (error) {
      // Update import batch with error
      await prisma.importBatch.update({
        where: { id: importBatch.id },
        data: {
          status: 'ERROR',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw error;
    }
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Import failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const batches = await prisma.importBatch.findMany({
      orderBy: { importedAt: 'desc' },
      include: {
        _count: {
          select: { transactions: true },
        },
      },
    });

    return NextResponse.json(batches);
  } catch (error) {
    console.error('Error fetching import batches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch import batches' },
      { status: 500 }
    );
  }
}
