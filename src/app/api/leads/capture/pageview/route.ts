import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Store page view data for analytics
    await prisma.pageView.create({
      data: {
        url: body.url,
        title: body.title,
        referrer: body.referrer,
        sessionId: body.sessionId,
        userAgent: body.userAgent,
        utmSource: body.utmSource,
        utmMedium: body.utmMedium,
        utmCampaign: body.utmCampaign,
        timestamp: new Date(body.timestamp),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Page view tracked successfully',
    });

  } catch (error) {
    console.error('Page view tracking error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to track page view' },
      { status: 500 }
    );
  }
} 