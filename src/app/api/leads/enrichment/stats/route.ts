import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const stats = await prisma.lead.groupBy({
      by: ['priority'],
      _count: {
        id: true,
      },
      where: {
        lastEnriched: {
          not: null,
        },
      },
    });

    return NextResponse.json({
      success: true,
      stats,
    });

  } catch (error) {
    console.error('Enrichment stats error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve enrichment statistics' },
      { status: 500 }
    );
  }
} 