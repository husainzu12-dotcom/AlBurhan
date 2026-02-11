# Setup Supabase & GitHub Integration

Complete guide to connect your app to Supabase and push to GitHub.

---

## Part 1: Supabase Setup (15 minutes)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **"Sign Up"** or **"Start Your Project"**
3. Sign up with email or GitHub
4. Create a new project:
   - **Project Name**: `al-burhan-business`
   - **Password**: Save it somewhere secure (you won't need it often)
   - **Region**: Select your region (closest to India is Singapore or Mumbai if available)
   - Click **"Create new project"**
5. Wait for project to initialize (2-3 minutes)

### Step 2: Get Your Credentials

Once your project is ready:

1. Go to **Project Settings** (⚙️ icon, bottom left)
2. Click **"API"** in the left menu
3. You'll see your credentials:
   - **Project URL** → Copy this (looks like: `https://xxxxx.supabase.co`)
   - **Anon Public key** → Copy this (long string)
   - **Service Role key** → Copy this (long string, keep it SECRET!)

### Step 3: Deploy Database Schema

1. Go back to the main project view
2. Click **"SQL Editor"** in the left menu
3. Click **"New Query"**
4. Open [DATABASE_SCHEMA.sql](DATABASE_SCHEMA.sql) file
5. Copy ALL the content
6. Paste into the Supabase SQL Editor
7. Click **"Run"** (play button)
8. Wait for all tables and triggers to complete (you'll see ✓ checkmarks)

**What was created:**
- 11 tables (customers, equipment, sales, payments, invoices, etc.)
- 4 automatic triggers (stock reduction, balance tracking, etc.)
- Row-Level Security policies
- Indexes for performance

### Step 4: Create Your Auth User

1. Go to **Authentication** → **Users** in the left menu
2. Click **"Invite"** → **"Send Invite"**
3. Enter email: `zohair@example.com`
4. You'll receive an invite email
5. Click the link and set a password (save it!)
6. You'll be redirected to set password - your login is ready!

### Step 5: Update .env.local

1. Open [.env.local](.env.local)
2. Replace the placeholder values:

```env
# Copy from Supabase Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your_anon_key...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your_service_role_key...
```

**Where to find each:**
- `NEXT_PUBLIC_SUPABASE_URL` - Project Settings → API → Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Project Settings → API → Anon Public key
- `SUPABASE_SERVICE_ROLE_KEY` - Project Settings → API → Service Role key

**⚠️ IMPORTANT:**
- Never commit `.env.local` to GitHub (it's already in .gitignore)
- Never share the Service Role key
- Anon key is public (safe to commit)

### Step 6: Test the Connection

1. Save `.env.local`
2. The dev server will auto-reload
3. Go to [http://localhost:3000](http://localhost:3000)
4. Login with:
   - Email: `zohair@example.com`
   - Password: (the one you set)
5. You should see the dashboard!
6. Try creating a test customer to verify database connection

---

## Part 2: GitHub Setup (10 minutes)

### Step 1: Create GitHub Repository

1. Go to [github.com](https://github.com)
2. Sign in or create account
3. Click **"+"** (top right) → **"New repository"**
4. Configure:
   - **Repository name**: `al-burhan-business-app`
   - **Description**: `Internal business management system for AL-BURHAN Industrial Drives`
   - **Visibility**: **Private** (only you can see it)
   - **Add .gitignore**: Select **"Node"**
   - **Add license**: Select **"MIT"** (optional)
5. Click **"Create repository"**

### Step 2: Initialize Git Locally

Open terminal in your project folder and run:

```bash
# Initialize git if not already done
git init

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/al-burhan-business-app.git

# Stage all files
git add .

# Create first commit
git commit -m "Initial commit: AL-BURHAN Business App"

# Push to GitHub
git branch -M main
git push -u origin main
```

**Replace `YOUR_USERNAME`** with your actual GitHub username.

### Step 3: Verify on GitHub

1. Go to your GitHub repository
2. Refresh the page
3. You should see all your files uploaded
4. Check that `.env.local` is NOT there (it should be in .gitignore)

---

## Complete Integration Test

Now test everything works together:

1. **Database**: ✅ Create a manufacturer
2. **Auth**: ✅ You're logged in as Zohair
3. **GitHub**: ✅ Changes are tracked in git

### Quick Test Workflow:

1. Go to [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
2. Click **Manufacturers** → **New**
3. Add test manufacturer:
   - **Name**: Test Corp
   - **Contact**: +91-1234567890
   - **Email**: test@corp.com
   - **Location**: Mumbai
4. Click **Save**
5. Verify it appears in the Manufacturers list
6. Commit to GitHub:

```bash
git add .
git commit -m "Test: Added manufacturer management"
git push
```

---

## Troubleshooting

### "Cannot POST /api/auth" or "Auth failed"
- **Check**: Supabase URL and keys in `.env.local`
- **Fix**: Copy exact values from Supabase Project Settings → API
- **Verify**: No extra spaces or quotes

### "Database connection error"
- **Check**: DATABASE_SCHEMA.sql was executed successfully in Supabase
- **Fix**: Go to Supabase → SQL Editor → check all tables exist
- **Verify**: Run query `SELECT table_name FROM information_schema.tables;` - should show 11 tables

### "Login page appears but won't accept credentials"
- **Check**: Auth user was created in Supabase
- **Fix**: Go to Supabase → Authentication → Users → verify `zohair@example.com` exists
- **Verify**: You set a password when clicking the invite link

### "Git push fails"
- **Check**: GitHub repository URL is correct
- **Fix**: Verify: `git remote -v` shows correct URL
- **Solution**: If wrong, run: `git remote set-url origin https://github.com/YOUR_USERNAME/al-burhan-business-app.git`

### "Private key exposure warning on GitHub"
- **Fix**: Never commit `.env.local` - it should be in `.gitignore`
- **Check**: `.gitignore` already has `.env.local` listed
- **Verify**: `.env.local` is NOT in GitHub repository files

---

## Next Steps

### After Successful Connection:

1. **Test All Features**
   - Create a customer with POCs
   - Add equipment with prices
   - Create a sale with cart
   - Record a payment
   - View invoice

2. **Create Test Data**
   - 5 customers
   - 10 equipment items
   - 3 manufacturers

3. **Deploy to Production**
   - Follow [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
   - Choose Vercel (recommended) or own server

4. **Backup Supabase Database**
   - Set up automated backups in Supabase
   - Export data regularly

---

## Quick Reference: Environment Variables

```env
# Required for Authentication
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co

# Required for Public Operations (already in .gitignore? No, it's safe to commit)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# ⚠️ NEVER COMMIT: Required for Backend Operations
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# App Configuration (safe to commit)
NEXT_PUBLIC_APP_NAME=AL-BURHAN Industrial Drives
NEXT_PUBLIC_OWNER_NAME=Zohair
NEXT_PUBLIC_GST_RATE=18
```

---

## Security Checklist

- ✅ `.env.local` is in `.gitignore` (not committed)
- ✅ Service Role key is kept private (only in `.env.local`)
- ✅ GitHub repository is Private
- ✅ Supabase RLS policies are enabled (automatic)
- ✅ Auth user has strong password
- ✅ No credentials in code or comments

---

## Git Commands Reference

```bash
# Check git status
git status

# View remote configuration
git remote -v

# Add all changes
git add .

# Commit with message
git commit -m "Describe your changes here"

# Push to GitHub
git push

# Pull latest from GitHub
git pull

# Create new branch
git checkout -b feature/feature-name

# Switch branch
git checkout main

# View commit history
git log --oneline
```

---

## Once Connected

Your app will:
- 🔐 Use Supabase for authentication
- 💾 Store all data in PostgreSQL (Supabase)
- 📝 Auto-calculate GST, stock levels, balances
- 🔒 Have row-level security enabled
- 📦 Track changes in Git/GitHub
- 🚀 Be ready for production deployment

---

**Status**: 
- Supabase: [Your credentials needed]
- GitHub: [Your repository URL needed]
- Dev Server: ✅ Running on localhost:3000

**Next**: Fill in your Supabase credentials in `.env.local` and test!
