'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Copy, 
  Check, 
  Globe, 
  Code, 
  Settings,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { generateIntegrationSnippet } from '@/lib/integrations/websiteCapture';

export default function IntegrationsPage() {
  const [config, setConfig] = useState({
    apiEndpoint: 'https://your-domain.com/api/leads/capture',
    apiKey: '',
    autoEnrich: true,
    trackPageViews: true,
    trackFormSubmissions: true,
    trackDownloads: true,
  });

  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('website');

  const handleConfigChange = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const generateSnippet = () => {
    return generateIntegrationSnippet(config);
  };

  const copyToClipboard = async () => {
    const snippet = generateSnippet();
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const testConnection = async () => {
    try {
      const response = await fetch(config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` }),
        },
        body: JSON.stringify({
          email: 'test@example.com',
          source: 'test',
        }),
      });

      if (response.ok) {
        alert('Connection successful!');
      } else {
        alert('Connection failed. Please check your configuration.');
      }
    } catch (error) {
      alert('Connection failed. Please check your configuration.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
        <p className="text-gray-600 mt-2">
          Configure external integrations and website connections
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 border-b">
        <button
          onClick={() => setActiveTab('website')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
            activeTab === 'website'
              ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Globe className="h-4 w-4 inline mr-2" />
          Website Integration
        </button>
        <button
          onClick={() => setActiveTab('apis')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
            activeTab === 'apis'
              ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Code className="h-4 w-4 inline mr-2" />
          API Connections
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
            activeTab === 'settings'
              ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Settings className="h-4 w-4 inline mr-2" />
          Settings
        </button>
      </div>

      {/* Website Integration Tab */}
      {activeTab === 'website' && (
        <div className="space-y-6">
          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Website Integration Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="apiEndpoint">API Endpoint</Label>
                <Input
                  id="apiEndpoint"
                  value={config.apiEndpoint}
                  onChange={(e) => handleConfigChange('apiEndpoint', e.target.value)}
                  placeholder="https://your-domain.com/api/leads/capture"
                />
                <p className="text-sm text-gray-500 mt-1">
                  The endpoint where lead data will be sent
                </p>
              </div>

              <div>
                <Label htmlFor="apiKey">API Key (Optional)</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={config.apiKey}
                  onChange={(e) => handleConfigChange('apiKey', e.target.value)}
                  placeholder="Enter your API key for authentication"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Used for secure authentication with the API
                </p>
              </div>

              <div className="space-y-3">
                <Label>Tracking Options</Label>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-enrich leads</p>
                    <p className="text-sm text-gray-500">
                      Automatically enrich leads with external data
                    </p>
                  </div>
                  <Switch
                    checked={config.autoEnrich}
                    onCheckedChange={(checked) => handleConfigChange('autoEnrich', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Track page views</p>
                    <p className="text-sm text-gray-500">
                      Monitor visitor behavior and page interactions
                    </p>
                  </div>
                  <Switch
                    checked={config.trackPageViews}
                    onCheckedChange={(checked) => handleConfigChange('trackPageViews', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Track form submissions</p>
                    <p className="text-sm text-gray-500">
                      Automatically capture form data
                    </p>
                  </div>
                  <Switch
                    checked={config.trackFormSubmissions}
                    onCheckedChange={(checked) => handleConfigChange('trackFormSubmissions', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Track downloads</p>
                    <p className="text-sm text-gray-500">
                      Monitor file downloads and resource access
                    </p>
                  </div>
                  <Switch
                    checked={config.trackDownloads}
                    onCheckedChange={(checked) => handleConfigChange('trackDownloads', checked)}
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <Button onClick={testConnection}>
                  Test Connection
                </Button>
                <Button variant="outline" onClick={() => setActiveTab('apis')}>
                  View API Documentation
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Integration Snippet */}
          <Card>
            <CardHeader>
              <CardTitle>Integration Code</CardTitle>
              <p className="text-sm text-gray-600">
                Add this JavaScript snippet to your website to enable lead capture
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">JavaScript Snippet</h4>
                    <p className="text-sm text-gray-500">
                      Copy and paste this code into your website's &lt;head&gt; section
                    </p>
                  </div>
                  <Button onClick={copyToClipboard} size="sm">
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Code
                      </>
                    )}
                  </Button>
                </div>

                <div className="relative">
                  <Textarea
                    value={generateSnippet()}
                    readOnly
                    className="font-mono text-sm h-64"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Integration Instructions</h4>
                      <ul className="text-sm text-blue-800 mt-2 space-y-1">
                        <li>• Add the JavaScript snippet to your website's &lt;head&gt; section</li>
                        <li>• Ensure your forms have proper email input fields</li>
                        <li>• Test the integration with a sample lead</li>
                        <li>• Monitor the Lead Capture Dashboard for incoming leads</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Supported Sources */}
          <Card>
            <CardHeader>
              <CardTitle>Supported Lead Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { source: 'ROI Calculator', status: 'active', description: 'Investment analysis tool submissions' },
                  { source: 'Market Reports', status: 'active', description: 'Report downloads and requests' },
                  { source: 'Newsletter Signup', status: 'active', description: 'Email newsletter subscriptions' },
                  { source: 'Tool Usage', status: 'active', description: 'Interactive tool interactions' },
                  { source: 'Consultation Requests', status: 'active', description: 'Consultation form submissions' },
                  { source: 'Zoning Alerts', status: 'active', description: 'Zoning change notifications' },
                  { source: 'Website Contact', status: 'active', description: 'General contact form submissions' },
                  { source: 'Social Media', status: 'active', description: 'Social media campaign leads' },
                ].map((item) => (
                  <div key={item.source} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{item.source}</p>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* API Connections Tab */}
      {activeTab === 'apis' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Documentation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Lead Capture Endpoint</h3>
                  <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm">
                    POST {config.apiEndpoint}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Request Body</h3>
                  <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm">
{`{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "company": "Example Corp",
  "source": "roi_calculator",
  "sourceDetails": {
    "pageUrl": "https://example.com/roi-calculator",
    "formData": { ... },
    "utmSource": "google",
    "utmMedium": "cpc",
    "utmCampaign": "spring2024"
  },
  "interests": ["Investment Properties", "ROI Analysis"],
  "budget": "500k-1M",
  "timeline": "3-6 months",
  "propertyType": "residential",
  "location": "Houston, TX"
}`}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Response</h3>
                  <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm">
{`{
  "success": true,
  "message": "Lead captured successfully",
  "leadId": "lead_123",
  "isNew": true
}`}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button onClick={() => window.open('/api/docs', '_blank')}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Full API Docs
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab('website')}>
                    Back to Configuration
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Integration Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-assign leads</p>
                    <p className="text-sm text-gray-500">
                      Automatically assign new leads to team members
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Lead scoring</p>
                    <p className="text-sm text-gray-500">
                      Enable automatic lead priority scoring
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Duplicate detection</p>
                    <p className="text-sm text-gray-500">
                      Prevent duplicate leads from same email
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Real-time notifications</p>
                    <p className="text-sm text-gray-500">
                      Send notifications for new leads
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 