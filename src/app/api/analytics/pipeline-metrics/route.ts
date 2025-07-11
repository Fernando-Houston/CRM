import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { opportunityTrackingService } from '@/lib/services/opportunityTracking';

export async function GET() {
  try {
    // Get pipeline metrics from the opportunity tracking service
    const metrics = await opportunityTrackingService.getPipelineMetrics();

    return NextResponse.json({
      success: true,
      metrics,
    });

  } catch (error) {
    console.error('Pipeline metrics error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve pipeline metrics' },
      { status: 500 }
    );
  }
} 