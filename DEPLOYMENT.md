# Deploying OGUBolt to Vercel

This guide will walk you through deploying your OGUBolt community forum to Vercel.

## Prerequisites

- ✅ GitHub account with the ogubolt repository
- ✅ Supabase project set up with database migrated
- ✅ Vercel account (free tier works great)

## Step-by-Step Deployment Guide

### 1. Push to GitHub (Already Done!)

Your code is already pushed to:
```
Repository: Xearper/ogubolt
Branch: claude/create-community-forum-011CUKJdLmeNkUreB6RvhxGw
```

### 2. Sign Up for Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub account

### 3. Import Your Project

1. Once logged in, click **"Add New..."** → **"Project"**
2. You'll see a list of your GitHub repositories
3. Find **"ogubolt"** in the list
4. Click **"Import"** next to it

### 4. Configure Project

On the configuration screen:

**Framework Preset:** Next.js (should be auto-detected)

**Root Directory:** `./` (leave as is)

**Build Command:** `npm run build` (auto-filled)

**Output Directory:** `.next` (auto-filled)

**Install Command:** `npm install` (auto-filled)

### 5. Add Environment Variables

Click **"Environment Variables"** section and add these:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ybmyecgpfzilvtyqttqf.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlibXllY2dwZnppbHZ0eXF0dHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5ODU4MzgsImV4cCI6MjA3NjU2MTgzOH0.gqtoOiUNx907BRVfK6tBdfawVs4ddxdMsR1TopNqSJ4` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlibXllY2dwZnppbHZ0eXF0dHFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDk4NTgzOCwiZXhwIjoyMDc2NTYxODM4fQ.NDMZorlk7E993kLgUWGpA7BflaAl3uNPMRhLNLimDG4` |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` (will update after deployment) |

**Important:** Make sure to paste the FULL values for each variable!

### 6. Deploy!

1. Click **"Deploy"**
2. Vercel will start building your application
3. Wait 2-3 minutes for the build to complete
4. You'll see a success screen with your live URL! 🎉

### 7. Update Supabase Settings

After deployment, you need to update Supabase to allow your Vercel URL:

1. Note your Vercel URL (e.g., `https://ogubolt-xyz.vercel.app`)

2. Go to your Supabase Dashboard:
   https://supabase.com/dashboard/project/ybmyecgpfzilvtyqttqf

3. Navigate to **Authentication** → **URL Configuration**

4. Update the following:
   - **Site URL:** `https://your-vercel-url.vercel.app`
   - **Redirect URLs:** Add `https://your-vercel-url.vercel.app/api/auth/callback`

5. Click **"Save"**

### 8. Update Environment Variable

1. Go back to Vercel
2. Navigate to your project → **Settings** → **Environment Variables**
3. Find `NEXT_PUBLIC_APP_URL`
4. Update it to your actual Vercel URL: `https://your-vercel-url.vercel.app`
5. Click **"Save"**
6. Go to **Deployments** tab
7. Click the **"..."** menu on the latest deployment
8. Click **"Redeploy"** → **"Redeploy"**

## Testing Your Deployment

1. Visit your Vercel URL
2. Test the following:
   - ✅ Homepage loads
   - ✅ Theme toggle works
   - ✅ Mobile menu works (resize browser or use mobile device)
   - ✅ Sign up creates an account
   - ✅ Sign in works
   - ✅ Can create a thread (if logged in)

## Automatic Deployments

Vercel automatically deploys when you push to your branch! Every time you:
1. Make changes locally
2. Commit: `git commit -m "your message"`
3. Push: `git push`

Vercel will automatically rebuild and redeploy your site. 🚀

## Custom Domain (Optional)

Want a custom domain like `ogubolt.com`?

1. In Vercel, go to your project → **Settings** → **Domains**
2. Click **"Add"**
3. Enter your domain name
4. Follow instructions to update DNS settings with your domain provider
5. Wait for DNS propagation (can take up to 48 hours)

## Troubleshooting

### Build Fails

**Error:** "Module not found"
- **Solution:** Make sure all dependencies are in `package.json`
- Run `npm install` locally to verify

**Error:** "Environment variable is undefined"
- **Solution:** Double-check all environment variables are added in Vercel

### Authentication Not Working

**Error:** "Invalid redirect URL"
- **Solution:** Make sure you added your Vercel URL to Supabase redirect URLs

**Error:** "Can't create account"
- **Solution:** Check Supabase Dashboard → Authentication → Users for error messages

### Database Errors

**Error:** "relation does not exist"
- **Solution:** Make sure you ran the database migration in Supabase SQL Editor

## Performance Optimization

Your deployment includes:
- ✅ Automatic edge caching
- ✅ Image optimization
- ✅ Gzip compression
- ✅ Global CDN
- ✅ Automatic HTTPS

## Monitoring

View your deployment metrics:
1. Go to Vercel dashboard
2. Click on your project
3. Click **"Analytics"** tab
4. See visitor stats, performance metrics, and more

## Support

- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Next.js Deployment:** [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)
- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)

---

## Quick Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Signed up for Vercel account
- [ ] Imported project from GitHub
- [ ] Added all 4 environment variables
- [ ] Clicked "Deploy"
- [ ] Updated Supabase Site URL
- [ ] Updated Supabase Redirect URLs
- [ ] Updated NEXT_PUBLIC_APP_URL in Vercel
- [ ] Redeployed after URL update
- [ ] Tested authentication
- [ ] Tested mobile responsiveness

**Your OGUBolt forum is now live! 🎉**
