# Deployment Guide

## Overview

This guide covers deployment options for LocalLeadGenAI, from simple static hosting to full production environments with backend infrastructure.

---

## Quick Deploy (Static Hosting)

### Option 1: Vercel (Recommended)

**Advantages**:
- Zero configuration
- Automatic deployments on push
- Edge network (fast global access)
- Free SSL certificates
- Preview deployments for PRs

**Steps**:

1. **Install Vercel CLI** (optional):
   ```bash
   npm install -g vercel
   ```

2. **Deploy from CLI**:
   ```bash
   vercel
   ```

3. **Or deploy via GitHub**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure build settings:
     - Build Command: `npm run build`
     - Output Directory: `dist`
   - Add environment variables:
     - `GEMINI_API_KEY`: Your API key

4. **Custom Domain** (optional):
   - Add custom domain in Vercel dashboard
   - Update DNS records as instructed

### Option 2: Netlify

**Steps**:

1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import existing project"
3. Connect to GitHub
4. Configure:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Add environment variables in Site settings
6. Deploy!

### Option 3: GitHub Pages

**Steps**:

1. **Install gh-pages**:
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update package.json**:
   ```json
   {
     "homepage": "https://yourusername.github.io/LocalLeadGenAI",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Deploy**:
   ```bash
   npm run deploy
   ```

4. **Enable GitHub Pages**:
   - Go to repository Settings
   - Pages section
   - Source: `gh-pages` branch

---

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Google Gemini API key | `AIza...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL (if using) | - |
| `VITE_ENV` | Environment name | `production` |

### Setting Variables

**Vercel**:
```bash
vercel env add GEMINI_API_KEY
```

**Netlify**:
Site settings → Build & deploy → Environment → Add variable

**Local Development**:
```bash
# .env.local
GEMINI_API_KEY=your_key_here
```

---

## Production Considerations

### ⚠️ Security Warning

**Current architecture uses client-side API calls**, which exposes your API key to users. For production use, consider:

1. **Backend Proxy** (recommended)
2. **Rate limiting**
3. **User authentication**
4. **API key rotation**

See [Backend Deployment](#backend-deployment) section.

---

## Backend Deployment

### Architecture

```
Frontend (Static)     Backend (API)         Database
    Vercel      →    Railway/Render   →   PostgreSQL
                         ↓
                    Gemini API
```

### Option 1: Railway

**Advantages**:
- Easy setup
- Integrated PostgreSQL
- Automatic deployments
- Built-in monitoring

**Steps**:

1. **Create Railway account**: [railway.app](https://railway.app)

2. **Create new project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose backend repository

3. **Add PostgreSQL**:
   - Click "New" → "Database" → "PostgreSQL"
   - Connection string auto-injected

4. **Set environment variables**:
   ```
   GEMINI_API_KEY=your_key
   DATABASE_URL=auto_injected
   PORT=3000
   NODE_ENV=production
   ```

5. **Deploy automatically on push**

### Option 2: Render

**Steps**:

1. Go to [render.com](https://render.com)
2. New → Web Service
3. Connect GitHub repository
4. Configure:
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Add environment variables
6. Create PostgreSQL database separately
7. Deploy!

### Option 3: AWS (Advanced)

**Services needed**:
- EC2 or ECS for backend
- RDS for PostgreSQL
- S3 + CloudFront for frontend
- Route 53 for DNS
- Certificate Manager for SSL

**Note**: AWS requires more configuration but provides maximum control.

---

## Database Setup

### PostgreSQL Schema

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Campaigns table
CREATE TABLE campaigns (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  niche VARCHAR(100),
  city VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Leads table
CREATE TABLE leads (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER REFERENCES campaigns(id),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  rating DECIMAL(2,1),
  reviews INTEGER,
  website VARCHAR(500),
  opportunities JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Audits table
CREATE TABLE audits (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER REFERENCES leads(id),
  content TEXT,
  gaps JSONB,
  sources JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Pitches table
CREATE TABLE pitches (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER REFERENCES leads(id),
  audit_id INTEGER REFERENCES audits(id),
  pitch_text TEXT,
  tone VARCHAR(50),
  length VARCHAR(50),
  focus VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Migration Scripts

Use a migration tool like:
- [node-pg-migrate](https://www.npmjs.com/package/node-pg-migrate)
- [Knex.js](http://knexjs.org/)
- [Prisma](https://www.prisma.io/)

---

## Performance Optimization

### Frontend Optimization

1. **Code Splitting**:
   ```typescript
   const Component = lazy(() => import('./Component'));
   ```

2. **Asset Optimization**:
   - Enable Vite build optimizations
   - Use image CDN for static assets
   - Compress images

3. **Caching**:
   ```typescript
   // Service worker for offline support
   if ('serviceWorker' in navigator) {
     navigator.serviceWorker.register('/sw.js');
   }
   ```

### Backend Optimization

1. **Redis Caching**:
   ```javascript
   // Cache audit results for 24 hours
   const cachedAudit = await redis.get(`audit:${leadId}`);
   if (cachedAudit) return JSON.parse(cachedAudit);
   ```

2. **Database Indexing**:
   ```sql
   CREATE INDEX idx_leads_campaign ON leads(campaign_id);
   CREATE INDEX idx_audits_lead ON audits(lead_id);
   ```

3. **Connection Pooling**:
   ```javascript
   const pool = new Pool({
     max: 20,
     idleTimeoutMillis: 30000,
     connectionTimeoutMillis: 2000,
   });
   ```

---

## Monitoring & Logging

### Error Tracking

**Sentry Setup**:
```bash
npm install @sentry/react
```

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: process.env.NODE_ENV,
});
```

### Performance Monitoring

**Google Analytics**:
```html
<!-- Add to index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

### Uptime Monitoring

- [UptimeRobot](https://uptimerobot.com/) (free)
- [Pingdom](https://www.pingdom.com/)
- [StatusCake](https://www.statuscake.com/)

---

## Continuous Deployment

### GitHub Actions Workflow

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## SSL/TLS Certificates

### Automatic (Vercel/Netlify)
- SSL certificates provisioned automatically
- Auto-renewal handled
- No configuration needed

### Manual (Custom Server)
```bash
# Using Let's Encrypt
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## Domain Configuration

### DNS Records

**A Record** (apex domain):
```
Type: A
Name: @
Value: [Your server IP]
TTL: 3600
```

**CNAME Record** (www):
```
Type: CNAME
Name: www
Value: yourdomain.com
TTL: 3600
```

### Vercel Custom Domain

1. Add domain in Vercel dashboard
2. Update DNS:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   ```
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

---

## Rollback Strategy

### Vercel
- Click "Rollback" on any previous deployment
- Instant rollback (no downtime)

### Manual Deployment
```bash
# Tag releases
git tag v1.0.0
git push --tags

# Rollback to previous version
git checkout v1.0.0
npm run build
npm run deploy
```

---

## Backup & Recovery

### Database Backups

**Automated** (Railway):
- Daily automatic backups
- Point-in-time recovery

**Manual**:
```bash
pg_dump -h host -U user dbname > backup.sql
```

**Restore**:
```bash
psql -h host -U user dbname < backup.sql
```

### Code Backups

- GitHub automatically stores all code
- Use tags for release versions
- Keep deployment scripts in version control

---

## Cost Estimation

### Free Tier (MVP)

| Service | Cost |
|---------|------|
| Vercel | $0 |
| Gemini API | $0 (with limits) |
| GitHub | $0 |
| **Total** | **$0/month** |

### Production (Small Scale)

| Service | Cost |
|---------|------|
| Vercel Pro | $20/month |
| Railway (Backend + DB) | $10/month |
| Gemini API | ~$20/month |
| Monitoring | $10/month |
| **Total** | **~$60/month** |

### Production (Medium Scale)

| Service | Cost |
|---------|------|
| Vercel Team | $50/month |
| Railway Pro | $50/month |
| Gemini API | ~$200/month |
| Redis Cache | $15/month |
| Monitoring & Analytics | $50/month |
| **Total** | **~$365/month** |

---

## Checklist

### Pre-Deployment

- [ ] Environment variables configured
- [ ] Build passes locally
- [ ] No console errors in production build
- [ ] API keys rotated for production
- [ ] Error tracking configured
- [ ] Analytics set up
- [ ] Domain purchased (if custom)
- [ ] SSL certificate ready

### Post-Deployment

- [ ] Verify site loads correctly
- [ ] Test all features end-to-end
- [ ] Check error tracking works
- [ ] Monitor performance metrics
- [ ] Set up uptime monitoring
- [ ] Document deployment process
- [ ] Configure backup strategy

---

## Troubleshooting

### Build Fails

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Environment Variables Not Working

- Check spelling and case sensitivity
- Restart dev server after changes
- Verify variables are prefixed with `VITE_` for Vite

### 404 Errors on Routes

For SPAs, configure redirects:

**Vercel** (`vercel.json`):
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**Netlify** (`_redirects`):
```
/*  /index.html  200
```

---

## Support

For deployment issues:
- Check provider documentation
- Open an issue on GitHub
- Join community discussions

---

**Last Updated**: December 30, 2024
