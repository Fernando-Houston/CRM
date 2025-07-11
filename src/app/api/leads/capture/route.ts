import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { leadIntelligenceService } from '@/lib/services/leadIntelligence';
import { z } from 'zod';

// Validation schema for lead capture
const LeadCaptureSchema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  source: z.enum([
    'roi_calculator',
    'market_report',
    'newsletter_signup',
    'tool_usage',
    'consultation_request',
    'zoning_alert',
    'website_contact',
    'social_media',
    'referral'
  ]),
  sourceDetails: z.object({
    pageUrl: z.string().optional(),
    formData: z.record(z.any()).optional(),
    utmSource: z.string().optional(),
    utmMedium: z.string().optional(),
    utmCampaign: z.string().optional(),
    userAgent: z.string().optional(),
    ipAddress: z.string().optional(),
  }).optional(),
  interests: z.array(z.string()).optional(),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  propertyType: z.string().optional(),
  location: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = LeadCaptureSchema.parse(body);

    // Check if lead already exists
    const existingLead = await prisma.lead.findFirst({
      where: {
        email: validatedData.email,
      },
      include: {
        contact: true,
      },
    });

    if (existingLead) {
      // Update existing lead with new source information
      const updatedLead = await prisma.lead.update({
        where: { id: existingLead.id },
        data: {
          sources: {
            push: validatedData.source,
          },
          lastActivity: new Date(),
          status: existingLead.status === 'new' ? 'contacted' : existingLead.status,
        },
      });

      // Add interaction record
      await prisma.interaction.create({
        data: {
          leadId: existingLead.id,
          type: 'lead_capture',
          method: validatedData.source,
          notes: `Lead captured from ${validatedData.source}`,
          sourceDetails: validatedData.sourceDetails,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Lead updated successfully',
        leadId: existingLead.id,
        isNew: false,
      });
    }

    // Create new lead
    const newLead = await prisma.lead.create({
      data: {
        email: validatedData.email,
        firstName: validatedData.firstName || '',
        lastName: validatedData.lastName || '',
        phone: validatedData.phone || '',
        company: validatedData.company || '',
        sources: [validatedData.source],
        status: 'new',
        priority: 'medium',
        interests: validatedData.interests || [],
        budget: validatedData.budget || '',
        timeline: validatedData.timeline || '',
        propertyType: validatedData.propertyType || '',
        location: validatedData.location || '',
        sourceDetails: validatedData.sourceDetails || {},
        assignedToId: null, // Will be auto-assigned by intelligence service
      },
    });

    // Create contact record
    await prisma.contact.create({
      data: {
        leadId: newLead.id,
        email: validatedData.email,
        firstName: validatedData.firstName || '',
        lastName: validatedData.lastName || '',
        phone: validatedData.phone || '',
        company: validatedData.company || '',
        isPrimary: true,
      },
    });

    // Add interaction record
    await prisma.interaction.create({
      data: {
        leadId: newLead.id,
        type: 'lead_capture',
        method: validatedData.source,
        notes: `New lead captured from ${validatedData.source}`,
        sourceDetails: validatedData.sourceDetails,
      },
    });

    // Trigger lead intelligence enrichment (async)
    leadIntelligenceService.enrichLead(newLead.id).catch(console.error);

    return NextResponse.json({
      success: true,
      message: 'Lead captured successfully',
      leadId: newLead.id,
      isNew: true,
    });

  } catch (error) {
    console.error('Lead capture error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid data format', errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve capture statistics
export async function GET() {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [todayLeads, weekLeads, monthLeads, sourceStats] = await Promise.all([
      // Today's leads
      prisma.lead.count({
        where: {
          createdAt: {
            gte: startOfDay,
          },
        },
      }),
      // This week's leads
      prisma.lead.count({
        where: {
          createdAt: {
            gte: startOfWeek,
          },
        },
      }),
      // This month's leads
      prisma.lead.count({
        where: {
          createdAt: {
            gte: startOfMonth,
          },
        },
      }),
      // Source statistics
      prisma.lead.groupBy({
        by: ['sources'],
        _count: {
          id: true,
        },
        where: {
          createdAt: {
            gte: startOfMonth,
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        today: todayLeads,
        thisWeek: weekLeads,
        thisMonth: monthLeads,
        sourceBreakdown: sourceStats,
      },
    });

  } catch (error) {
    console.error('Lead capture stats error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve statistics' },
      { status: 500 }
    );
  }
} 