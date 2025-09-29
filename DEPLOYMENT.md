# NOTY App Deployment Guide

This guide explains how to deploy the NOTY app with the client (frontend) and server (backend) hosted separately.

## Architecture Overview
- **Frontend (Client)**: React/Vite app → Deploy to Vercel/Netlify
- **Backend (Server)**: Node.js/Express API → Deploy to Render/Railway
- **Database**: MongoDB → MongoDB Atlas (free tier)

## Prerequisites
1. Create accounts on:
   - [MongoDB Atlas](https://www.mongodb.com/atlas) (for database)
   - [Vercel](https://vercel.com) or [Netlify](https://netlify.com) (for frontend)
   - [Render](https://render.com) or [Railway](https://railway.app) (for backend)
2. Have your Google OAuth credentials ready

---

## Step 1: Database Setup (MongoDB Atlas)

1. **Create a free cluster** on MongoDB Atlas
2. **Create a database user** with read/write permissions
3. **Whitelist IP addresses** (0.0.0.0/0 for any IP - less secure but works for testing)
4. **Get your connection string**:
   ```
   mongodb+srv://<username>:<password>@cluster.xxxxx.mongodb.net/noty?retryWrites=true&w=majority
   ```

---

## Step 2: Deploy Backend (Server)

### Option A: Deploy to Render (Recommended)

1. **Push code to GitHub** (already done ✓)

2. **Create new Web Service on Render**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository: `NOTY-HD`
   - Configure:
     - **Name**: `noty-server` (or your choice)
     - **Root Directory**: `server`
     - **Environment**: `Node`
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
     - **Instance Type**: Free

3. **Set Environment Variables** in Render:
   ```
   NODE_ENV=production
   PORT=4000
   CLIENT_ORIGIN=https://your-frontend-url.vercel.app
   MONGO_URI=mongodb+srv://...your-connection-string...
   JWT_SECRET=your-very-long-random-string-at-least-32-chars
   GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   
   # Optional SMTP (if using email OTP)
   SMTP_HOST=smtp-relay.brevo.com
   SMTP_PORT=587
   SMTP_USER=your-smtp-user
   SMTP_PASS=your-smtp-password
   ```

4. **Deploy**: Click "Create Web Service"

5. **Note your server URL**: `https://noty-server.onrender.com`

### Option B: Deploy to Railway

1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`
3. In server directory: `cd server`
4. Initialize: `railway init`
5. Link to GitHub: `railway link`
6. Set environment variables: `railway variables set KEY=value`
7. Deploy: `railway up`

---

## Step 3: Deploy Frontend (Client)

### Option A: Deploy to Vercel (Recommended)

1. **Install Vercel CLI** (optional):
   ```bash
   npm install -g vercel
   ```

2. **Deploy via GitHub** (Easiest):
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"
   - Import your GitHub repository: `NOTY-HD`
   - Configure:
     - **Root Directory**: `client`
     - **Framework Preset**: Vite
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`

3. **Set Environment Variables** in Vercel:
   ```
   VITE_API_BASE=https://noty-server.onrender.com
   VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   ```

4. **Deploy**: Click "Deploy"

5. **Note your frontend URL**: `https://noty-app.vercel.app`

### Option B: Deploy to Netlify

1. **Via GitHub**:
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect GitHub and select `NOTY-HD`
   - Configure:
     - **Base directory**: `client`
     - **Build command**: `npm run build`
     - **Publish directory**: `client/dist`

2. **Set Environment Variables** in Netlify:
   - Go to Site settings → Environment variables
   - Add the same variables as Vercel option

---

## Step 4: Update CORS & OAuth Settings

1. **Update Google OAuth**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Add your production URLs to Authorized JavaScript origins:
     - `https://noty-app.vercel.app`
   - Add to Authorized redirect URIs:
     - `https://noty-app.vercel.app/dashboard`

2. **Update Server's CLIENT_ORIGIN**:
   - In Render/Railway, update the `CLIENT_ORIGIN` environment variable:
     ```
     CLIENT_ORIGIN=https://noty-app.vercel.app
     ```

---

## Step 5: Test Your Deployment

1. Visit your frontend URL: `https://noty-app.vercel.app`
2. Try signing up with email/password
3. Try Google OAuth login
4. Create, edit, delete notes
5. Check that all features work

---

## Deployment Commands Summary

### Backend (Render)
- Automatic deployment from GitHub pushes to main branch
- Manual redeploy: Render Dashboard → Manual Deploy

### Frontend (Vercel)
- Automatic deployment from GitHub pushes
- Manual redeploy: `vercel --prod` (if using CLI)

---

## Troubleshooting

### CORS Issues
- Ensure `CLIENT_ORIGIN` in server matches your frontend URL exactly
- Check that server allows credentials in CORS config

### MongoDB Connection Issues
- Verify connection string is correct
- Check IP whitelist in MongoDB Atlas
- Ensure database user has correct permissions

### Google OAuth Issues
- Verify client ID matches in both frontend and backend
- Check authorized origins and redirect URIs in Google Console
- Ensure production URLs are added to Google OAuth settings

### Build Failures
- Check Node.js version compatibility (use Node 18+ for best results)
- Verify all dependencies are in package.json (not devDependencies for production deps)
- Check TypeScript compilation errors in build logs

---

## Free Tier Limitations

### Render Free Tier
- Spins down after 15 minutes of inactivity (cold starts)
- 750 hours/month runtime
- Limited to 512MB RAM

### Vercel Free Tier
- 100GB bandwidth/month
- Unlimited deployments
- Serverless functions included

### MongoDB Atlas Free Tier
- 512MB storage
- Shared cluster
- Good for development and small apps

---

## Upgrading to Production

When ready to scale:
1. **Backend**: Upgrade Render/Railway to paid tier for always-on service
2. **Database**: Upgrade MongoDB Atlas for dedicated cluster
3. **Frontend**: Vercel/Netlify free tier is usually sufficient
4. **Add monitoring**: Use services like Sentry, LogRocket
5. **Add CDN**: CloudFlare for better global performance
