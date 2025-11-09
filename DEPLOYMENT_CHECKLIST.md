# Vercel Deployment Checklist

## ⚠️ Critical: Environment Variables Required

Your deployment is failing because **environment variables are missing**. Add these in Vercel Dashboard:

### 1. Go to Vercel Dashboard
- Navigate to: Project Settings → Environment Variables
- Add ALL of the following variables

### 2. Required Environment Variables

```bash
# Database (REQUIRED - app will crash without these)
DATABASE_URL=postgresql://neondb_owner:npg_v7m9sbqAWdYM@ep-flat-lab-agx4bg0c-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require

DIRECT_URL=postgresql://neondb_owner:npg_v7m9sbqAWdYM@ep-flat-lab-agx4bg0c.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require

# Session Secret (REQUIRED - auth will fail without this)
SESSION_SECRET=Kj8mN2pQ9rT5vX7wZ1aB3cD6eF8gH0iJ2kL4mN6oP8qR

# Optional: Base URL (only if using custom domain)
# NEXT_PUBLIC_BASE_URL=https://enterprise.blairify.com
```

### 3. Apply to All Environments
Make sure to select:
- ✅ Production
- ✅ Preview
- ✅ Development

### 4. Redeploy
After adding variables:
1. Go to Deployments tab
2. Click "..." on latest deployment
3. Click "Redeploy"

## Why Your Deployment is Failing

### The Problem
Your app is returning 404 for all routes because:

1. **Missing DATABASE_URL** → Prisma can't connect → App crashes on startup
2. **Missing SESSION_SECRET** → Auth middleware fails → All routes blocked
3. **No error logs visible** → Vercel shows 404 instead of 500 error

### The Solution
Once you add the environment variables, the app will:
1. ✅ Connect to database successfully
2. ✅ Initialize auth middleware
3. ✅ Serve routes correctly
4. ✅ Show proper error messages if something else fails

## Verification Steps

After redeployment, test these URLs:

1. **Homepage**: `https://your-app.vercel.app/`
   - Should show: Landing page with "AI-Powered Interview Platform"
   
2. **Auth page**: `https://your-app.vercel.app/auth`
   - Should show: Login/signup form
   
3. **Dashboard** (requires login): `https://your-app.vercel.app/dashboard`
   - Should redirect to: `/login` if not authenticated

## Common Issues

### Issue: Still getting 404
**Solution**: Check Vercel Function Logs for actual error messages
- Go to: Deployments → Click deployment → Functions tab
- Look for errors mentioning DATABASE_URL or SESSION_SECRET

### Issue: "Invalid session" errors
**Solution**: Make sure SESSION_SECRET is at least 32 characters

### Issue: Database connection errors
**Solution**: Verify DATABASE_URL is exactly as shown above (no extra spaces)

## Next Steps

1. ✅ Add environment variables to Vercel
2. ✅ Redeploy
3. ✅ Test homepage loads
4. ✅ Test auth flow works
5. ✅ Configure custom domain (optional)
