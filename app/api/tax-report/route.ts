import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Decimal from 'decimal.js';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taxYearId = searchParams.get('taxYearId');

    if (!taxYearId) {
      return NextResponse.json(
        { error: 'Tax year ID is required' },
        { status: 400 }
      );
    }

    const taxYear = await prisma.taxYear.findUnique({
      where: { id: taxYearId },
    });

    if (!taxYear) {
      return NextResponse.json(
        { error: 'Tax year not found' },
        { status: 404 }
      );
    }

    // Get all calculations for the tax year
    const calculations = await prisma.wACCalculation.findMany({
      where: {
        transaction: {
          transactionDate: {
            gte: taxYear.startDate,
            lte: taxYear.endDate,
          },
        },
      },
      include: {
        transaction: true,
      },
      orderBy: {
        transaction: {
          transactionDate: 'asc',
        },
      },
    });

    // Calculate summary statistics
    let totalProceeds = new Decimal(0);
    let totalCostBasis = new Decimal(0);
    let netCapitalGain = new Decimal(0);

    const disposals = calculations.filter((calc) => calc.capitalGain !== null);

    for (const disposal of disposals) {
      const gain = new Decimal(disposal.capitalGain!.toString());
      const costBasis = new Decimal(disposal.costBasis.toString());
      const proceeds = costBasis.plus(gain);

      totalProceeds = totalProceeds.plus(proceeds);
      totalCostBasis = totalCostBasis.plus(costBasis);
      netCapitalGain = netCapitalGain.plus(gain);
    }

    // Get final balance
    const lastCalculation = calculations[calculations.length - 1];
    const closingBalance = lastCalculation
      ? new Decimal(lastCalculation.runningBalance.toString())
      : new Decimal(0);
    const closingCostBasis = lastCalculation
      ? new Decimal(lastCalculation.runningCost.toString())
      : new Decimal(0);
    const closingWac = lastCalculation
      ? new Decimal(lastCalculation.wacPrice.toString())
      : new Decimal(0);

    return NextResponse.json({
      taxYear,
      summary: {
        totalProceeds: totalProceeds.toFixed(2),
        totalCostBasis: totalCostBasis.toFixed(2),
        netCapitalGain: netCapitalGain.toFixed(2),
        numberOfDisposals: disposals.length,
        closingBalance: closingBalance.toFixed(8),
        closingCostBasis: closingCostBasis.toFixed(2),
        closingWac: closingWac.toFixed(2),
      },
      calculations: calculations.map((calc) => ({
        id: calc.id,
        date: calc.transaction.transactionDate,
        source: calc.transaction.source,
        type: calc.transaction.type,
        btcAmount: calc.transaction.btcAmount,
        fiatAmount: calc.transaction.fiatAmount,
        price: calc.transaction.price,
        wacPrice: calc.wacPrice,
        costBasis: calc.costBasis,
        capitalGain: calc.capitalGain,
        runningBalance: calc.runningBalance,
      })),
    });
  } catch (error) {
    console.error('Error generating tax report:', error);
    return NextResponse.json(
      { error: 'Failed to generate tax report' },
      { status: 500 }
    );
  }
}
