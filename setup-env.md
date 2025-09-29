# Environment Variables Setup

## Quick Copy-Paste Templates

### For Backend (Render/Railway)
```env
NODE_ENV=production
PORT=4000
CLIENT_ORIGIN=https://YOUR-FRONTEND.vercel.app
MONGO_URI=mongodb+srv://YOUR-USERNAME:YOUR-PASSWORD@cluster.xxxxx.mongodb.net/noty?retryWrites=true&w=majority
JWT_SECRET=GENERATE-A-32-CHAR-RANDOM-STRING-HERE
GOOGLE_CLIENT_ID=YOUR-GOOGLE-CLIENT-ID.apps.googleusercontent.com
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-smtp-user@email.com
SMTP_PASS=your-smtp-password
SMTP_FROM=noreply@yourapp.com
```

### For Frontend (Vercel/Netlify)
```env
VITE_API_BASE=https://YOUR-BACKEND.onrender.com
VITE_GOOGLE_CLIENT_ID=YOUR-GOOGLE-CLIENT-ID.apps.googleusercontent.com
```

## Generate JWT Secret
Run this in terminal to generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## MongoDB Atlas Connection String Format
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```
Replace:
- `<username>`: Your database user
- `<password>`: Your database password  
- `<cluster>`: Your cluster name
- `<database>`: Use `noty` or your preferred name

## Google OAuth Setup
1. Go to: https://console.cloud.google.com
2. Create/Select project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized origins:
   - `http://localhost:5173` (development)
   - `https://YOUR-FRONTEND.vercel.app` (production)
6. Add authorized redirect URIs:
   - `http://localhost:5173/dashboard` (development)
   - `https://YOUR-FRONTEND.vercel.app/dashboard` (production)
