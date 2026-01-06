# Supabase Setup Guide

## Quick Start (5 minutes)

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) → Sign in → "New Project"
2. Name: `secretary-app`, choose password & region
3. Wait ~2 minutes for provisioning

### 2. Get Credentials
1. Dashboard → **Settings** → **API**
2. Copy **Project URL** and **anon public** key

### 3. Configure App
```bash
# Create .env file
cp .env.example .env

# Edit .env and add:
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run Database Schema
1. Dashboard → **SQL Editor** → "New query"
2. Copy contents of `supabase-schema.sql`
3. Paste and click "Run"

### 5. Test
```bash
npm run dev
# Navigate to /login and sign in
```

---

## OAuth Setup (Optional)

### Google Calendar
1. [Google Cloud Console](https://console.cloud.google.com/) → Create project
2. Enable **Google Calendar API**
3. **Credentials** → **OAuth 2.0 Client ID**
4. Redirect URI: `https://your-project.supabase.co/auth/v1/callback`
5. Supabase → **Authentication** → **Providers** → Enable **Google**
6. Add scope: `https://www.googleapis.com/auth/calendar`

### GitHub
1. [GitHub Settings](https://github.com/settings/developers) → "New OAuth App"
2. Callback: `https://your-project.supabase.co/auth/v1/callback`
3. Supabase → **Authentication** → **Providers** → Enable **GitHub**

---

## Troubleshooting

**"Invalid API key"** → Check `.env` values, restart dev server

**OAuth not working** → Verify redirect URIs match exactly

**Database errors** → Ensure schema ran successfully in SQL Editor

---

## Resources
- [Supabase Docs](https://supabase.com/docs)
- [Auth Guide](https://supabase.com/docs/guides/auth)
- [Google Calendar API](https://developers.google.com/calendar/api)
