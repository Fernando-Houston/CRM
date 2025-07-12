import { opportunityTrackingService } from '../opportunityTracking'
import { prisma } from '@/lib/db'

// Mock the prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    lead: {
      findUnique: jest.fn(),
    },
    property: {
      findMany: jest.fn(),
    },
    deal: {
      findMany: jest.fn(),
    },
    leadPropertyInterest: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}))

describe('OpportunityTrackingService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getLeadInterests', () => {
    it('should extract lead interests correctly', async () => {
      const mockLead = {
        id: '1',
        email: 'test@example.com',
        interests: ['Residential Development', 'Katy Area', 'Investment Properties'],
        location: 'Katy, TX',
        propertyType: 'residential',
        budget: '$1M - $2M',
        timeline: '3-6 months',
        enrichmentData: {
          propertyHistory: {
            transactions: [
              { type: 'development', price: 1500000 },
            ],
          },
        },
      }

      ;(prisma.lead.findUnique as jest.Mock).mockResolvedValue(mockLead)

      const interests = await opportunityTrackingService.getLeadInterests('1')

      expect(interests.neighborhoods).toContain('Katy')
      expect(interests.projectTypes).toContain('residential')
      expect(interests.budgetRange).toBe('$1M - $2M')
      expect(interests.timeline).toBe('3-6 months')
      expect(interests.developmentExperience).toBe('experienced')
    })

    it('should handle lead with no interests', async () => {
      const mockLead = {
        id: '2',
        email: 'test2@example.com',
        interests: [],
        enrichmentData: {},
      }

      ;(prisma.lead.findUnique as jest.Mock).mockResolvedValue(mockLead)

      const interests = await opportunityTrackingService.getLeadInterests('2')

      expect(interests.neighborhoods).toHaveLength(0)
      expect(interests.projectTypes).toHaveLength(0)
      expect(interests.developmentExperience).toBe('none')
    })
  })

  describe('findMatchingProperties', () => {
    it('should find matching properties with high scores', async () => {
      const mockLead = {
        id: '1',
        email: 'test@example.com',
        interests: ['Katy Area', 'Residential Development'],
        location: 'Katy, TX',
        budget: '$1M - $2M',
        timeline: '3-6 months',
        enrichmentData: {},
      }

      const mockProperties = [
        {
          id: 'prop1',
          address: '123 Main St, Katy, TX',
          neighborhood: 'Katy',
          type: 'residential',
          listPrice: 1500000,
          status: 'available',
          developmentScore: 85,
          zoning: 'residential',
          lotSize: 2.5,
          leadInterests: [],
          showings: [],
          offers: [],
        },
        {
          id: 'prop2',
          address: '456 Oak Ave, Woodlands, TX',
          neighborhood: 'Woodlands',
          type: 'commercial',
          listPrice: 3000000,
          status: 'available',
          developmentScore: 70,
          zoning: 'commercial',
          lotSize: 5.0,
          leadInterests: [],
          showings: [],
          offers: [],
        },
      ]

      ;(prisma.lead.findUnique as jest.Mock).mockResolvedValue(mockLead)
      ;(prisma.property.findMany as jest.Mock).mockResolvedValue(mockProperties)

      const matches = await opportunityTrackingService.findMatchingProperties('1', 5)

      expect(matches).toHaveLength(2)
      expect(matches[0].matchScore).toBeGreaterThan(matches[1].matchScore)
      expect(matches[0].reasoning).toContain('Perfect budget fit')
      expect(matches[0].nextSteps).toContain('Schedule property viewing')
    })

    it('should filter out low-scoring matches', async () => {
      const mockLead = {
        id: '1',
        email: 'test@example.com',
        interests: ['Katy Area'],
        budget: '$500K - $1M',
        enrichmentData: {},
      }

      const mockProperties = [
        {
          id: 'prop1',
          address: '123 Main St, Katy, TX',
          neighborhood: 'Katy',
          type: 'residential',
          listPrice: 500000,
          status: 'available',
          developmentScore: 85,
          zoning: 'residential',
          lotSize: 2.5,
          leadInterests: [],
          showings: [],
          offers: [],
        },
        {
          id: 'prop2',
          address: '456 Oak Ave, Pearland, TX',
          neighborhood: 'Pearland',
          type: 'industrial',
          listPrice: 5000000,
          status: 'available',
          developmentScore: 30,
          zoning: 'industrial',
          lotSize: 10.0,
          leadInterests: [],
          showings: [],
          offers: [],
        },
      ]

      ;(prisma.lead.findUnique as jest.Mock).mockResolvedValue(mockLead)
      ;(prisma.property.findMany as jest.Mock).mockResolvedValue(mockProperties)

      const matches = await opportunityTrackingService.findMatchingProperties('1', 5)

      expect(matches).toHaveLength(1)
      expect(matches[0].propertyId).toBe('prop1')
    })
  })

  describe('getPipelineMetrics', () => {
    it('should return pipeline metrics', async () => {
      const mockDeals = [
        {
          id: 'deal1',
          stage: 'lead',
          value: 1000000,
          lead: { id: 'lead1' },
        },
        {
          id: 'deal2',
          stage: 'qualified',
          value: 2000000,
          lead: { id: 'lead2' },
        },
        {
          id: 'deal3',
          stage: 'contract',
          value: 1500000,
          lead: { id: 'lead3' },
        },
      ]

      ;(prisma.deal.findMany as jest.Mock).mockResolvedValue(mockDeals)

      const metrics = await opportunityTrackingService.getPipelineMetrics()

      expect(metrics.totalPipelineValue).toBe(4500000)
      expect(metrics.weightedPipelineValue).toBeGreaterThan(0)
      expect(metrics.stageCounts).toHaveProperty('lead', 1)
      expect(metrics.stageCounts).toHaveProperty('qualified', 1)
      expect(metrics.stageCounts).toHaveProperty('contract', 1)
      expect(metrics.conversionRates).toHaveProperty('Lead → Qualified')
      expect(metrics.averageTimeInStage).toHaveProperty('Lead → Qualified')
    })
  })

  describe('getDealStages', () => {
    it('should return all deal stages', () => {
      const stages = opportunityTrackingService.getDealStages()

      expect(stages).toHaveLength(8)
      expect(stages[0].id).toBe('lead')
      expect(stages[7].id).toBe('closed')
      expect(stages[0].probability).toBe(5)
      expect(stages[7].probability).toBe(100)
    })
  })

  describe('getStageProbability', () => {
    it('should return correct probability for each stage', () => {
      expect(opportunityTrackingService.getStageProbability('lead')).toBe(5)
      expect(opportunityTrackingService.getStageProbability('qualified')).toBe(25)
      expect(opportunityTrackingService.getStageProbability('consultation')).toBe(40)
      expect(opportunityTrackingService.getStageProbability('property_identified')).toBe(60)
      expect(opportunityTrackingService.getStageProbability('due_diligence')).toBe(75)
      expect(opportunityTrackingService.getStageProbability('negotiation')).toBe(85)
      expect(opportunityTrackingService.getStageProbability('contract')).toBe(95)
      expect(opportunityTrackingService.getStageProbability('closed')).toBe(100)
    })

    it('should return 0 for unknown stage', () => {
      expect(opportunityTrackingService.getStageProbability('unknown')).toBe(0)
    })
  })

  describe('createPropertyInterest', () => {
    it('should create property interest record', async () => {
      const mockInterest = {
        id: 'interest1',
        leadId: 'lead1',
        propertyId: 'prop1',
        interest: 'high',
        notes: 'Very interested in this property',
        viewedAt: new Date(),
      }

      ;(prisma.leadPropertyInterest.create as jest.Mock).mockResolvedValue(mockInterest)

      const result = await opportunityTrackingService.createPropertyInterest(
        'lead1',
        'prop1',
        'high',
        'Very interested in this property'
      )

      expect(result).toEqual(mockInterest)
      expect(prisma.leadPropertyInterest.create).toHaveBeenCalledWith({
        data: {
          leadId: 'lead1',
          propertyId: 'prop1',
          interest: 'high',
          notes: 'Very interested in this property',
        },
      })
    })
  })

  describe('getLeadPropertyInterests', () => {
    it('should return lead property interests', async () => {
      const mockInterests = [
        {
          id: 'interest1',
          leadId: 'lead1',
          propertyId: 'prop1',
          interest: 'high',
          notes: 'Very interested',
          viewedAt: new Date(),
          property: {
            id: 'prop1',
            address: '123 Main St',
            neighborhood: 'Katy',
          },
        },
      ]

      ;(prisma.leadPropertyInterest.findMany as jest.Mock).mockResolvedValue(mockInterests)

      const interests = await opportunityTrackingService.getLeadPropertyInterests('lead1')

      expect(interests).toEqual(mockInterests)
      expect(prisma.leadPropertyInterest.findMany).toHaveBeenCalledWith({
        where: { leadId: 'lead1' },
        include: { property: true },
        orderBy: { viewedAt: 'desc' },
      })
    })
  })
}) 