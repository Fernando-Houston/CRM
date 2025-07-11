import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/leads - Get all leads with optional filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const source = searchParams.get('source')
    const search = searchParams.get('search')
    const assignedTo = searchParams.get('assignedTo')

    // Build where clause
    const where: any = {}
    
    if (status && status !== 'ALL') {
      where.status = status
    }
    
    if (priority && priority !== 'ALL') {
      where.priority = priority
    }
    
    if (source && source !== 'ALL') {
      where.source = source
    }
    
    if (assignedTo) {
      where.assignedTo = assignedTo
    }
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ]
    }

    const leads = await prisma.lead.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        contacts: true,
        deals: {
          select: {
            id: true,
            title: true,
            status: true,
            value: true,
          },
        },
        interactions: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(leads)
  } catch (error) {
    console.error('Error fetching leads:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/leads - Create a new lead
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate required fields
    if (!body.firstName || !body.lastName || !body.email) {
      return NextResponse.json(
        { error: 'First name, last name, and email are required' },
        { status: 400 }
      )
    }

    // Check if lead with this email already exists
    const existingLead = await prisma.lead.findUnique({
      where: { email: body.email },
    })

    if (existingLead) {
      return NextResponse.json(
        { error: 'A lead with this email already exists' },
        { status: 409 }
      )
    }

    // Create the lead
    const lead = await prisma.lead.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone || null,
        company: body.company || null,
        jobTitle: body.jobTitle || null,
        source: body.source || 'WEBSITE',
        priority: body.priority || 'MEDIUM',
        budget: body.budget ? parseFloat(body.budget) : null,
        timeline: body.timeline || null,
        propertyType: body.propertyTypes || [],
        location: body.location || null,
        notes: body.notes || null,
        assignedTo: body.assignedTo || null,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    // Create primary contact
    if (lead.id) {
      await prisma.contact.create({
        data: {
          leadId: lead.id,
          firstName: body.firstName,
          lastName: body.lastName,
          email: body.email,
          phone: body.phone || null,
          company: body.company || null,
          jobTitle: body.jobTitle || null,
          isPrimary: true,
        },
      })
    }

    return NextResponse.json(lead, { status: 201 })
  } catch (error) {
    console.error('Error creating lead:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 