import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Helper function to format source names
function formatSourceName(source: string): string {
  const sourceMap: Record<string, string> = {
    'roi_calculator': 'ROI Calculator',
    'market_report': 'Market Reports',
    'newsletter_signup': 'Newsletter Signup',
    'tool_usage': 'Tool Usage',
    'consultation_request': 'Consultation Requests',
    'zoning_alert': 'Zoning Alerts',
    'website_contact': 'Website Contact',
    'social_media': 'Social Media',
    'referral': 'Referrals',
  };

  return sourceMap[source] || source.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

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

    // Get leads by source
    const leadsBySource = await prisma.lead.groupBy({
      by: ['source'],
      _count: {
        id: true,
      },
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    });

    // Get deals by lead source
    const dealsBySource = await prisma.deal.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
        status: 'WON',
      },
      include: {
        lead: true,
      },
    });

    // Calculate metrics for each source
    const analysis = leadsBySource.map(sourceGroup => {
      const source = sourceGroup.source;
      const totalLeads = sourceGroup._count.id;
      
      // Find deals for this source
      const sourceDeals = dealsBySource.filter(deal => 
        deal.lead?.source === source
      );
      
      const closedDeals = sourceDeals.length;
      const conversionRate = totalLeads > 0 ? ((closedDeals / totalLeads) * 100).toFixed(1) + '%' : '0%';
      
      const totalRevenue = sourceDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
      const avgDealValue = closedDeals > 0 ? totalRevenue / closedDeals : 0;
      
      // Calculate ROI (simplified - would need marketing spend data)
      const estimatedROI = totalLeads > 0 ? ((totalRevenue / (totalLeads * 100)) * 100).toFixed(0) + '%' : '0%';

      return {
        source: formatSourceName(source),
        totalLeads,
        conversionRate,
        avgDealValue: Math.round(avgDealValue),
        totalRevenue: Math.round(totalRevenue),
        roi: estimatedROI,
      };
    });

    // Sort by total revenue
    analysis.sort((a, b) => b.totalRevenue - a.totalRevenue);

    return NextResponse.json({
      success: true,
      analysis,
      timeRange: range,
    });

  } catch (error) {
    console.error('Lead source analysis error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to analyze lead sources' },
      { status: 500 }
    );
  }
} 