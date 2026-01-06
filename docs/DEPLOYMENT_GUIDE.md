# 🚀 Hosting & Mobile Deployment Roadmap

Follow this guide to transition Secretary from your local playground to a global production environment.

## 1. Web Hosting (Vercel / Netlify / Supabase)
Since the app is a Vite React project, any static hosting service works perfectly.
1.  **Repository**: Push your code to a private GitHub repository.
2.  **Deployment**: Connect your repo to **[Vercel](https://vercel.com)** (highly recommended).
3.  **Environment Variables**: Add your `.env` variables to the Vercel dashboard:
    *   `VITE_SUPABASE_URL`
    *   `VITE_SUPABASE_ANON_KEY`
    *   `VITE_GOOGLE_CLIENT_ID`
    *   `VITE_MICROSOFT_CLIENT_ID` (for Outlook)

## 2. Mobile Deployment (iOS & Android)
We have already initialized **Capacitor**. Here are the next steps:

### iOS (Mac Required)
1.  **Add Platform**: Run `npx cap add ios`.
2.  **Build Web App**: Run `npm run build`.
3.  **Sync to Native**: Run `npx cap sync`.
4.  **Xcode**: Run `npx cap open ios`.
    *   Set your "Team" in Signing & Capabilities.
    *   Deploy to a physical device or simulator.

### Android
1.  **Add Platform**: Run `npx cap add android`.
2.  **Build Web App**: Run `npm run build`.
3.  **Sync to Native**: Run `npx cap sync`.
4.  **Android Studio**: Run `npx cap open android`.
    *   Build the APK/AAB and deploy.

### 🔗 Deep Linking (Critical for OAuth)
To make Google/Outlook login work on mobile:
1.  Register a custom URL scheme (e.g., `com.secretary.app`).
2.  Update your OAuth Redirect URIs in Google/Microsoft consoles to include `com.secretary.app://auth/callback`.

## 3. Ad Monetization Launch
Before submitting to stores:
1.  **AdMob Setup**: Sign up for Google AdMob.
2.  **App ID**: Add the AdMob App ID to your native projects (`AndroidManifest.xml` and `Info.plist`).
3.  **Production Keys**: Replace mock logic in `AdBanner.jsx` with real AdMob/AdSense IDs.

## 4. Admin Management
Deploy the `freemium_migration.sql` and `admin_advanced_migration.sql` to your **Supabase Production** database to ensure you can manage tiers and ads globally!

---
*Your Secretary ecosystem is ready for the world!*
