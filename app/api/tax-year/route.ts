import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Decimal from 'decimal.js';

export async function GET() {
  try {
    const taxYears = await prisma.taxYear.findMany({
      orderBy: { year: 'desc' },
    });

    return NextResponse.json(taxYears);
  } catch (error) {
    console.error('Error fetching tax years:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tax years' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { year, startDate, endDate, openingBtcBalance, openingCostBasis } = body;

    if (!year || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Year, start date, and end date are required' },
        { status: 400 }
      );
    }

    const btcBalance = new Decimal(openingBtcBalance || 0);
    const costBasis = new Decimal(openingCostBasis || 0);

    // Calculate opening WAC
    const openingWac = btcBalance.greaterThan(0)
      ? costBasis.dividedBy(btcBalance)
      : new Decimal(0);

    const taxYear = await prisma.taxYear.create({
      data: {
        year: parseInt(year),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        openingBtcBalance: btcBalance,
        openingCostBasis: costBasis,
        openingWac,
      },
    });

    return NextResponse.json(taxYear);
  } catch (error) {
    console.error('Error creating tax year:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create tax year' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, openingBtcBalance, openingCostBasis } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Tax year ID is required' },
        { status: 400 }
      );
    }

    const btcBalance = new Decimal(openingBtcBalance);
    const costBasis = new Decimal(openingCostBasis);

    // Calculate opening WAC
    const openingWac = btcBalance.greaterThan(0)
      ? costBasis.dividedBy(btcBalance)
      : new Decimal(0);

    const taxYear = await prisma.taxYear.update({
      where: { id },
      data: {
        openingBtcBalance: btcBalance,
        openingCostBasis: costBasis,
        openingWac,
      },
    });

    return NextResponse.json(taxYear);
  } catch (error) {
    console.error('Error updating tax year:', error);
    return NextResponse.json(
      { error: 'Failed to update tax year' },
      { status: 500 }
    );
  }
}
