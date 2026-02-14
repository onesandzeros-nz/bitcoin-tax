import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateWACForTransactions, toDecimal } from '@/lib/wac-calculator';
import Decimal from 'decimal.js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { taxYearId } = body;

    let openingBalance = new Decimal(0);
    let openingCostBasis = new Decimal(0);
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (taxYearId) {
      const taxYear = await prisma.taxYear.findUnique({
        where: { id: taxYearId },
      });

      if (!taxYear) {
        return NextResponse.json(
          { error: 'Tax year not found' },
          { status: 404 }
        );
      }

      openingBalance = toDecimal(taxYear.openingBtcBalance);
      openingCostBasis = toDecimal(taxYear.openingCostBasis);
      startDate = taxYear.startDate;
      endDate = taxYear.endDate;
    }

    // Fetch all transactions (optionally filtered by tax year)
    const where: any = {};
    if (startDate && endDate) {
      where.transactionDate = {
        gte: startDate,
        lte: endDate,
      };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { transactionDate: 'asc' },
    });

    // Convert to calculator input format
    const transactionInputs = transactions.map((tx) => ({
      id: tx.id,
      type: tx.type,
      btcAmount: toDecimal(tx.btcAmount),
      fiatAmount: toDecimal(tx.fiatAmount),
      feeAmount: tx.feeAmount ? toDecimal(tx.feeAmount) : null,
      feeCurrency: tx.feeCurrency,
      price: toDecimal(tx.price),
      transactionDate: tx.transactionDate,
    }));

    // Calculate WAC for all transactions
    const calculations = calculateWACForTransactions(
      transactionInputs,
      openingBalance,
      openingCostBasis
    );

    // Delete existing calculations for these transactions
    await prisma.wACCalculation.deleteMany({
      where: {
        transactionId: {
          in: transactions.map((tx) => tx.id),
        },
      },
    });

    // Create new calculations
    await prisma.$transaction(
      calculations.map((calc) =>
        prisma.wACCalculation.create({
          data: {
            transactionId: calc.transactionId,
            runningBalance: calc.runningBalance,
            runningCost: calc.runningCost,
            wacPrice: calc.wacPrice,
            costBasis: calc.costBasis,
            capitalGain: calc.capitalGain,
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      calculationsCreated: calculations.length,
    });
  } catch (error) {
    console.error('Calculation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Calculation failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taxYearId = searchParams.get('taxYearId');

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (taxYearId) {
      const taxYear = await prisma.taxYear.findUnique({
        where: { id: taxYearId },
      });

      if (taxYear) {
        startDate = taxYear.startDate;
        endDate = taxYear.endDate;
      }
    }

    const where: any = {};
    if (startDate && endDate) {
      where.transaction = {
        transactionDate: {
          gte: startDate,
          lte: endDate,
        },
      };
    }

    const calculations = await prisma.wACCalculation.findMany({
      where,
      include: {
        transaction: true,
      },
      orderBy: {
        transaction: {
          transactionDate: 'asc',
        },
      },
    });

    return NextResponse.json(calculations);
  } catch (error) {
    console.error('Error fetching calculations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calculations' },
      { status: 500 }
    );
  }
}
