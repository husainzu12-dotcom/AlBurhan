# Deployment & Setup Guide for AL-BURHAN Business App

## Pre-Deployment Checklist

- [ ] All modules tested locally
- [ ] Database schema deployed to Supabase
- [ ] Auth user created for Zohair
- [ ] Environment variables configured
- [ ] Mobile responsiveness verified
- [ ] Print functionality tested
- [ ] GST calculations verified

## Step 1: Supabase Setup

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization and database name
4. Set password (save it!)
5. Choose region (closest to India: Singapore or Mumbai)
6. Wait for project to initialize

### 1.2 Deploy Database Schema
1. Go to SQL Editor in Supabase
2. Create new query
3. Copy entire content from `DATABASE_SCHEMA.sql`
4. Paste and execute
5. Wait for all tables and triggers to be created

### 1.3 Create Authentication User
1. Go to Authentication > Users
2. Click "Invite user" or use "Add user"
3. Email: zohair@alburhan.com (or your preference)
4. Password: Generate strong password
5. Mark as confirmed

### 1.4 Get API Keys
1. Go to Settings > API
2. Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
3. Copy `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Copy `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`
5. Save these securely

## Step 2: Local Development Setup

### 2.1 Clone/Setup Project
```bash
cd c:\Users\Husain\Desktop\BUSINESS\ APP
npm install
```

### 2.2 Configure .env.local
Create file `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
NEXT_PUBLIC_APP_NAME=AL-BURHAN Industrial Drives
NEXT_PUBLIC_OWNER_NAME=Zohair
NEXT_PUBLIC_GST_RATE=18
```

### 2.3 Test Locally
```bash
npm run dev
```
- Navigate to http://localhost:3000
- Try login with Zohair's credentials
- Create test data
- Verify calculations
- Test print functionality

## Step 3: Production Deployment

### Option A: Deploy to Vercel (Recommended)

#### 3A.1 Prepare for Vercel
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/al-burhan-app
git push -u origin main
```

#### 3A.2 Deploy
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import from GitHub
4. Select repository
5. Set Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_NAME`
   - `NEXT_PUBLIC_OWNER_NAME`
   - `NEXT_PUBLIC_GST_RATE`
6. Click Deploy
7. Get production URL

#### 3A.3 Configure Supabase Auth
1. In Supabase, go to Authentication > Providers
2. Go to Auth > URL Configuration
3. Add Vercel URL to Redirect URLs:
   - `https://your-app.vercel.app/auth/callback`
   - `https://your-app.vercel.app`

### Option B: Deploy to Own Server

#### 3B.1 Build for Production
```bash
npm run build
```

#### 3B.2 Start Production Server
```bash
npm run start
```

#### 3B.3 Use PM2 for Process Management
```bash
npm install -g pm2
pm2 start "npm run start" --name "al-burhan-app"
pm2 startup
pm2 save
```

#### 3B.4 Setup Nginx Reverse Proxy
```nginx
server {
    listen 80;
    server_name yourdomain.com;

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

#### 3B.5 SSL Certificate (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## Step 4: Post-Deployment

### 4.1 Create Initial Data
1. Login as Zohair
2. Add 2-3 manufacturers
3. Add 3-5 equipment items
4. Add 2-3 sample customers
5. Create test sales and payments

### 4.2 Backup Strategy
- Daily database backups (Supabase Auto Backup)
- Export critical data weekly
- Document all configurations

### 4.3 Monitoring
- Monitor Supabase dashboard
- Check error logs regularly
- Monitor server performance
- Set up alerts for critical issues

### 4.4 Security Hardening
1. **Database**
   - Change default password
   - Enable RLS policies (already done)
   - Review user permissions

2. **Application**
   - Keep dependencies updated
   - Monitor for vulnerabilities
   - Regular security audits

3. **Access**
   - Use strong password for Zohair account
   - Enable 2FA if available
   - Restrict IP access if needed

## Troubleshooting

### Login Issues
- Check email in Supabase Auth users
- Verify password is correct
- Check JWT expiration settings

### Database Connection Issues
- Verify Supabase URL and keys in .env.local
- Check database is running
- Verify RLS policies

### Stock Auto-Reduction Not Working
- Check trigger function in database
- Verify sale_items insert is triggered
- Test trigger manually in SQL

### GST Calculation Wrong
- Verify `NEXT_PUBLIC_GST_RATE=18` in env
- Check calculations.ts for correct formula
- Test with sample numbers

## Performance Optimization

### Database
- Indexes are pre-created in schema
- Use pagination for large tables
- Monitor slow queries

### Frontend
- Images are optimized
- CSS is minified
- Bundle size monitoring

### API
- Implement caching for static data
- Rate limiting on auth endpoints
- Query optimization

## Maintenance

### Monthly Tasks
- [ ] Review and clean old data
- [ ] Update dependencies
- [ ] Check disk usage
- [ ] Review error logs

### Quarterly Tasks
- [ ] Security audit
- [ ] Performance review
- [ ] Backup verification
- [ ] Update documentation

### Annual Tasks
- [ ] Major version updates
- [ ] Infrastructure review
- [ ] Disaster recovery drill

## Support & Documentation

For ongoing support:
1. Keep detailed logs
2. Document customizations
3. Maintain contact info for vendors
4. Create user manual for operations

---

**Estimated Setup Time**: 1-2 hours  
**Estimated Deployment Time**: 30 minutes  
**Maintenance**: ~1 hour/month
