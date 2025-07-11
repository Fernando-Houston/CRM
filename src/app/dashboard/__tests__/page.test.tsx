import { render, screen, waitFor } from '@testing-library/react'
import DashboardPage from '../page'

// Mock the API calls
jest.mock('@/lib/services/leadScoring', () => ({
  leadScoringService: {
    getScoringStats: jest.fn().mockResolvedValue([
      { scoreCategory: 'hot', _count: { id: 5 }, _avg: { score: 85 } },
      { scoreCategory: 'warm', _count: { id: 10 }, _avg: { score: 70 } },
      { scoreCategory: 'cold', _count: { id: 15 }, _avg: { score: 45 } },
    ]),
  },
}))

jest.mock('@/lib/services/opportunityTracking', () => ({
  opportunityTrackingService: {
    getPipelineMetrics: jest.fn().mockResolvedValue({
      totalPipelineValue: 5000000,
      weightedPipelineValue: 2500000,
      stageCounts: {
        lead: 5,
        qualified: 3,
        consultation: 2,
        property_identified: 1,
        due_diligence: 1,
        negotiation: 1,
        contract: 1,
        closed: 2,
      },
      conversionRates: {
        'Lead → Qualified': 0.6,
        'Qualified → Consultation': 0.67,
      },
      averageTimeInStage: {
        'Lead → Qualified': 7,
        'Qualified → Consultation': 14,
      },
    }),
  },
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    lead: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: '1',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          score: 85,
          scoreCategory: 'hot',
          createdAt: new Date(),
          contact: {
            firstName: 'John',
            lastName: 'Doe',
          },
        },
      ]),
      count: jest.fn().mockResolvedValue(30),
    },
    deal: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: '1',
          title: 'Katy Development Deal',
          value: 1500000,
          stage: 'qualified',
          createdAt: new Date(),
          lead: {
            contact: {
              firstName: 'John',
              lastName: 'Doe',
            },
          },
        },
      ]),
      count: jest.fn().mockResolvedValue(16),
    },
    task: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: '1',
          title: 'Follow up with John Doe',
          dueDate: new Date(),
          priority: 'high',
          status: 'pending',
          assignedTo: {
            firstName: 'Agent',
            lastName: 'One',
          },
        },
      ]),
    },
  },
}))

describe('DashboardPage', () => {
  it('renders dashboard with metrics', async () => {
    render(<DashboardPage />)

    // Wait for the page to load
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    // Check for key metrics
    expect(screen.getByText('Total Leads')).toBeInTheDocument()
    expect(screen.getByText('Active Deals')).toBeInTheDocument()
    expect(screen.getByText('Pipeline Value')).toBeInTheDocument()
    expect(screen.getByText('Hot Leads')).toBeInTheDocument()

    // Check for recent leads section
    expect(screen.getByText('Recent Leads')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()

    // Check for recent deals section
    expect(screen.getByText('Recent Deals')).toBeInTheDocument()
    expect(screen.getByText('Katy Development Deal')).toBeInTheDocument()

    // Check for tasks section
    expect(screen.getByText('Upcoming Tasks')).toBeInTheDocument()
    expect(screen.getByText('Follow up with John Doe')).toBeInTheDocument()
  })

  it('displays correct metric values', async () => {
    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('30')).toBeInTheDocument() // Total leads
      expect(screen.getByText('16')).toBeInTheDocument() // Active deals
      expect(screen.getByText('$5,000,000')).toBeInTheDocument() // Pipeline value
      expect(screen.getByText('5')).toBeInTheDocument() // Hot leads
    })
  })

  it('shows pipeline chart', async () => {
    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Pipeline Overview')).toBeInTheDocument()
    })
  })

  it('shows lead scoring distribution', async () => {
    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Lead Scoring')).toBeInTheDocument()
      expect(screen.getByText('Hot')).toBeInTheDocument()
      expect(screen.getByText('Warm')).toBeInTheDocument()
      expect(screen.getByText('Cold')).toBeInTheDocument()
    })
  })

  it('displays quick actions', async () => {
    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Quick Actions')).toBeInTheDocument()
      expect(screen.getByText('Add New Lead')).toBeInTheDocument()
      expect(screen.getByText('Create Deal')).toBeInTheDocument()
      expect(screen.getByText('Schedule Task')).toBeInTheDocument()
    })
  })
}) 