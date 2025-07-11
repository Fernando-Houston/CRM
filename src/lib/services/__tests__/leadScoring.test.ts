import { leadScoringService } from '../leadScoring'
import { prisma } from '@/lib/prisma'

// Mock the prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    lead: {
      findUnique: jest.fn(),
      update: jest.fn(),
      groupBy: jest.fn(),
    },
    interaction: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    pageView: {
      findMany: jest.fn(),
    },
  },
}))

describe('LeadScoringService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('calculateLeadScore', () => {
    it('should calculate correct score for a high-quality lead', async () => {
      const mockLead = {
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        company: 'Test Corp',
        budget: '$1M - $2M',
        timeline: '3-6 months',
        location: 'Katy, TX',
        interests: ['Residential Development', 'Investment Properties'],
        enrichmentData: {
          linkedinProfile: {
            title: 'Senior Development Manager',
            company: 'Test Corp',
          },
          propertyHistory: {
            transactions: [
              { type: 'development', price: 1500000 },
              { type: 'development', price: 2000000 },
            ],
          },
        },
      }

      const mockInteractions = [
        { type: 'tool_usage', method: 'roi_calculator' },
        { type: 'tool_usage', method: 'market_report' },
      ]

      const mockPageViews = [
        { timestamp: new Date('2024-01-01T10:00:00Z') },
        { timestamp: new Date('2024-01-01T10:05:00Z') },
        { timestamp: new Date('2024-01-01T10:10:00Z') },
        { timestamp: new Date('2024-01-02T10:00:00Z') },
      ]

      ;(prisma.lead.findUnique as jest.Mock).mockResolvedValue(mockLead)
      ;(prisma.interaction.findMany as jest.Mock).mockResolvedValue(mockInteractions)
      ;(prisma.pageView.findMany as jest.Mock).mockResolvedValue(mockPageViews)
      ;(prisma.lead.update as jest.Mock).mockResolvedValue(mockLead)

      const score = await leadScoringService.calculateLeadScore('1')

      expect(score.totalScore).toBeGreaterThan(80)
      expect(score.category).toBe('hot')
      expect(score.breakdown.websiteEngagement).toBeGreaterThan(0)
      expect(score.breakdown.contactQuality).toBeGreaterThan(0)
      expect(score.breakdown.projectIndicators).toBeGreaterThan(0)
    })

    it('should calculate correct score for a medium-quality lead', async () => {
      const mockLead = {
        id: '2',
        email: 'test2@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '+1234567891',
        budget: '$500K - $1M',
        interests: ['Residential'],
        enrichmentData: {},
      }

      const mockInteractions = [
        { type: 'tool_usage', method: 'roi_calculator' },
      ]

      const mockPageViews = [
        { timestamp: new Date('2024-01-01T10:00:00Z') },
        { timestamp: new Date('2024-01-01T10:05:00Z') },
      ]

      ;(prisma.lead.findUnique as jest.Mock).mockResolvedValue(mockLead)
      ;(prisma.interaction.findMany as jest.Mock).mockResolvedValue(mockInteractions)
      ;(prisma.pageView.findMany as jest.Mock).mockResolvedValue(mockPageViews)
      ;(prisma.lead.update as jest.Mock).mockResolvedValue(mockLead)

      const score = await leadScoringService.calculateLeadScore('2')

      expect(score.totalScore).toBeGreaterThanOrEqual(60)
      expect(score.totalScore).toBeLessThan(80)
      expect(score.category).toBe('warm')
    })

    it('should calculate correct score for a low-quality lead', async () => {
      const mockLead = {
        id: '3',
        email: 'test3@example.com',
        interests: [],
        enrichmentData: {},
      }

      const mockInteractions = []
      const mockPageViews = [
        { timestamp: new Date('2024-01-01T10:00:00Z') },
      ]

      ;(prisma.lead.findUnique as jest.Mock).mockResolvedValue(mockLead)
      ;(prisma.interaction.findMany as jest.Mock).mockResolvedValue(mockInteractions)
      ;(prisma.pageView.findMany as jest.Mock).mockResolvedValue(mockPageViews)
      ;(prisma.lead.update as jest.Mock).mockResolvedValue(mockLead)

      const score = await leadScoringService.calculateLeadScore('3')

      expect(score.totalScore).toBeLessThan(60)
      expect(score.category).toBe('cold')
    })

    it('should handle missing lead gracefully', async () => {
      ;(prisma.lead.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(leadScoringService.calculateLeadScore('999')).rejects.toThrow('Lead not found: 999')
    })
  })

  describe('batchScoreLeads', () => {
    it('should score multiple leads successfully', async () => {
      const mockLead = {
        id: '1',
        email: 'test@example.com',
        interests: [],
        enrichmentData: {},
      }

      const mockInteractions = []
      const mockPageViews = []

      ;(prisma.lead.findUnique as jest.Mock).mockResolvedValue(mockLead)
      ;(prisma.interaction.findMany as jest.Mock).mockResolvedValue(mockInteractions)
      ;(prisma.pageView.findMany as jest.Mock).mockResolvedValue(mockPageViews)
      ;(prisma.lead.update as jest.Mock).mockResolvedValue(mockLead)

      const results = await leadScoringService.batchScoreLeads(['1', '2', '3'])

      expect(results).toHaveLength(3)
      expect(results[0]).toHaveProperty('leadId')
      expect(results[0]).toHaveProperty('score')
    })
  })

  describe('getScoringStats', () => {
    it('should return scoring statistics', async () => {
      const mockStats = [
        { scoreCategory: 'hot', _count: { id: 5 }, _avg: { score: 85 } },
        { scoreCategory: 'warm', _count: { id: 10 }, _avg: { score: 70 } },
        { scoreCategory: 'cold', _count: { id: 15 }, _avg: { score: 45 } },
      ]

      ;(prisma.lead.groupBy as jest.Mock).mockResolvedValue(mockStats)

      const stats = await leadScoringService.getScoringStats()

      expect(stats).toEqual(mockStats)
    })
  })

  describe('getLeadsByCategory', () => {
    it('should return leads by category', async () => {
      const mockLeads = [
        {
          id: '1',
          email: 'test@example.com',
          score: 85,
          contact: { firstName: 'John', lastName: 'Doe' },
          assignedTo: { firstName: 'Agent', lastName: 'One' },
        },
      ]

      ;(prisma.lead.findMany as jest.Mock).mockResolvedValue(mockLeads)

      const leads = await leadScoringService.getLeadsByCategory('hot', 5)

      expect(leads).toEqual(mockLeads)
      expect(prisma.lead.findMany).toHaveBeenCalledWith({
        where: { scoreCategory: 'hot' },
        orderBy: { score: 'desc' },
        take: 5,
        include: {
          contact: true,
          assignedTo: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      })
    })
  })

  describe('updateScoreOnActivity', () => {
    it('should update score and create interaction record', async () => {
      const mockLead = {
        id: '1',
        email: 'test@example.com',
        interests: [],
        enrichmentData: {},
      }

      const mockInteractions = []
      const mockPageViews = []

      ;(prisma.lead.findUnique as jest.Mock).mockResolvedValue(mockLead)
      ;(prisma.interaction.findMany as jest.Mock).mockResolvedValue(mockInteractions)
      ;(prisma.pageView.findMany as jest.Mock).mockResolvedValue(mockPageViews)
      ;(prisma.lead.update as jest.Mock).mockResolvedValue(mockLead)
      ;(prisma.interaction.create as jest.Mock).mockResolvedValue({})

      await leadScoringService.updateScoreOnActivity('1', 'email_sent', { emailId: '123' })

      expect(prisma.interaction.create).toHaveBeenCalledWith({
        data: {
          leadId: '1',
          type: 'score_update',
          method: 'automatic',
          notes: 'Score updated due to email_sent activity',
          sourceDetails: { emailId: '123' },
        },
      })
    })
  })
}) 