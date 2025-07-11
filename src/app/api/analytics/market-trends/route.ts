import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (range) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default: // 30d
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get monthly trends
    const trends = await getMonthlyTrends(startDate, now);

    return NextResponse.json({
      success: true,
      trends,
      timeRange: range,
    });

  } catch (error) {
    console.error('Market trends error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve market trends' },
      { status: 500 }
    );
  }
}

async function getMonthlyTrends(startDate: Date, endDate: Date) {
  // Generate monthly periods
  const months = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const monthStart = new Date(current.getFullYear(), current.getMonth(), 1);
    const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
    
    months.push({
      period: current.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      start: monthStart,
      end: monthEnd,
    });
    
    current.setMonth(current.getMonth() + 1);
  }

  // Get data for each month
  const trends = await Promise.all(
    months.map(async (month) => {
      // Get leads for this month
      const leads = await prisma.lead.count({
        where: {
          createdAt: {
            gte: month.start,
            lte: month.end,
          },
        },
      });

      // Get deals for this month
      const deals = await prisma.deal.findMany({
        where: {
          createdAt: {
            gte: month.start,
            lte: month.end,
          },
          status: 'closed',
        },
      });

      const conversionRate = leads > 0 ? (deals.length / leads) * 100 : 0;
      const avgDealSize = deals.length > 0 
        ? deals.reduce((sum, deal) => sum + (deal.value || 0), 0) / deals.length 
        : 0;

      // Determine market activity based on trends
      let marketActivity: 'increasing' | 'stable' | 'declining' = 'stable';
      if (leads > 50 && conversionRate > 25) marketActivity = 'increasing';
      else if (leads < 20 || conversionRate < 15) marketActivity = 'declining';

      return {
        period: month.period,
        leadVolume: leads,
        conversionRate: Math.round(conversionRate),
        avgDealSize: Math.round(avgDealSize),
        marketActivity,
      };
    })
  );

  return trends;
} 