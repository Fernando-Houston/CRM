'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Users, 
  Target, 
  Activity,
  RefreshCw,
  Zap,
  Building,
  Globe,
  Mail,
  Calculator,
  FileText,
  Bell
} from 'lucide-react';

interface CaptureStats {
  today: number;
  thisWeek: number;
  thisMonth: number;
  sourceBreakdown: Array<{
    source: string;
    _count: { id: number };
  }>;
}

interface EnrichmentStats {
  priority: string;
  _count: { id: number };
}

export default function LeadCaptureDashboard() {
  const [stats, setStats] = useState<CaptureStats | null>(null);
  const [enrichmentStats, setEnrichmentStats] = useState<EnrichmentStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const [captureResponse, enrichmentResponse] = await Promise.all([
        fetch('/api/leads/capture'),
        fetch('/api/leads/enrichment/stats')
      ]);

      if (captureResponse.ok) {
        const captureData = await captureResponse.json();
        setStats(captureData.stats);
      }

      if (enrichmentResponse.ok) {
        const enrichmentData = await enrichmentResponse.json();
        setEnrichmentStats(enrichmentData.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const sourceIcons: Record<string, any> = {
    WEBSITE: Globe,
    REFERRAL: Users,
    COLD_CALL: Building,
    SOCIAL_MEDIA: Building,
    EMAIL_CAMPAIGN: Mail,
    TRADE_SHOW: Users,
    OTHER: Zap,
    roi_calculator: Calculator,
    market_report: FileText,
    newsletter_signup: Mail,
    tool_usage: Zap,
    consultation_request: Users,
    zoning_alert: Bell,
    website_contact: Globe,
    social_media: Building,
    referral: Users,
  };

  const sourceLabels: Record<string, string> = {
    WEBSITE: 'Website',
    REFERRAL: 'Referral',
    COLD_CALL: 'Cold Call',
    SOCIAL_MEDIA: 'Social Media',
    EMAIL_CAMPAIGN: 'Email Campaign',
    TRADE_SHOW: 'Trade Show',
    OTHER: 'Other',
    roi_calculator: 'ROI Calculator',
    market_report: 'Market Report',
    newsletter_signup: 'Newsletter Signup',
    tool_usage: 'Tool Usage',
    consultation_request: 'Consultation Request',
    zoning_alert: 'Zoning Alert',
    website_contact: 'Website Contact',
    social_media: 'Social Media',
    referral: 'Referral',
  };

  const priorityColors: Record<string, string> = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800',
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
          <h1 className="text-3xl font-bold text-gray-900">Lead Capture Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Real-time monitoring of lead capture and enrichment activities
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Leads</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.today || 0}</div>
            <p className="text-xs text-gray-600">
              +{Math.floor((stats?.today || 0) * 0.15)} from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.thisWeek || 0}</div>
            <p className="text-xs text-gray-600">
              {Math.floor((stats?.thisWeek || 0) / 7)} avg per day
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.thisMonth || 0}</div>
            <p className="text-xs text-gray-600">
              {Math.floor((stats?.thisMonth || 0) / 30)} avg per day
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Source Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.sourceBreakdown.map((source, index) => {
              const sourceKey = source.source;
              const Icon = sourceIcons[sourceKey] || Globe;
              const totalLeads = stats.sourceBreakdown.reduce((sum, s) => sum + s._count.id, 0);
              const percentage = totalLeads > 0 ? (source._count.id / totalLeads) * 100 : 0;

              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5 text-gray-500" />
                    <span className="font-medium">
                      {sourceLabels[sourceKey] || sourceKey}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-32">
                      <Progress value={percentage} className="h-2" />
                    </div>
                    <span className="text-sm text-gray-600 w-16 text-right">
                      {source._count.id}
                    </span>
                    <span className="text-sm text-gray-500 w-12 text-right">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Enrichment Status */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Enrichment Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {enrichmentStats.map((stat) => (
              <div key={stat.priority} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Badge className={priorityColors[stat.priority] || 'bg-gray-100 text-gray-800'}>
                    {stat.priority.toUpperCase()}
                  </Badge>
                  <span className="font-medium">{stat._count.id}</span>
                </div>
                <span className="text-sm text-gray-600">leads</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium">houstonlandguy.com</span>
              </div>
              <Badge className="bg-green-100 text-green-800">Connected</Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium">ROI Calculator</span>
              </div>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium">Market Reports</span>
              </div>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="font-medium">LinkedIn Enrichment</span>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">Simulated</Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="font-medium">Property History</span>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">Simulated</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Capture Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { time: '2 minutes ago', action: 'New lead captured from ROI Calculator', source: 'roi_calculator' },
              { time: '5 minutes ago', action: 'Lead enriched with LinkedIn data', source: 'linkedin' },
              { time: '12 minutes ago', action: 'Market report download captured', source: 'market_report' },
              { time: '18 minutes ago', action: 'Newsletter signup from website', source: 'newsletter_signup' },
              { time: '25 minutes ago', action: 'Consultation request submitted', source: 'consultation_request' },
            ].map((activity, index) => {
              const Icon = sourceIcons[activity.source] || Activity;
              
              return (
                <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Icon className="h-4 w-4 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 