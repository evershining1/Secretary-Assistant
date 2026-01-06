# Google Calendar OAuth Setup Guide

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name: "Calendar Sync App" (or your app name)
4. Click "Create"

## Step 2: Enable Google Calendar API

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google Calendar API"
3. Click on it and click "Enable"

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Select "External" (unless you have a Google Workspace)
3. Click "Create"

**Fill in:**
- App name: Your app name
- User support email: Your email
- Developer contact: Your email
- Scopes: Click "Add or Remove Scopes"
  - Search for "Google Calendar API"
  - Select `.../auth/calendar` (Read/write access)
- Test users: Add your email for testing

4. Click "Save and Continue" through all steps

## Step 4: Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Application type: "Web application"
4. Name: "Calendar Sync Web Client"

**Authorized JavaScript origins:**
```
http://localhost:5173
```

**Authorized redirect URIs:**
```
http://localhost:5173/auth/google/callback
```

5. Click "Create"
6. **Copy your Client ID** - you'll need this!

## Step 5: Add to Environment Variables

1. Open your `.env` file
2. Add:
```env
VITE_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
```

3. Restart your dev server:
```bash
npm run dev
```

## Step 6: Run Database Migration

Run the OAuth tokens table migration in your Supabase SQL editor:

```sql
-- Copy contents from supabase-oauth-tokens.sql
```

Or use the Supabase CLI:
```bash
supabase db push
```

## Step 7: Test the Integration

1. Go to Settings page in your app
2. Click the toggle for "Google Calendar"
3. You should see a Google sign-in popup
4. Grant calendar permissions
5. The popup should close and the toggle should turn on

## Troubleshooting

### "redirect_uri_mismatch" error
- Make sure the redirect URI in Google Cloud Console exactly matches:
  `http://localhost:5173/auth/google/callback`
- No trailing slash!

### "Access blocked" error
- Add your email to "Test users" in OAuth consent screen
- Your app is in testing mode, only test users can sign in

### Token not saving
- Check Supabase logs for errors
- Verify the `oauth_tokens` table exists
- Check browser console for errors

### Popup blocked
- Allow popups for localhost in your browser settings

## Production Deployment

When deploying to production:

1. Add production domain to "Authorized JavaScript origins":
   ```
   https://yourdomain.com
   ```

2. Add production redirect URI:
   ```
   https://yourdomain.com/auth/google/callback
   ```

3. Update `.env` with production URL
4. Verify OAuth consent screen (may need Google verification for public release)

## Security Notes

- Never commit `.env` file to git
- Client ID is safe to expose (it's public)
- Never expose Client Secret in frontend code
- Use HTTPS in production
- Tokens are encrypted in Supabase
