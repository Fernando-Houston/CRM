import { prisma } from '@/lib/prisma';

interface EnrichmentData {
  linkedinProfile?: {
    title?: string;
    company?: string;
    industry?: string;
    location?: string;
    profileUrl?: string;
  };
  companyInfo?: {
    name?: string;
    size?: string;
    industry?: string;
    revenue?: string;
    website?: string;
  };
  propertyHistory?: {
    transactions?: Array<{
      address: string;
      date: string;
      price: number;
      type: string;
    }>;
    totalValue?: number;
    transactionCount?: number;
  };
  creditEstimate?: {
    score?: number;
    capacity?: 'high' | 'medium' | 'low';
    indicators?: string[];
  };
  socialMedia?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
}

class LeadIntelligenceService {
  /**
   * Enrich lead with external data sources
   */
  async enrichLead(leadId: string): Promise<void> {
    try {
      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
        include: { contact: true },
      });

      if (!lead) {
        console.error(`Lead not found: ${leadId}`);
        return;
      }

      const enrichmentData: EnrichmentData = {};

      // Parallel enrichment from multiple sources
      await Promise.allSettled([
        this.enrichLinkedIn(lead, enrichmentData),
        this.enrichCompanyInfo(lead, enrichmentData),
        this.enrichPropertyHistory(lead, enrichmentData),
        this.enrichCreditEstimate(lead, enrichmentData),
        this.enrichSocialMedia(lead, enrichmentData),
      ]);

      // Update lead with enrichment data
      await prisma.lead.update({
        where: { id: leadId },
        data: {
          enrichmentData,
          lastEnriched: new Date(),
          priority: this.calculatePriority(lead, enrichmentData),
          assignedToId: await this.autoAssignLead(lead, enrichmentData),
        },
      });

      // Create enrichment interaction
      await prisma.interaction.create({
        data: {
          leadId,
          type: 'lead_enrichment',
          method: 'automatic',
          notes: `Lead enriched with ${Object.keys(enrichmentData).length} data sources`,
          enrichmentData,
        },
      });

      console.log(`Lead ${leadId} enriched successfully`);
    } catch (error) {
      console.error(`Error enriching lead ${leadId}:`, error);
    }
  }

  /**
   * Enrich LinkedIn profile information
   */
  private async enrichLinkedIn(lead: any, enrichmentData: EnrichmentData): Promise<void> {
    try {
      // Simulate LinkedIn API call
      // In production, integrate with LinkedIn Sales Navigator API
      const linkedinData = await this.simulateLinkedInLookup(lead.email, lead.firstName, lead.lastName);
      
      if (linkedinData) {
        enrichmentData.linkedinProfile = linkedinData;
      }
    } catch (error) {
      console.error('LinkedIn enrichment error:', error);
    }
  }

  /**
   * Enrich company information
   */
  private async enrichCompanyInfo(lead: any, enrichmentData: EnrichmentData): Promise<void> {
    try {
      if (lead.company) {
        // Simulate company lookup API
        // In production, integrate with Clearbit, Apollo, or similar
        const companyData = await this.simulateCompanyLookup(lead.company);
        
        if (companyData) {
          enrichmentData.companyInfo = companyData;
        }
      }
    } catch (error) {
      console.error('Company enrichment error:', error);
    }
  }

  /**
   * Enrich property transaction history
   */
  private async enrichPropertyHistory(lead: any, enrichmentData: EnrichmentData): Promise<void> {
    try {
      // Simulate property history lookup
      // In production, integrate with MLS, county records, or property APIs
      const propertyData = await this.simulatePropertyHistoryLookup(lead.email, lead.firstName, lead.lastName);
      
      if (propertyData) {
        enrichmentData.propertyHistory = propertyData;
      }
    } catch (error) {
      console.error('Property history enrichment error:', error);
    }
  }

  /**
   * Enrich credit estimate
   */
  private async enrichCreditEstimate(lead: any, enrichmentData: EnrichmentData): Promise<void> {
    try {
      // Simulate credit estimate
      // In production, integrate with credit bureaus or financial APIs
      const creditData = await this.simulateCreditEstimate(lead.email, lead.company);
      
      if (creditData) {
        enrichmentData.creditEstimate = creditData;
      }
    } catch (error) {
      console.error('Credit estimate enrichment error:', error);
    }
  }

  /**
   * Enrich social media profiles
   */
  private async enrichSocialMedia(lead: any, enrichmentData: EnrichmentData): Promise<void> {
    try {
      // Simulate social media lookup
      const socialData = await this.simulateSocialMediaLookup(lead.email, lead.firstName, lead.lastName);
      
      if (socialData) {
        enrichmentData.socialMedia = socialData;
      }
    } catch (error) {
      console.error('Social media enrichment error:', error);
    }
  }

  /**
   * Calculate lead priority based on enrichment data
   */
  private calculatePriority(lead: any, enrichmentData: EnrichmentData): 'high' | 'medium' | 'low' {
    let score = 0;

    // Company size scoring
    if (enrichmentData.companyInfo?.size) {
      const size = enrichmentData.companyInfo.size.toLowerCase();
      if (size.includes('enterprise') || size.includes('1000+')) score += 3;
      else if (size.includes('mid') || size.includes('100-999')) score += 2;
      else if (size.includes('small') || size.includes('10-99')) score += 1;
    }

    // Property history scoring
    if (enrichmentData.propertyHistory?.totalValue) {
      if (enrichmentData.propertyHistory.totalValue > 1000000) score += 3;
      else if (enrichmentData.propertyHistory.totalValue > 500000) score += 2;
      else if (enrichmentData.propertyHistory.totalValue > 100000) score += 1;
    }

    // Credit capacity scoring
    if (enrichmentData.creditEstimate?.capacity === 'high') score += 2;
    else if (enrichmentData.creditEstimate?.capacity === 'medium') score += 1;

    // LinkedIn profile scoring
    if (enrichmentData.linkedinProfile?.title) {
      const title = enrichmentData.linkedinProfile.title.toLowerCase();
      if (title.includes('ceo') || title.includes('president') || title.includes('owner')) score += 3;
      else if (title.includes('director') || title.includes('manager')) score += 2;
      else if (title.includes('associate') || title.includes('coordinator')) score += 1;
    }

    // Budget scoring
    if (lead.budget) {
      const budget = lead.budget.toLowerCase();
      if (budget.includes('1m+') || budget.includes('million')) score += 3;
      else if (budget.includes('500k') || budget.includes('750k')) score += 2;
      else if (budget.includes('100k') || budget.includes('250k')) score += 1;
    }

    if (score >= 6) return 'high';
    if (score >= 3) return 'medium';
    return 'low';
  }

  /**
   * Auto-assign lead to appropriate team member
   */
  private async autoAssignLead(lead: any, enrichmentData: EnrichmentData): Promise<string | null> {
    try {
      // Get available team members
      const teamMembers = await prisma.user.findMany({
        where: {
          role: { in: ['agent', 'manager'] },
          isActive: true,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          specialties: true,
          currentWorkload: true,
        },
      });

      if (teamMembers.length === 0) return null;

      // Score team members based on fit
      const scoredMembers = teamMembers.map(member => {
        let score = 0;

        // Workload scoring (prefer less busy members)
        score += (10 - (member.currentWorkload || 0)) * 2;

        // Specialty matching
        if (member.specialties && lead.interests) {
          const matchingSpecialties = member.specialties.filter((specialty: string) =>
            lead.interests.some((interest: string) =>
              interest.toLowerCase().includes(specialty.toLowerCase())
            )
          );
          score += matchingSpecialties.length * 3;
        }

        // Property type matching
        if (member.specialties && lead.propertyType) {
          const hasPropertyTypeSpecialty = member.specialties.some((specialty: string) =>
            specialty.toLowerCase().includes(lead.propertyType.toLowerCase())
          );
          if (hasPropertyTypeSpecialty) score += 2;
        }

        return { ...member, score };
      });

      // Return the highest scoring member
      const bestMatch = scoredMembers.reduce((prev, current) =>
        prev.score > current.score ? prev : current
      );

      return bestMatch.id;
    } catch (error) {
      console.error('Auto-assignment error:', error);
      return null;
    }
  }

  // Simulation methods for development
  private async simulateLinkedInLookup(email: string, firstName?: string, lastName?: string) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Return mock data
    return {
      title: 'Senior Development Manager',
      company: 'Houston Development Corp',
      industry: 'Real Estate Development',
      location: 'Houston, TX',
      profileUrl: `https://linkedin.com/in/${firstName?.toLowerCase()}-${lastName?.toLowerCase()}`,
    };
  }

  private async simulateCompanyLookup(companyName: string) {
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    return {
      name: companyName,
      size: '50-200 employees',
      industry: 'Real Estate Development',
      revenue: '$10M - $50M',
      website: `https://${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
    };
  }

  private async simulatePropertyHistoryLookup(email: string, firstName?: string, lastName?: string) {
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000));

    return {
      transactions: [
        {
          address: '123 Main St, Houston, TX',
          date: '2022-03-15',
          price: 750000,
          type: 'purchase',
        },
        {
          address: '456 Oak Ave, Houston, TX',
          date: '2021-08-22',
          price: 1200000,
          type: 'sale',
        },
      ],
      totalValue: 1950000,
      transactionCount: 2,
    };
  }

  private async simulateCreditEstimate(email: string, company?: string) {
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

    return {
      score: 750 + Math.floor(Math.random() * 100),
      capacity: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as 'high' | 'medium' | 'low',
      indicators: ['Good payment history', 'Low debt utilization', 'Long credit history'],
    };
  }

  private async simulateSocialMediaLookup(email: string, firstName?: string, lastName?: string) {
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));

    return {
      twitter: `@${firstName?.toLowerCase()}${lastName?.toLowerCase()}`,
      facebook: `https://facebook.com/${firstName?.toLowerCase()}.${lastName?.toLowerCase()}`,
      instagram: `@${firstName?.toLowerCase()}_${lastName?.toLowerCase()}`,
    };
  }

  /**
   * Get enrichment statistics
   */
  async getEnrichmentStats() {
    const stats = await prisma.lead.groupBy({
      by: ['priority'],
      _count: {
        id: true,
      },
      where: {
        lastEnriched: {
          not: null,
        },
      },
    });

    return stats;
  }

  /**
   * Batch enrich leads
   */
  async batchEnrichLeads(leadIds: string[]) {
    const results = await Promise.allSettled(
      leadIds.map(leadId => this.enrichLead(leadId))
    );

    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;

    return { successful, failed, total: leadIds.length };
  }
}

export const leadIntelligenceService = new LeadIntelligenceService(); 