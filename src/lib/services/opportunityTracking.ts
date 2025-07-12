import { prisma } from '@/lib/db';

export interface LeadInterests {
  neighborhoods: string[];
  projectTypes: string[];
  budgetRange: string;
  timeline: string;
  propertySize?: string;
  zoningPreferences?: string[];
  developmentExperience: 'none' | 'first-time' | 'experienced';
}

export interface PropertyMatch {
  propertyId: string;
  property: any;
  matchScore: number;
  reasoning: string[];
  nextSteps: string[];
  riskFactors: string[];
  marketConditions: string;
}

export interface PipelineMetrics {
  conversionRates: Record<string, string>;
  averageTimeInStage: Record<string, string>;
  stageCounts: Record<string, number>;
  totalPipelineValue: number;
  weightedPipelineValue: number;
}

export interface DealStage {
  id: string;
  name: string;
  order: number;
  probability: number;
  color: string;
  description: string;
}

class OpportunityTrackingService {
  private readonly dealStages: DealStage[] = [
    {
      id: 'lead',
      name: 'Lead',
      order: 1,
      probability: 5,
      color: '#6B7280',
      description: 'Initial contact captured'
    },
    {
      id: 'qualified',
      name: 'Qualified',
      order: 2,
      probability: 25,
      color: '#3B82F6',
      description: 'Meets budget/timeline criteria'
    },
    {
      id: 'consultation',
      name: 'Consultation',
      order: 3,
      probability: 40,
      color: '#8B5CF6',
      description: 'Phone/meeting scheduled'
    },
    {
      id: 'property_identified',
      name: 'Property Identified',
      order: 4,
      probability: 60,
      color: '#F59E0B',
      description: 'Specific opportunity presented'
    },
    {
      id: 'due_diligence',
      name: 'Due Diligence',
      order: 5,
      probability: 75,
      color: '#EF4444',
      description: 'Client evaluating opportunity'
    },
    {
      id: 'negotiation',
      name: 'Negotiation',
      order: 6,
      probability: 85,
      color: '#EC4899',
      description: 'Terms being discussed'
    },
    {
      id: 'contract',
      name: 'Contract',
      order: 7,
      probability: 95,
      color: '#10B981',
      description: 'Deal under contract'
    },
    {
      id: 'closed',
      name: 'Closed',
      order: 8,
      probability: 100,
      color: '#059669',
      description: 'Transaction completed'
    }
  ];

  /**
   * Get lead interests and preferences
   */
  async getLeadInterests(leadId: string): Promise<LeadInterests> {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        enrichmentData: true,
      },
    });

    if (!lead) {
      throw new Error(`Lead not found: ${leadId}`);
    }

    // Extract interests from lead data
    const interests = lead.interests || [];
    const neighborhoods = this.extractNeighborhoods(interests, lead.location);
    const projectTypes = this.extractProjectTypes(interests, lead.propertyType);
    const budgetRange = lead.budget || 'Not specified';
    const timeline = lead.timeline || 'Not specified';
    const developmentExperience = this.determineDevelopmentExperience(lead);

    return {
      neighborhoods,
      projectTypes,
      budgetRange,
      timeline,
      developmentExperience,
    };
  }

  /**
   * Find matching properties for a lead
   */
  async findMatchingProperties(leadId: string, limit = 5): Promise<PropertyMatch[]> {
    const leadInterests = await this.getLeadInterests(leadId);
    const properties = await prisma.property.findMany({
      where: {
        status: 'available',
      },
      include: {
        leadInterests: true,
        showings: true,
        offers: true,
      },
    });

    const matches = properties.map(property => {
      const matchScore = this.calculatePropertyMatchScore(property, leadInterests);
      const reasoning = this.generateMatchReasoning(property, leadInterests);
      const nextSteps = this.generateNextSteps(property, leadInterests);
      const riskFactors = this.assessRiskFactors(property);
      const marketConditions = this.assessMarketConditions(property);

      return {
        propertyId: property.id,
        property,
        matchScore,
        reasoning,
        nextSteps,
        riskFactors,
        marketConditions,
      };
    });

    // Sort by match score and return top matches
    return matches
      .filter(match => match.matchScore > 50) // Only return good matches
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);
  }

  /**
   * Calculate property match score
   */
  private calculatePropertyMatchScore(property: any, interests: LeadInterests): number {
    let score = 0;

    // Budget match (40% weight)
    const budgetMatch = this.calculateBudgetMatch(property.listPrice, interests.budgetRange);
    score += budgetMatch * 0.4;

    // Location match (30% weight)
    const locationMatch = this.calculateLocationMatch(property.neighborhood, interests.neighborhoods);
    score += locationMatch * 0.3;

    // Project type match (20% weight)
    const typeMatch = this.calculateTypeMatch(property.type, interests.projectTypes);
    score += typeMatch * 0.2;

    // Development potential (10% weight)
    const potentialMatch = this.calculateDevelopmentPotential(property, interests);
    score += potentialMatch * 0.1;

    return Math.round(score);
  }

  private calculateBudgetMatch(propertyPrice: number, budgetRange: string): number {
    if (!propertyPrice || budgetRange === 'Not specified') return 50;

    const budget = this.parseBudgetRange(budgetRange);
    if (!budget) return 50;

    const { min, max } = budget;
    const price = propertyPrice;

    if (price >= min && price <= max) return 100;
    if (price >= min * 0.8 && price <= max * 1.2) return 80;
    if (price >= min * 0.6 && price <= max * 1.4) return 60;
    return 30;
  }

  private calculateLocationMatch(propertyNeighborhood: string, preferredNeighborhoods: string[]): number {
    if (preferredNeighborhoods.length === 0) return 50;

    const propertyLower = propertyNeighborhood.toLowerCase();
    const preferredLower = preferredNeighborhoods.map(n => n.toLowerCase());

    if (preferredLower.includes(propertyLower)) return 100;
    if (preferredLower.some(n => propertyLower.includes(n) || n.includes(propertyLower))) return 80;
    return 30;
  }

  private calculateTypeMatch(propertyType: string, preferredTypes: string[]): number {
    if (preferredTypes.length === 0) return 50;

    const propertyLower = propertyType.toLowerCase();
    const preferredLower = preferredTypes.map(t => t.toLowerCase());

    if (preferredLower.includes(propertyLower)) return 100;
    if (preferredLower.some(t => propertyLower.includes(t) || t.includes(propertyLower))) return 80;
    return 30;
  }

  private calculateDevelopmentPotential(property: any, interests: LeadInterests): number {
    let score = 50;

    // Zoning score
    if (property.zoning && interests.zoningPreferences?.includes(property.zoning)) {
      score += 20;
    }

    // Lot size score
    if (property.lotSize && property.lotSize > 1) {
      score += 15;
    }

    // Development score from property data
    if (property.developmentScore) {
      score += (property.developmentScore - 50) * 0.3;
    }

    return Math.max(0, Math.min(100, score));
  }

  private parseBudgetRange(budgetRange: string): { min: number; max: number } | null {
    const range = budgetRange.toLowerCase();
    
    // Handle various formats: "$500K - $2M", "500k-2m", "500000-2000000"
    const patterns = [
      /\$?(\d+(?:\.\d+)?)(?:k|m)?\s*-\s*\$?(\d+(?:\.\d+)?)(?:k|m)?/i,
      /(\d+(?:\.\d+)?)(?:k|m)?\s*-\s*(\d+(?:\.\d+)?)(?:k|m)?/i,
    ];

    for (const pattern of patterns) {
      const match = range.match(pattern);
      if (match) {
        let min = parseFloat(match[1]);
        let max = parseFloat(match[2]);

        // Convert K/M to full numbers
        if (range.includes('k')) {
          min *= 1000;
          max *= 1000;
        } else if (range.includes('m')) {
          min *= 1000000;
          max *= 1000000;
        }

        return { min, max };
      }
    }

    return null;
  }

  private extractNeighborhoods(interests: string[], location?: string): string[] {
    const neighborhoods: string[] = [];
    
    // Houston neighborhoods
    const houstonNeighborhoods = [
      'Katy', 'Woodlands', 'Sugar Land', 'Pearland', 'Cypress', 'Spring',
      'Tomball', 'Magnolia', 'Conroe', 'Kingwood', 'Humble', 'Atascocita',
      'Baytown', 'Pasadena', 'League City', 'Friendswood', 'Clear Lake',
      'Webster', 'Dickinson', 'La Porte', 'Deer Park', 'Channelview'
    ];

    // Extract from interests
    interests.forEach(interest => {
      houstonNeighborhoods.forEach(neighborhood => {
        if (interest.toLowerCase().includes(neighborhood.toLowerCase())) {
          neighborhoods.push(neighborhood);
        }
      });
    });

    // Extract from location
    if (location) {
      houstonNeighborhoods.forEach(neighborhood => {
        if (location.toLowerCase().includes(neighborhood.toLowerCase())) {
          neighborhoods.push(neighborhood);
        }
      });
    }

    return [...new Set(neighborhoods)];
  }

  private extractProjectTypes(interests: string[], propertyType?: string): string[] {
    const types: string[] = [];
    
    const projectTypes = [
      'residential', 'commercial', 'mixed-use', 'industrial', 'retail',
      'office', 'warehouse', 'apartment', 'single-family', 'townhouse',
      'condo', 'subdivision', 'development', 'construction'
    ];

    // Extract from interests
    interests.forEach(interest => {
      projectTypes.forEach(type => {
        if (interest.toLowerCase().includes(type.toLowerCase())) {
          types.push(type);
        }
      });
    });

    // Extract from property type
    if (propertyType) {
      projectTypes.forEach(type => {
        if (propertyType.toLowerCase().includes(type.toLowerCase())) {
          types.push(type);
        }
      });
    }

    return [...new Set(types)];
  }

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

  private generateMatchReasoning(property: any, interests: LeadInterests): string[] {
    const reasoning: string[] = [];

    // Budget reasoning
    const budgetMatch = this.calculateBudgetMatch(property.listPrice, interests.budgetRange);
    if (budgetMatch >= 80) {
      reasoning.push('Perfect budget fit');
    } else if (budgetMatch >= 60) {
      reasoning.push('Good budget alignment');
    }

    // Location reasoning
    const locationMatch = this.calculateLocationMatch(property.neighborhood, interests.neighborhoods);
    if (locationMatch >= 80) {
      reasoning.push('Preferred location match');
    } else if (locationMatch >= 60) {
      reasoning.push('Good location proximity');
    }

    // Type reasoning
    const typeMatch = this.calculateTypeMatch(property.type, interests.projectTypes);
    if (typeMatch >= 80) {
      reasoning.push('Ideal project type');
    } else if (typeMatch >= 60) {
      reasoning.push('Suitable project type');
    }

    // Development potential
    if (property.developmentScore && property.developmentScore > 70) {
      reasoning.push('High development potential');
    }

    return reasoning;
  }

  private generateNextSteps(property: any, interests: LeadInterests): string[] {
    const steps: string[] = [];

    steps.push('Schedule property viewing');
    steps.push('Prepare due diligence package');

    if (interests.developmentExperience === 'none') {
      steps.push('Provide development education materials');
    }

    if (property.developmentScore && property.developmentScore > 80) {
      steps.push('Highlight development opportunities');
    }

    return steps;
  }

  private assessRiskFactors(property: any): string[] {
    const risks: string[] = [];

    // Zoning risks
    if (property.zoning && ['agricultural', 'conservation'].includes(property.zoning.toLowerCase())) {
      risks.push('Zoning restrictions may limit development');
    }

    // Environmental risks
    if (property.utilities && !property.utilities.water) {
      risks.push('No water utility access');
    }

    // Market risks
    if (property.marketTrends && property.marketTrends.priceTrend === 'declining') {
      risks.push('Declining market conditions');
    }

    return risks;
  }

  private assessMarketConditions(property: any): string {
    if (property.marketTrends) {
      const trends = property.marketTrends;
      if (trends.priceTrend === 'increasing' && trends.demand === 'high') {
        return 'Favorable market conditions';
      } else if (trends.priceTrend === 'stable' && trends.demand === 'moderate') {
        return 'Stable market conditions';
      } else {
        return 'Challenging market conditions';
      }
    }

    return 'Market conditions unknown';
  }

  /**
   * Get pipeline metrics
   */
  async getPipelineMetrics(): Promise<PipelineMetrics> {
    const deals = await prisma.deal.findMany({
      include: {
        lead: true,
      },
    });

    const stageCounts: Record<string, number> = {};
    let totalPipelineValue = 0;
    let weightedPipelineValue = 0;

    // Count deals by stage
    deals.forEach(deal => {
      const stage = deal.stage;
      stageCounts[stage] = (stageCounts[stage] || 0) + 1;
      totalPipelineValue += deal.value || 0;
      
      const stageProbability = this.getStageProbability(stage);
      weightedPipelineValue += (deal.value || 0) * (stageProbability / 100);
    });

    // Calculate conversion rates (simplified)
    const conversionRates: Record<string, string> = {
      'Lead → Qualified': '25%',
      'Qualified → Consultation': '60%',
      'Consultation → Property ID': '40%',
      'Property ID → Contract': '15%',
      'Contract → Closed': '85%',
    };

    // Calculate average time in stage (simplified)
    const averageTimeInStage: Record<string, string> = {
      'Lead → Qualified': '3 days',
      'Qualified → Consultation': '7 days',
      'Consultation → Property ID': '14 days',
      'Property ID → Contract': '30 days',
      'Contract → Closed': '45 days',
    };

    return {
      conversionRates,
      averageTimeInStage,
      stageCounts,
      totalPipelineValue,
      weightedPipelineValue,
    };
  }

  /**
   * Get deal stages
   */
  getDealStages(): DealStage[] {
    return this.dealStages;
  }

  /**
   * Get stage probability
   */
  getStageProbability(stage: string): number {
    const stageData = this.dealStages.find(s => s.id === stage);
    return stageData?.probability || 0;
  }

  /**
   * Create property interest record
   */
  async createPropertyInterest(leadId: string, propertyId: string, interest: 'high' | 'medium' | 'low', notes?: string) {
    return await prisma.leadPropertyInterest.create({
      data: {
        leadId,
        propertyId,
        interest,
        notes,
      },
    });
  }

  /**
   * Get lead's property interests
   */
  async getLeadPropertyInterests(leadId: string) {
    return await prisma.leadPropertyInterest.findMany({
      where: { leadId },
      include: {
        property: true,
      },
      orderBy: { viewedAt: 'desc' },
    });
  }
}

export const opportunityTrackingService = new OpportunityTrackingService(); 