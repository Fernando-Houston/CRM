# 🚀 Houston Development Intelligence CRM - Deployment Guide

## Quick Start Deployment

### Step 1: Repository Setup
```bash
# Run the automated setup script
./setup-repository.sh
```

This script will:
- ✅ Install all dependencies
- ✅ Set up environment configuration
- ✅ Initialize git repository
- ✅ Create initial commit
- ✅ Push to GitHub repository

### Step 2: Environment Configuration
Edit `.env.local` with your production settings:

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# Authentication
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="https://your-domain.railway.app"

# Email (for notifications)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"

# Stripe (for payments)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."

# External APIs (for lead enrichment)
LINKEDIN_API_KEY="your-linkedin-api-key"
COMPANY_API_KEY="your-company-api-key"
```

### Step 3: Railway Deployment

#### Option A: Automated Deployment
```bash
# Make deployment script executable
chmod +x scripts/deploy.sh

# Run automated deployment
./scripts/deploy.sh
```

#### Option B: Manual Deployment
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your Railway project
railway link

# Deploy
railway up

# Set up database
railway run npm run db:push
railway run npm run db:seed
```

### Step 4: Website Integration

Add this JavaScript snippet to houstonlandguy.com:

```html
<!-- Lead Capture Script -->
<script>
(function() {
    // Lead capture configuration
    const CRM_CONFIG = {
        apiUrl: 'https://your-crm-domain.railway.app/api/leads/capture',
        siteId: 'houstonlandguy'
    };

    // Track page views
    function trackPageView() {
        fetch(CRM_CONFIG.apiUrl + '/pageview', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                url: window.location.href,
                title: document.title,
                referrer: document.referrer,
                siteId: CRM_CONFIG.siteId
            })
        });
    }

    // Track form submissions
    function trackFormSubmission(formData) {
        fetch(CRM_CONFIG.apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...formData,
                source: 'website',
                siteId: CRM_CONFIG.siteId
            })
        });
    }

    // Initialize tracking
    trackPageView();
    
    // Track form submissions
    document.addEventListener('submit', function(e) {
        if (e.target.tagName === 'FORM') {
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            trackFormSubmission(data);
        }
    });
})();
</script>
```

## 🧪 Testing Your Deployment

### Health Check
```bash
# Check if the application is running
curl https://your-domain.railway.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "environment": "production",
  "database": {
    "status": "connected",
    "stats": {
      "leads": 0,
      "deals": 0,
      "users": 0
    }
  }
}
```

### Run Tests
```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Type checking
npm run type-check
```

## 📊 Monitoring & Maintenance

### Health Monitoring
- **Health Check Endpoint**: `/api/health`
- **Database Status**: Monitored automatically
- **Performance Metrics**: Built-in monitoring

### Logs & Debugging
```bash
# View Railway logs
railway logs

# View specific service logs
railway logs --service web
```

### Database Management
```bash
# Run migrations
railway run npm run db:push

# Seed database
railway run npm run db:seed

# Reset database (careful!)
railway run npm run db:reset
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```bash
# Check database URL
railway variables

# Test connection
railway run npm run db:push
```

#### 2. Authentication Issues
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- Ensure database is properly seeded with users

#### 3. Email Not Working
- Verify SMTP settings in environment variables
- Check if using app passwords for Gmail
- Test email configuration

#### 4. Build Failures
```bash
# Check build locally
npm run build

# View build logs
railway logs --service web
```

## 🎯 Production Checklist

Before going live, verify:

- [ ] **Environment Variables**: All required variables set
- [ ] **Database**: Migrations run and seeded
- [ ] **Authentication**: Users created and roles assigned
- [ ] **Email**: SMTP configuration tested
- [ ] **Website Integration**: Lead capture script added to houstonlandguy.com
- [ ] **SSL Certificate**: Railway provides automatic SSL
- [ ] **Monitoring**: Health checks passing
- [ ] **Backup**: Database backup strategy in place

## 📈 Performance Optimization

### Railway Configuration
- **Auto-scaling**: Enabled by default
- **Memory**: Optimized for Node.js applications
- **CPU**: Automatic resource allocation

### Application Optimization
- **Code Splitting**: Automatic with Next.js
- **Image Optimization**: Built-in with Next.js Image component
- **Caching**: React Query for client-side caching
- **Database**: Prisma query optimization

## 🔒 Security

### Authentication
- **NextAuth.js**: Secure session management
- **Role-based Access**: Admin, Manager, Agent, Viewer roles
- **Password Hashing**: bcrypt for secure storage

### API Security
- **Input Validation**: Zod schemas for all inputs
- **Rate Limiting**: Built-in protection
- **CORS**: Configured for production domains

### Data Protection
- **Environment Variables**: Sensitive data encrypted
- **Database**: Railway provides secure PostgreSQL
- **HTTPS**: Automatic SSL certificates

## 📞 Support

### Documentation
- **README.md**: Complete setup instructions
- **API Documentation**: Built-in with Next.js
- **Code Comments**: Comprehensive inline documentation

### Monitoring
- **Health Checks**: Automatic monitoring
- **Error Logging**: Comprehensive error tracking
- **Performance Metrics**: Built-in analytics

### Contact
For technical support or questions about the CRM system, refer to the project documentation or contact the development team.

---

## 🎉 Success!

Your Houston Development Intelligence CRM is now deployed and ready to transform website leads into qualified development opportunities!

**Next Steps:**
1. **Train your team** on using the CRM
2. **Monitor lead capture** from houstonlandguy.com
3. **Track deal pipeline** and conversions
4. **Analyze market intelligence** for better decision making
5. **Scale operations** as your business grows

The CRM will automatically:
- ✅ Capture leads from your website
- ✅ Score and prioritize leads
- ✅ Match leads to properties
- ✅ Track deals through the pipeline
- ✅ Provide market intelligence
- ✅ Generate reports and analytics

**Welcome to the future of real estate development lead management!** 🚀 