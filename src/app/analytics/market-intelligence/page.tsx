'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  Target, 
  Activity,
  RefreshCw,
  BarChart3,
  PieChart,
  LineChart,
  DollarSign,
  Calendar,
  MapPin,
  Building2
} from 'lucide-react';

interface LeadSourceAnalysis {
  source: string;
  totalLeads: number;
  conversionRate: string;
  avgDealValue: number;
  totalRevenue: number;
  roi: string;
}

interface PipelineMetrics {
  conversionRates: Record<string, string>;
  averageTimeInStage: Record<string, string>;
  stageCounts: Record<string, number>;
  totalPipelineValue: number;
  weightedPipelineValue: number;
}

interface MarketTrends {
  period: string;
  leadVolume: number;
  conversionRate: number;
  avgDealSize: number;
  marketActivity: 'increasing' | 'stable' | 'declining';
}

export default function MarketIntelligenceDashboard() {
  const [leadSourceData, setLeadSourceData] = useState<LeadSourceAnalysis[]>([]);
  const [pipelineMetrics, setPipelineMetrics] = useState<PipelineMetrics | null>(null);
  const [marketTrends, setMarketTrends] = useState<MarketTrends[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchMarketIntelligence();
  }, [timeRange]);

  const fetchMarketIntelligence = async () => {
    setLoading(true);
    try {
      // Fetch data from API endpoints
      const [sourceResponse, pipelineResponse, trendsResponse] = await Promise.all([
        fetch(`/api/analytics/lead-sources?range=${timeRange}`),
        fetch('/api/analytics/pipeline-metrics'),
        fetch(`/api/analytics/market-trends?range=${timeRange}`)
      ]);

      if (sourceResponse.ok) {
        const sourceData = await sourceResponse.json();
        setLeadSourceData(sourceData.analysis);
      }

      if (pipelineResponse.ok) {
        const pipelineData = await pipelineResponse.json();
        setPipelineMetrics(pipelineData.metrics);
      }

      if (trendsResponse.ok) {
        const trendsData = await trendsResponse.json();
        setMarketTrends(trendsData.trends);
      }
    } catch (error) {
      console.error('Error fetching market intelligence:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getMarketActivityColor = (activity: string) => {
    switch (activity) {
      case 'increasing': return 'text-green-600';
      case 'stable': return 'text-blue-600';
      case 'declining': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getMarketActivityIcon = (activity: string) => {
    switch (activity) {
      case 'increasing': return TrendingUp;
      case 'stable': return Activity;
      case 'declining': return TrendingDown;
      default: return Activity;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Market Intelligence</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive analysis of lead sources, pipeline performance, and market trends
          </p>
        </div>
        <div className="flex space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button onClick={fetchMarketIntelligence}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pipeline</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pipelineMetrics ? formatCurrency(pipelineMetrics.totalPipelineValue) : '$0'}
            </div>
            <p className="text-xs text-gray-600">
              {pipelineMetrics ? formatCurrency(pipelineMetrics.weightedPipelineValue) : '$0'} weighted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Conversion Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">25.4%</div>
            <p className="text-xs text-gray-600">
              +2.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Deal Size</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1.2M</div>
            <p className="text-xs text-gray-600">
              +8.3% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales Cycle</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">67 days</div>
            <p className="text-xs text-gray-600">
              -5 days from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lead Source Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Source Performance</CardTitle>
          <p className="text-sm text-gray-600">
            Analysis of lead sources by conversion rate, deal value, and ROI
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leadSourceData.map((source, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">{source.source}</h4>
                    <p className="text-sm text-gray-500">{source.totalLeads} leads</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-sm font-medium">{source.conversionRate}</p>
                    <p className="text-xs text-gray-500">Conversion</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">{formatCurrency(source.avgDealValue)}</p>
                    <p className="text-xs text-gray-500">Avg Deal</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">{source.roi}</p>
                    <p className="text-xs text-gray-500">ROI</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">{formatCurrency(source.totalRevenue)}</p>
                    <p className="text-xs text-gray-500">Revenue</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pipeline Conversion Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pipelineMetrics?.conversionRates && Object.entries(pipelineMetrics.conversionRates).map(([stage, rate]) => (
                <div key={stage} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{stage}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-24">
                      <Progress value={parseFloat(rate)} className="h-2" />
                    </div>
                    <span className="text-sm text-gray-600 w-12">{rate}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Time in Pipeline Stages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pipelineMetrics?.averageTimeInStage && Object.entries(pipelineMetrics.averageTimeInStage).map(([stage, time]) => (
                <div key={stage} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{stage}</span>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Market Trends</CardTitle>
          <p className="text-sm text-gray-600">
            Monthly trends in lead volume, conversion rates, and deal sizes
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {marketTrends.map((trend, index) => {
              const ActivityIcon = getMarketActivityIcon(trend.marketActivity);
              return (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{trend.period}</span>
                    <ActivityIcon className={`h-4 w-4 ${getMarketActivityColor(trend.marketActivity)}`} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Leads:</span>
                      <span className="font-medium">{trend.leadVolume}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Conversion:</span>
                      <span className="font-medium">{trend.conversionRate}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Avg Deal:</span>
                      <span className="font-medium">{formatCurrency(trend.avgDealSize)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Geographic Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Geographic Performance</CardTitle>
          <p className="text-sm text-gray-600">
            Lead generation and conversion rates by Houston area
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { area: 'Katy', leads: 45, conversion: '28%', avgDeal: '$1.1M', trend: 'increasing' },
              { area: 'Woodlands', leads: 38, conversion: '32%', avgDeal: '$1.4M', trend: 'stable' },
              { area: 'Sugar Land', leads: 29, conversion: '25%', avgDeal: '$950K', trend: 'increasing' },
              { area: 'Cypress', leads: 42, conversion: '30%', avgDeal: '$1.2M', trend: 'stable' },
              { area: 'Pearland', leads: 31, conversion: '22%', avgDeal: '$880K', trend: 'declining' },
              { area: 'Spring', leads: 26, conversion: '35%', avgDeal: '$1.3M', trend: 'increasing' },
            ].map((area, index) => {
              const TrendIcon = getMarketActivityIcon(area.trend);
              return (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{area.area}</span>
                    </div>
                    <TrendIcon className={`h-4 w-4 ${getMarketActivityColor(area.trend)}`} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Leads:</span>
                      <span className="font-medium">{area.leads}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Conversion:</span>
                      <span className="font-medium">{area.conversion}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Avg Deal:</span>
                      <span className="font-medium">{area.avgDeal}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Seasonal Patterns */}
      <Card>
        <CardHeader>
          <CardTitle>Seasonal Lead Patterns</CardTitle>
          <p className="text-sm text-gray-600">
            Historical patterns in lead generation throughout the year
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { quarter: 'Q1', leads: 156, trend: 'declining', reason: 'Holiday season impact' },
              { quarter: 'Q2', leads: 234, trend: 'increasing', reason: 'Spring market activity' },
              { quarter: 'Q3', leads: 198, trend: 'stable', reason: 'Summer market stability' },
              { quarter: 'Q4', leads: 187, trend: 'increasing', reason: 'Year-end planning' },
            ].map((quarter, index) => {
              const TrendIcon = getMarketActivityIcon(quarter.trend);
              return (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold">{quarter.quarter}</span>
                    <TrendIcon className={`h-4 w-4 ${getMarketActivityColor(quarter.trend)}`} />
                  </div>
                  <div className="text-2xl font-bold mb-2">{quarter.leads}</div>
                  <p className="text-sm text-gray-600">{quarter.reason}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 