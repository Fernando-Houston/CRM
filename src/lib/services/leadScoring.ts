import { prisma } from '@/lib/db';

export interface LeadScore {
  totalScore: number;
  category: 'hot' | 'warm' | 'cold';
  breakdown: {
    websiteEngagement: number;
    contactQuality: number;
    projectIndicators: number;
  };
  details: {
    websiteEngagement: {
      toolUsage: number;
      timeOnSite: number;
      pagesVisited: number;
      returnVisits: number;
    };
    contactQuality: {
      emailProvided: boolean;
      phoneProvided: boolean;
      companyProvided: boolean;
      titleProvided: boolean;
    };
    projectIndicators: {
      budgetMentioned: boolean;
      timelineSpecified: boolean;
      locationPreferences: boolean;
      developmentExperience: 'none' | 'first-time' | 'experienced';
    };
  };
}

export interface WebsiteEngagement {
  toolUsage: string[];
  timeOnSite: number; // in minutes
  pagesVisited: number;
  returnVisits: number;
  lastVisit: Date;
  firstVisit: Date;
}

export interface ContactQuality {
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  linkedinProfile?: {
    title?: string;
    company?: string;
  };
}

export interface ProjectIndicators {
  budget?: string;
  timeline?: string;
  location?: string;
  propertyType?: string;
  developmentExperience?: 'none' | 'first-time' | 'experienced';
  interests?: string[];
}

class LeadScoringService {
  /**
   * Calculate comprehensive lead score based on development industry criteria
   */
  async calculateLeadScore(leadId: string): Promise<LeadScore> {
    try {
      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
        include: {
          contact: true,
          interactions: true,
          enrichmentData: true,
        },
      });

      if (!lead) {
        throw new Error(`Lead not found: ${leadId}`);
      }

      // Get website engagement data
      const websiteEngagement = await this.getWebsiteEngagement(leadId);
      
      // Get contact quality data
      const contactQuality = this.getContactQuality(lead);
      
      // Get project indicators
      const projectIndicators = this.getProjectIndicators(lead);

      // Calculate scores for each category
      const websiteScore = this.calculateWebsiteEngagementScore(websiteEngagement);
      const contactScore = this.calculateContactQualityScore(contactQuality);
      const projectScore = this.calculateProjectIndicatorsScore(projectIndicators);

      const totalScore = websiteScore + contactScore + projectScore;
      const category = this.getLeadCategory(totalScore);

      const score: LeadScore = {
        totalScore,
        category,
        breakdown: {
          websiteEngagement: websiteScore,
          contactQuality: contactScore,
          projectIndicators: projectScore,
        },
        details: {
          websiteEngagement: {
            toolUsage: this.calculateToolUsageScore(websiteEngagement.toolUsage),
            timeOnSite: this.calculateTimeOnSiteScore(websiteEngagement.timeOnSite),
            pagesVisited: this.calculatePagesVisitedScore(websiteEngagement.pagesVisited),
            returnVisits: this.calculateReturnVisitsScore(websiteEngagement.returnVisits),
          },
          contactQuality: {
            emailProvided: !!contactQuality.email,
            phoneProvided: !!contactQuality.phone,
            companyProvided: !!contactQuality.company,
            titleProvided: !!contactQuality.title,
          },
          projectIndicators: {
            budgetMentioned: !!projectIndicators.budget,
            timelineSpecified: !!projectIndicators.timeline,
            locationPreferences: !!projectIndicators.location,
            developmentExperience: projectIndicators.developmentExperience || 'none',
          },
        },
      };

      // Update lead with score
      await prisma.lead.update({
        where: { id: leadId },
        data: {
          score: totalScore,
          scoreCategory: category,
          scoreBreakdown: score.breakdown,
          lastScored: new Date(),
        },
      });

      return score;
    } catch (error) {
      console.error(`Error calculating lead score for ${leadId}:`, error);
      throw error;
    }
  }

  /**
   * Get website engagement data for a lead
   */
  private async getWebsiteEngagement(leadId: string): Promise<WebsiteEngagement> {
    // Get interactions and page views for this lead
    const interactions = await prisma.interaction.findMany({
      where: { leadId },
      orderBy: { createdAt: 'asc' },
    });

    const pageViews = await prisma.pageView.findMany({
      where: { 
        sessionId: { in: interactions.map(i => i.sessionId).filter(Boolean) }
      },
      orderBy: { timestamp: 'asc' },
    });

    // Calculate engagement metrics
    const toolUsage = this.extractToolUsage(interactions);
    const timeOnSite = this.calculateTotalTimeOnSite(pageViews);
    const pagesVisited = pageViews.length;
    const returnVisits = this.calculateReturnVisits(pageViews);
    const lastVisit = pageViews[pageViews.length - 1]?.timestamp || new Date();
    const firstVisit = pageViews[0]?.timestamp || new Date();

    return {
      toolUsage,
      timeOnSite,
      pagesVisited,
      returnVisits,
      lastVisit,
      firstVisit,
    };
  }

  /**
   * Extract tool usage from interactions
   */
  private extractToolUsage(interactions: any[]): string[] {
    const tools = new Set<string>();
    
    interactions.forEach(interaction => {
      if (interaction.type === 'tool_usage') {
        tools.add(interaction.method);
      }
      if (interaction.sourceDetails?.formData?.tool) {
        tools.add(interaction.sourceDetails.formData.tool);
      }
    });

    return Array.from(tools);
  }

  /**
   * Calculate total time on site from page views
   */
  private calculateTotalTimeOnSite(pageViews: any[]): number {
    if (pageViews.length < 2) return 0;

    let totalTime = 0;
    for (let i = 0; i < pageViews.length - 1; i++) {
      const current = new Date(pageViews[i].timestamp);
      const next = new Date(pageViews[i + 1].timestamp);
      const timeDiff = (next.getTime() - current.getTime()) / (1000 * 60); // minutes
      
      // Assume reasonable session time (max 30 minutes between page views)
      if (timeDiff > 0 && timeDiff < 30) {
        totalTime += timeDiff;
      }
    }

    return Math.round(totalTime);
  }

  /**
   * Calculate return visits based on session data
   */
  private calculateReturnVisits(pageViews: any[]): number {
    const sessions = new Set(pageViews.map(pv => pv.sessionId));
    return Math.max(0, sessions.size - 1); // Subtract 1 for first visit
  }

  /**
   * Get contact quality data from lead
   */
  private getContactQuality(lead: any): ContactQuality {
    return {
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      title: lead.enrichmentData?.linkedinProfile?.title,
      linkedinProfile: lead.enrichmentData?.linkedinProfile,
    };
  }

  /**
   * Get project indicators from lead data
   */
  private getProjectIndicators(lead: any): ProjectIndicators {
    return {
      budget: lead.budget,
      timeline: lead.timeline,
      location: lead.location,
      propertyType: lead.propertyType,
      interests: lead.interests,
      developmentExperience: this.determineDevelopmentExperience(lead),
    };
  }

  /**
   * Determine development experience level
   */
  private determineDevelopmentExperience(lead: any): 'none' | 'first-time' | 'experienced' {
    // Check property history from enrichment data
    if (lead.enrichmentData?.propertyHistory?.transactions?.length > 0) {
      const transactions = lead.enrichmentData.propertyHistory.transactions;
      const developmentTransactions = transactions.filter((t: any) => 
        t.type === 'development' || t.type === 'construction'
      );
      
      if (developmentTransactions.length > 2) return 'experienced';
      if (developmentTransactions.length > 0) return 'first-time';
    }

    // Check interests for development-related keywords
    const interests = lead.interests || [];
    const developmentKeywords = ['development', 'construction', 'building', 'project'];
    const hasDevelopmentInterest = interests.some((interest: string) =>
      developmentKeywords.some(keyword => 
        interest.toLowerCase().includes(keyword)
      )
    );

    if (hasDevelopmentInterest) return 'first-time';

    return 'none';
  }

  /**
   * Calculate website engagement score (0-30 points)
   */
  private calculateWebsiteEngagementScore(engagement: WebsiteEngagement): number {
    const toolUsageScore = this.calculateToolUsageScore(engagement.toolUsage);
    const timeOnSiteScore = this.calculateTimeOnSiteScore(engagement.timeOnSite);
    const pagesVisitedScore = this.calculatePagesVisitedScore(engagement.pagesVisited);
    const returnVisitsScore = this.calculateReturnVisitsScore(engagement.returnVisits);

    return toolUsageScore + timeOnSiteScore + pagesVisitedScore + returnVisitsScore;
  }

  private calculateToolUsageScore(toolUsage: string[]): number {
    return toolUsage.length * 5; // +5 per tool
  }

  private calculateTimeOnSiteScore(timeOnSite: number): number {
    return Math.min(timeOnSite, 10); // +1 per minute, max 10
  }

  private calculatePagesVisitedScore(pagesVisited: number): number {
    return pagesVisited * 2; // +2 per page
  }

  private calculateReturnVisitsScore(returnVisits: number): number {
    return returnVisits * 5; // +5 per visit
  }

  /**
   * Calculate contact quality score (0-25 points)
   */
  private calculateContactQualityScore(contact: ContactQuality): number {
    let score = 0;

    if (contact.email) score += 5; // Email only: +5 points
    if (contact.phone) score += 15; // Phone provided: +15 points
    if (contact.company || contact.title) score += 25; // Company/title provided: +25 points

    return score;
  }

  /**
   * Calculate project indicators score (0-45 points)
   */
  private calculateProjectIndicatorsScore(indicators: ProjectIndicators): number {
    let score = 0;

    if (indicators.budget) score += 20; // Budget range mentioned: +20 points
    if (indicators.timeline) score += 15; // Timeline specified: +15 points
    if (indicators.location) score += 10; // Location preferences: +10 points

    // Development experience scoring
    switch (indicators.developmentExperience) {
      case 'first-time':
        score += 15; // +15 points for first-time developers
        break;
      case 'experienced':
        score += 30; // +30 points for experienced developers
        break;
      default:
        // No points for no experience
        break;
    }

    return score;
  }

  /**
   * Determine lead category based on total score
   */
  private getLeadCategory(totalScore: number): 'hot' | 'warm' | 'cold' {
    if (totalScore >= 80) return 'hot';
    if (totalScore >= 60) return 'warm';
    return 'cold';
  }

  /**
   * Batch score multiple leads
   */
  async batchScoreLeads(leadIds: string[]): Promise<{ leadId: string; score: LeadScore }[]> {
    const results = await Promise.allSettled(
      leadIds.map(async (leadId) => {
        const score = await this.calculateLeadScore(leadId);
        return { leadId, score };
      })
    );

    return results
      .filter((result): result is PromiseFulfilledResult<{ leadId: string; score: LeadScore }> => 
        result.status === 'fulfilled'
      )
      .map(result => result.value);
  }

  /**
   * Get scoring statistics
   */
  async getScoringStats() {
    const stats = await prisma.lead.groupBy({
      by: ['scoreCategory'],
      _count: {
        id: true,
      },
      _avg: {
        score: true,
      },
    });

    return stats;
  }

  /**
   * Get leads by score category
   */
  async getLeadsByCategory(category: 'hot' | 'warm' | 'cold', limit = 10) {
    return await prisma.lead.findMany({
      where: {
        scoreCategory: category,
      },
      orderBy: {
        score: 'desc',
      },
      take: limit,
      include: {
        contact: true,
        assignedTo: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  /**
   * Update lead score based on new activity
   */
  async updateScoreOnActivity(leadId: string, activityType: string, activityData: any) {
    // Recalculate score when new activity occurs
    await this.calculateLeadScore(leadId);

    // Log score update
    await prisma.interaction.create({
      data: {
        leadId,
        type: 'score_update',
        method: 'automatic',
        notes: `Score updated due to ${activityType} activity`,
        sourceDetails: activityData,
      },
    });
  }
}

export const leadScoringService = new LeadScoringService(); 