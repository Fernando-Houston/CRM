/**
 * Website Lead Capture Integration
 * Provides utilities and snippets for integrating with houstonlandguy.com
 */

export interface CaptureConfig {
  apiEndpoint: string;
  apiKey?: string;
  autoEnrich: boolean;
  trackPageViews: boolean;
  trackFormSubmissions: boolean;
  trackDownloads: boolean;
}

export interface LeadData {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  source: string;
  sourceDetails?: {
    pageUrl?: string;
    formData?: Record<string, any>;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    userAgent?: string;
    ipAddress?: string;
  };
  interests?: string[];
  budget?: string;
  timeline?: string;
  propertyType?: string;
  location?: string;
}

class WebsiteCaptureIntegration {
  private config: CaptureConfig;
  private sessionId: string;

  constructor(config: CaptureConfig) {
    this.config = config;
    this.sessionId = this.generateSessionId();
    this.initialize();
  }

  private generateSessionId(): string {
    return 'session_' + Math.random().toString(36).substr(2, 9);
  }

  private initialize(): void {
    if (typeof window !== 'undefined') {
      this.setupEventListeners();
      this.trackPageView();
    }
  }

  private setupEventListeners(): void {
    // Track form submissions
    if (this.config.trackFormSubmissions) {
      document.addEventListener('submit', this.handleFormSubmit.bind(this));
    }

    // Track downloads
    if (this.config.trackDownloads) {
      document.addEventListener('click', this.handleDownloadClick.bind(this));
    }

    // Track UTM parameters
    this.trackUTMParameters();
  }

  private handleFormSubmit(event: Event): void {
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    
    // Check if form contains email
    const email = formData.get('email') as string;
    if (!email) return;

    const leadData: LeadData = {
      email,
      firstName: formData.get('firstName') as string || undefined,
      lastName: formData.get('lastName') as string || undefined,
      phone: formData.get('phone') as string || undefined,
      company: formData.get('company') as string || undefined,
      source: this.determineFormSource(form),
      sourceDetails: {
        pageUrl: window.location.href,
        formData: Object.fromEntries(formData.entries()),
        userAgent: navigator.userAgent,
        ...this.getUTMParameters(),
      },
    };

    this.captureLead(leadData);
  }

  private handleDownloadClick(event: Event): void {
    const target = event.target as HTMLElement;
    const link = target.closest('a');
    
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    // Check if it's a download link
    const isDownload = href.includes('.pdf') || 
                      href.includes('.doc') || 
                      href.includes('.xlsx') ||
                      link.getAttribute('download');

    if (isDownload) {
      const email = this.getEmailFromPage();
      if (email) {
        const leadData: LeadData = {
          email,
          source: 'market_report',
          sourceDetails: {
            pageUrl: window.location.href,
            userAgent: navigator.userAgent,
            ...this.getUTMParameters(),
          },
        };

        this.captureLead(leadData);
      }
    }
  }

  private determineFormSource(form: HTMLFormElement): string {
    const formId = form.id || form.className || '';
    const formAction = form.action || '';

    if (formId.includes('roi') || formAction.includes('roi')) return 'roi_calculator';
    if (formId.includes('newsletter') || formAction.includes('newsletter')) return 'newsletter_signup';
    if (formId.includes('consultation') || formAction.includes('consultation')) return 'consultation_request';
    if (formId.includes('zoning') || formAction.includes('zoning')) return 'zoning_alert';
    if (formId.includes('contact') || formAction.includes('contact')) return 'website_contact';
    
    return 'website_contact';
  }

  private getEmailFromPage(): string | null {
    // Try to find email in form fields
    const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
    if (emailInput && emailInput.value) return emailInput.value;

    // Try to find email in data attributes
    const emailElement = document.querySelector('[data-email]');
    if (emailElement) return emailElement.getAttribute('data-email');

    return null;
  }

  private trackUTMParameters(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source');
    const utmMedium = urlParams.get('utm_medium');
    const utmCampaign = urlParams.get('utm_campaign');

    if (utmSource || utmMedium || utmCampaign) {
      sessionStorage.setItem('utm_source', utmSource || '');
      sessionStorage.setItem('utm_medium', utmMedium || '');
      sessionStorage.setItem('utm_campaign', utmCampaign || '');
    }
  }

  private getUTMParameters(): Record<string, string> {
    return {
      utmSource: sessionStorage.getItem('utm_source') || '',
      utmMedium: sessionStorage.getItem('utm_medium') || '',
      utmCampaign: sessionStorage.getItem('utm_campaign') || '',
    };
  }

  private trackPageView(): void {
    if (!this.config.trackPageViews) return;

    const pageData = {
      url: window.location.href,
      title: document.title,
      referrer: document.referrer,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      ...this.getUTMParameters(),
    };

    // Send page view data
    fetch(`${this.config.apiEndpoint}/pageview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
      },
      body: JSON.stringify(pageData),
    }).catch(console.error);
  }

  async captureLead(leadData: LeadData): Promise<boolean> {
    try {
      const response = await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
        },
        body: JSON.stringify(leadData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Lead captured successfully:', result);
        return true;
      } else {
        console.error('Failed to capture lead:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('Error capturing lead:', error);
      return false;
    }
  }

  // Manual lead capture method
  async captureManualLead(data: Partial<LeadData>): Promise<boolean> {
    const leadData: LeadData = {
      email: data.email!,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      company: data.company,
      source: data.source || 'manual',
      sourceDetails: {
        pageUrl: window.location.href,
        userAgent: navigator.userAgent,
        ...this.getUTMParameters(),
        ...data.sourceDetails,
      },
      interests: data.interests,
      budget: data.budget,
      timeline: data.timeline,
      propertyType: data.propertyType,
      location: data.location,
    };

    return this.captureLead(leadData);
  }

  // ROI Calculator integration
  async captureROICalculation(data: {
    email: string;
    firstName?: string;
    lastName?: string;
    propertyValue: number;
    downPayment: number;
    interestRate: number;
    loanTerm: number;
    monthlyRent: number;
    propertyTaxes: number;
    insurance: number;
    maintenance: number;
    roi: number;
  }): Promise<boolean> {
    const leadData: LeadData = {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      source: 'roi_calculator',
      sourceDetails: {
        pageUrl: window.location.href,
        formData: {
          propertyValue: data.propertyValue,
          downPayment: data.downPayment,
          interestRate: data.interestRate,
          loanTerm: data.loanTerm,
          monthlyRent: data.monthlyRent,
          propertyTaxes: data.propertyTaxes,
          insurance: data.insurance,
          maintenance: data.maintenance,
          roi: data.roi,
        },
        userAgent: navigator.userAgent,
        ...this.getUTMParameters(),
      },
      interests: ['ROI Analysis', 'Investment Properties'],
    };

    return this.captureLead(leadData);
  }

  // Market Report download integration
  async captureMarketReportDownload(data: {
    email: string;
    firstName?: string;
    lastName?: string;
    reportType: string;
    reportTitle: string;
  }): Promise<boolean> {
    const leadData: LeadData = {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      source: 'market_report',
      sourceDetails: {
        pageUrl: window.location.href,
        formData: {
          reportType: data.reportType,
          reportTitle: data.reportTitle,
        },
        userAgent: navigator.userAgent,
        ...this.getUTMParameters(),
      },
      interests: ['Market Analysis', 'Market Reports'],
    };

    return this.captureLead(leadData);
  }
}

// Generate JavaScript snippet for website integration
export function generateIntegrationSnippet(config: CaptureConfig): string {
  return `
// Houston Development Intelligence - Lead Capture Integration
(function() {
  'use strict';
  
  const config = ${JSON.stringify(config, null, 2)};
  
  class WebsiteCaptureIntegration {
    constructor(config) {
      this.config = config;
      this.sessionId = this.generateSessionId();
      this.initialize();
    }

    generateSessionId() {
      return 'session_' + Math.random().toString(36).substr(2, 9);
    }

    initialize() {
      this.setupEventListeners();
      this.trackPageView();
    }

    setupEventListeners() {
      if (this.config.trackFormSubmissions) {
        document.addEventListener('submit', this.handleFormSubmit.bind(this));
      }
      
      if (this.config.trackDownloads) {
        document.addEventListener('click', this.handleDownloadClick.bind(this));
      }
      
      this.trackUTMParameters();
    }

    handleFormSubmit(event) {
      const form = event.target;
      const formData = new FormData(form);
      const email = formData.get('email');
      
      if (!email) return;

      const leadData = {
        email: email,
        firstName: formData.get('firstName') || undefined,
        lastName: formData.get('lastName') || undefined,
        phone: formData.get('phone') || undefined,
        company: formData.get('company') || undefined,
        source: this.determineFormSource(form),
        sourceDetails: {
          pageUrl: window.location.href,
          formData: Object.fromEntries(formData.entries()),
          userAgent: navigator.userAgent,
          ...this.getUTMParameters(),
        },
      };

      this.captureLead(leadData);
    }

    handleDownloadClick(event) {
      const target = event.target;
      const link = target.closest('a');
      
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href) return;

      const isDownload = href.includes('.pdf') || 
                        href.includes('.doc') || 
                        href.includes('.xlsx') ||
                        link.getAttribute('download');

      if (isDownload) {
        const email = this.getEmailFromPage();
        if (email) {
          const leadData = {
            email: email,
            source: 'market_report',
            sourceDetails: {
              pageUrl: window.location.href,
              downloadUrl: href,
              userAgent: navigator.userAgent,
              ...this.getUTMParameters(),
            },
          };

          this.captureLead(leadData);
        }
      }
    }

    determineFormSource(form) {
      const formId = form.id || form.className || '';
      const formAction = form.action || '';

      if (formId.includes('roi') || formAction.includes('roi')) return 'roi_calculator';
      if (formId.includes('newsletter') || formAction.includes('newsletter')) return 'newsletter_signup';
      if (formId.includes('consultation') || formAction.includes('consultation')) return 'consultation_request';
      if (formId.includes('zoning') || formAction.includes('zoning')) return 'zoning_alert';
      if (formId.includes('contact') || formAction.includes('contact')) return 'website_contact';
      
      return 'website_contact';
    }

    getEmailFromPage() {
      const emailInput = document.querySelector('input[type="email"]');
      if (emailInput && emailInput.value) return emailInput.value;

      const emailElement = document.querySelector('[data-email]');
      if (emailElement) return emailElement.getAttribute('data-email');

      return null;
    }

    trackUTMParameters() {
      const urlParams = new URLSearchParams(window.location.search);
      const utmSource = urlParams.get('utm_source');
      const utmMedium = urlParams.get('utm_medium');
      const utmCampaign = urlParams.get('utm_campaign');

      if (utmSource || utmMedium || utmCampaign) {
        sessionStorage.setItem('utm_source', utmSource || '');
        sessionStorage.setItem('utm_medium', utmMedium || '');
        sessionStorage.setItem('utm_campaign', utmCampaign || '');
      }
    }

    getUTMParameters() {
      return {
        utmSource: sessionStorage.getItem('utm_source') || '',
        utmMedium: sessionStorage.getItem('utm_medium') || '',
        utmCampaign: sessionStorage.getItem('utm_campaign') || '',
      };
    }

    trackPageView() {
      if (!this.config.trackPageViews) return;

      const pageData = {
        url: window.location.href,
        title: document.title,
        referrer: document.referrer,
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        ...this.getUTMParameters(),
      };

      fetch(config.apiEndpoint + '/pageview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey && { 'Authorization': 'Bearer ' + config.apiKey }),
        },
        body: JSON.stringify(pageData),
      }).catch(console.error);
    }

    async captureLead(leadData) {
      try {
        const response = await fetch(config.apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(config.apiKey && { 'Authorization': 'Bearer ' + config.apiKey }),
          },
          body: JSON.stringify(leadData),
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Lead captured successfully:', result);
          return true;
        } else {
          console.error('Failed to capture lead:', response.statusText);
          return false;
        }
      } catch (error) {
        console.error('Error capturing lead:', error);
        return false;
      }
    }
  }

  // Initialize the integration
  window.hdiLeadCapture = new WebsiteCaptureIntegration(config);
})();
  `;
}

export { WebsiteCaptureIntegration }; 