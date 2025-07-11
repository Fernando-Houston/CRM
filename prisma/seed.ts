import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('password123', 12)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@houstonlandguy.com' },
    update: {},
    create: {
      email: 'admin@houstonlandguy.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  // Create manager user
  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@houstonlandguy.com' },
    update: {},
    create: {
      email: 'manager@houstonlandguy.com',
      name: 'Sarah Johnson',
      password: hashedPassword,
      role: 'MANAGER',
    },
  })

  // Create agent user
  const agentUser = await prisma.user.upsert({
    where: { email: 'agent@houstonlandguy.com' },
    update: {},
    create: {
      email: 'agent@houstonlandguy.com',
      name: 'Mike Wilson',
      password: hashedPassword,
      role: 'AGENT',
    },
  })

  // Create sample leads
  const leads = await Promise.all([
    prisma.lead.create({
      data: {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john@abcdev.com',
        phone: '(713) 555-0123',
        company: 'ABC Development',
        jobTitle: 'CEO',
        source: 'WEBSITE',
        status: 'NEW',
        priority: 'HIGH',
        budget: 5000000,
        timeline: '6-12 months',
        propertyType: ['COMMERCIAL', 'MIXED_USE'],
        location: 'Downtown Houston',
        assignedTo: managerUser.id,
        notes: 'Interested in downtown development opportunities. Has experience with mixed-use projects.',
      },
    }),
    prisma.lead.create({
      data: {
        firstName: 'Maria',
        lastName: 'Garcia',
        email: 'maria@houstonprops.com',
        phone: '(713) 555-0456',
        company: 'Houston Properties LLC',
        jobTitle: 'Development Manager',
        source: 'REFERRAL',
        status: 'CONTACTED',
        priority: 'MEDIUM',
        budget: 3000000,
        timeline: '3-6 months',
        propertyType: ['RESIDENTIAL', 'MULTIFAMILY'],
        location: 'Houston Heights',
        assignedTo: agentUser.id,
        notes: 'Looking for residential development opportunities in emerging neighborhoods.',
      },
    }),
    prisma.lead.create({
      data: {
        firstName: 'David',
        lastName: 'Chen',
        email: 'david@cheninvest.com',
        phone: '(713) 555-0789',
        company: 'Chen Investments',
        jobTitle: 'Investment Director',
        source: 'COLD_CALL',
        status: 'QUALIFIED',
        priority: 'HIGH',
        budget: 8000000,
        timeline: '12-18 months',
        propertyType: ['COMMERCIAL', 'OFFICE'],
        location: 'Medical Center',
        assignedTo: managerUser.id,
        notes: 'High net worth investor interested in medical office developments.',
      },
    }),
  ])

  // Create sample properties
  const properties = await Promise.all([
    prisma.property.create({
      data: {
        name: 'Downtown Mixed-Use Development',
        address: '1200 Main Street',
        city: 'Houston',
        state: 'TX',
        zipCode: '77002',
        county: 'Harris',
        propertyType: 'MIXED_USE',
        landSize: 2.5,
        buildingSize: 150000,
        zoning: 'Mixed-Use',
        currentUse: 'Vacant Land',
        potentialUse: 'Mixed-Use Development',
        price: 8500000,
        pricePerSqFt: 56.67,
        capRate: 6.5,
        noi: 552500,
        yearBuilt: null,
        condition: 'NEEDS_RENOVATION',
        features: ['Downtown Location', 'Transit Access', 'Parking Available'],
        images: [],
      },
    }),
    prisma.property.create({
      data: {
        name: 'Heights Residential Development',
        address: '4500 Yale Street',
        city: 'Houston',
        state: 'TX',
        zipCode: '77018',
        county: 'Harris',
        propertyType: 'RESIDENTIAL',
        landSize: 1.2,
        buildingSize: 8000,
        zoning: 'Residential',
        currentUse: 'Single Family',
        potentialUse: 'Multi-Family Development',
        price: 1200000,
        pricePerSqFt: 150.00,
        capRate: 5.2,
        noi: 62400,
        yearBuilt: 1950,
        condition: 'FAIR',
        features: ['Historic District', 'Walkable Location', 'Good Schools'],
        images: [],
      },
    }),
  ])

  // Create sample deals
  const deals = await Promise.all([
    prisma.deal.create({
      data: {
        title: 'Downtown Mixed-Use Development Deal',
        description: 'Development of a mixed-use property in downtown Houston',
        leadId: leads[0].id,
        assignedTo: managerUser.id,
        status: 'ACTIVE',
        stage: 'NEGOTIATION',
        value: 8500000,
        probability: 75,
        expectedCloseDate: new Date('2024-06-30'),
        source: 'LEAD_CONVERSION',
        notes: 'Negotiating final terms and financing structure.',
        properties: {
          connect: [{ id: properties[0].id }],
        },
      },
    }),
    prisma.deal.create({
      data: {
        title: 'Heights Residential Development',
        description: 'Multi-family residential development in Houston Heights',
        leadId: leads[1].id,
        assignedTo: agentUser.id,
        status: 'OPPORTUNITY',
        stage: 'PROPOSAL',
        value: 1200000,
        probability: 60,
        expectedCloseDate: new Date('2024-04-30'),
        source: 'LEAD_CONVERSION',
        notes: 'Preparing development proposal and financial analysis.',
        properties: {
          connect: [{ id: properties[1].id }],
        },
      },
    }),
  ])

  // Create sample tasks
  await Promise.all([
    prisma.task.create({
      data: {
        title: 'Follow up with John Smith',
        description: 'Schedule a call to discuss downtown development opportunities',
        leadId: leads[0].id,
        dealId: deals[0].id,
        assignedTo: managerUser.id,
        assignedBy: adminUser.id,
        status: 'PENDING',
        priority: 'HIGH',
        dueDate: new Date(),
        taskType: 'CALL',
        notes: 'Client is interested in downtown mixed-use development.',
      },
    }),
    prisma.task.create({
      data: {
        title: 'Site visit - Downtown property',
        description: 'Conduct site visit for downtown mixed-use development',
        dealId: deals[0].id,
        assignedTo: managerUser.id,
        assignedBy: adminUser.id,
        status: 'PENDING',
        priority: 'MEDIUM',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        taskType: 'SITE_VISIT',
        notes: 'Inspect current condition and assess development potential.',
      },
    }),
    prisma.task.create({
      data: {
        title: 'Send proposal to Maria Garcia',
        description: 'Prepare and send development proposal for Heights property',
        leadId: leads[1].id,
        dealId: deals[1].id,
        assignedTo: agentUser.id,
        assignedBy: managerUser.id,
        status: 'PENDING',
        priority: 'HIGH',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        taskType: 'PROPOSAL',
        notes: 'Include financial analysis and development timeline.',
      },
    }),
  ])

  // Create sample interactions
  await Promise.all([
    prisma.interaction.create({
      data: {
        leadId: leads[0].id,
        dealId: deals[0].id,
        userId: managerUser.id,
        type: 'PHONE_CALL',
        subject: 'Initial Contact',
        content: 'Had initial call with John Smith. He is very interested in downtown development opportunities and has experience with mixed-use projects. Budget is around $5M.',
        duration: 30,
        outcome: 'POSITIVE',
        nextAction: 'Schedule site visit',
      },
    }),
    prisma.interaction.create({
      data: {
        leadId: leads[1].id,
        dealId: deals[1].id,
        userId: agentUser.id,
        type: 'EMAIL',
        subject: 'Property Information Request',
        content: 'Sent property information and preliminary analysis to Maria Garcia. She is interested in the Heights location and wants to see more details.',
        outcome: 'POSITIVE',
        nextAction: 'Prepare detailed proposal',
      },
    }),
  ])

  console.log('✅ Database seeded successfully!')
  console.log(`👥 Created ${3} users`)
  console.log(`🎯 Created ${leads.length} leads`)
  console.log(`🏢 Created ${properties.length} properties`)
  console.log(`💰 Created ${deals.length} deals`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 