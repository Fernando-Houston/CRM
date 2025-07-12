import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const stats = await prisma.lead.groupBy({
      by: ['priority'],
      _count: {
        id: true,
      },
      // Remove where clause since all leads have updatedAt
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