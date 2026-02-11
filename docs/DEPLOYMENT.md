# Deployment Guide - Melissa AI

## 🚀 Deploying to Production

This guide covers deploying Melissa AI to various hosting platforms.

---

## Option 1: Render (Recommended - Easiest)

Render provides free hosting for both frontend and backend.

### Step 1: Prepare Your Repository

1. Push your code to GitHub (if not already)
2. Make sure `.env` is in `.gitignore` (it already is)

### Step 2: Deploy Backend

1. Go to https://render.com
2. Sign up / Log in
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name:** melissa-ai-backend
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

6. Add Environment Variables:
   ```
   OPENAI_API_KEY=your_openai_api_key
   PORT=3000
   JWT_SECRET=your_secure_secret
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your_secure_password
   ```

7. Click "Create Web Service"

### Step 3: Update Frontend URLs

Once deployed, Render gives you a URL like: `https://melissa-ai-backend.onrender.com`

Update in your frontend files:
- `public/js/app.js`
- `public/js/admin.js`
- `public/js/widget.js`

Change:
```javascript
const API_URL = 'https://melissa-ai-backend.onrender.com';
```

### Step 4: Access Your App

Your app will be live at: `https://melissa-ai-backend.onrender.com`

---

## Option 2: Railway

### Step 1: Install Railway CLI (Optional)

```bash
npm i -g @railway/cli
railway login
```

### Step 2: Deploy

```bash
cd "Melissa AI-Business Development Chatbot"
railway init
railway up
```

### Step 3: Add Environment Variables

```bash
railway variables set OPENAI_API_KEY=your_key
railway variables set JWT_SECRET=your_secret
railway variables set ADMIN_USERNAME=admin
railway variables set ADMIN_PASSWORD=your_password
```

Or add them in the Railway dashboard.

---

## Option 3: Heroku

### Step 1: Install Heroku CLI

Download from: https://devcenter.heroku.com/articles/heroku-cli

### Step 2: Deploy

```bash
cd "Melissa AI-Business Development Chatbot"
heroku login
heroku create melissa-ai-chatbot
git push heroku main
```

### Step 3: Set Environment Variables

```bash
heroku config:set OPENAI_API_KEY=your_key
heroku config:set JWT_SECRET=your_secret
heroku config:set ADMIN_USERNAME=admin
heroku config:set ADMIN_PASSWORD=your_password
```

### Step 4: Open App

```bash
heroku open
```

---

## Option 4: Vercel (Frontend + Serverless Functions)

### Step 1: Install Vercel CLI

```bash
npm i -g vercel
```

### Step 2: Create `vercel.json`

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server/index.js"
    }
  ]
}
```

### Step 3: Deploy

```bash
vercel
```

Add environment variables in Vercel dashboard.

---

## Option 5: DigitalOcean App Platform

### Step 1: Create App

1. Go to https://cloud.digitalocean.com/apps
2. Click "Create App"
3. Connect GitHub repository

### Step 2: Configure

- **Source Directory:** /
- **Environment Variables:** Add all from `.env`
- **Run Command:** `npm start`
- **HTTP Port:** 3000

### Step 3: Deploy

DigitalOcean will build and deploy automatically.

---

## Option 6: VPS Deployment (Advanced)

For deploying on your own Linux server.

### Step 1: Set Up Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2
```

### Step 2: Clone and Setup

```bash
cd /var/www
git clone your-repo-url melissa-ai
cd melissa-ai
npm install
```

### Step 3: Configure Environment

```bash
nano .env
# Add your environment variables
```

### Step 4: Start with PM2

```bash
pm2 start server/index.js --name melissa-ai
pm2 save
pm2 startup
```

### Step 5: Set Up Nginx (Optional)

```bash
sudo apt install nginx

# Create config
sudo nano /etc/nginx/sites-available/melissa-ai
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable:
```bash
sudo ln -s /etc/nginx/sites-available/melissa-ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 6: SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## Production Configuration

### Security Checklist

- [ ] Change default admin credentials
- [ ] Use strong JWT secret (32+ random characters)
- [ ] Enable HTTPS (SSL certificate)
- [ ] Set up rate limiting
- [ ] Configure CORS properly
- [ ] Use environment variables for all secrets
- [ ] Keep dependencies updated
- [ ] Set up monitoring and logging

### Performance Optimization

1. **Enable Compression**
```javascript
// In server/index.js
const compression = require('compression');
app.use(compression());
```

2. **Add Rate Limiting**
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

3. **Caching**
```javascript
// Cache static files
app.use(express.static('public', {
  maxAge: '1d',
  etag: true
}));
```

### Environment Variables for Production

```env
# Required
OPENAI_API_KEY=your_production_openai_key
PORT=3000
NODE_ENV=production

# Security
JWT_SECRET=use_cryptographically_secure_random_string_here
ADMIN_USERNAME=your_secure_username
ADMIN_PASSWORD=use_strong_password_here

# Optional - Production Vector DB
PINECONE_API_KEY=your_pinecone_key
PINECONE_ENVIRONMENT=your_environment
PINECONE_INDEX=melissa-ai-production

# Monitoring (Optional)
SENTRY_DSN=your_sentry_dsn
```

---

## Database Upgrade (Optional)

### Switching to Pinecone for Production

1. **Sign up for Pinecone**
   - Go to https://www.pinecone.io/
   - Create a free account
   - Create an index

2. **Install Pinecone Client**
```bash
npm install @pinecone-database/pinecone
```

3. **Update Vector Store Service**

Create `server/services/pineconeStore.js`:

```javascript
const { Pinecone } = require('@pinecone-database/pinecone');

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY
});

const index = pinecone.index(process.env.PINECONE_INDEX);

// Implement similar methods as vectorStore.js
// but using Pinecone's API instead
```

4. **Update imports** in your route files

---

## Monitoring and Maintenance

### Recommended Tools

1. **Error Tracking:** Sentry
2. **Uptime Monitoring:** UptimeRobot, Pingdom
3. **Analytics:** PostHog, Mixpanel
4. **Logging:** LogRocket, Papertrail

### Health Checks

Add a health check endpoint (already included):
```javascript
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});
```

Monitor this endpoint for uptime.

---

## Rollback Strategy

### Using Git

```bash
# If something goes wrong
git log  # Find previous working commit
git revert <commit-hash>
git push
```

### Platform-Specific

- **Render:** Use "Manual Deploy" from previous commit
- **Railway:** Rollback from dashboard
- **Heroku:** `heroku releases:rollback`

---

## Scaling Strategy

### When to Scale

- Response time > 3 seconds consistently
- High CPU/memory usage
- Growing user base
- Increased document uploads

### Vertical Scaling

Upgrade to larger instance on your platform:
- More RAM
- More CPU cores
- Faster disk

### Horizontal Scaling

- Use load balancer
- Deploy multiple instances
- Use Redis for session storage
- Separate database instance

---

## Backup Strategy

### Database Backups

```bash
# Backup vector store
cp data/vectors/store.json backups/store-$(date +%Y%m%d).json
```

### Automated Backups

```bash
# Cron job (Linux)
0 2 * * * /path/to/backup-script.sh
```

---

## Cost Optimization

### OpenAI API

- Use GPT-3.5-turbo for non-critical responses
- Cache frequent queries
- Implement rate limiting
- Monitor token usage

### Hosting

- Start with free tiers
- Upgrade only when needed
- Use CDN for static assets
- Optimize images and assets

---

## DNS Configuration

Point your domain to your server:

```
Type: A Record
Name: @
Value: Your server IP

Type: CNAME
Name: www
Value: your-domain.com
```

---

## Post-Deployment Checklist

- [ ] App is accessible via HTTPS
- [ ] Admin login works
- [ ] Chat functionality works
- [ ] File upload works
- [ ] Environment variables are set
- [ ] Error tracking is configured
- [ ] Monitoring is active
- [ ] Backups are scheduled
- [ ] Domain is configured
- [ ] SSL certificate is valid

---

## Support & Troubleshooting

### Common Issues

**502 Bad Gateway**
- Server not running
- Wrong port configuration
- Check logs for errors

**CORS Errors**
- Update CORS configuration in server
- Ensure API URL is correct in frontend

**OpenAI Errors**
- Verify API key is correct
- Check account has credits
- Review rate limits

---

**You're ready to deploy! 🚀**

Choose the platform that fits your needs and follow the guide above. Good luck!
