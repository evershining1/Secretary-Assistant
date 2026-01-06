# Implementation Plan: Multi-Platform, Freemium & Admin Suite

Transform Secretary from a web application into a complete cross-platform ecosystem with a sustainable business model and centralized management.

## User Review Required

> [!IMPORTANT]
> **Mobile (iOS/Android)**: We will use **Capacitor** to wrap the existing React app. This allows us to reuse 100% of the "Dual Sync" logic while accessing native features if needed.
> **Desktop (Mac/Windows)**: We will utilize **Tauri** or keep the web app as a high-performance **PWA** (Progressive Web App). Tauri is recommended for a truly premium, native feeling on desktop.
> **Freemium Logic**: We need to define which features are "Premium".
> *   *Free*: 1 Calendar, basic NLP, standard theme.
> *   *Premium*: Unlimited Calendars (Dual Sync), Goal Alignment AI, Glassmorphism Customization, priority support.

## Proposed Changes

### [Architecture] Multi-Platform Setup

#### [NEW] Capacitor Integration
- Initialize Capacitor in the root directory.
- Configure `capacitor.config.json` to handle the web assets.
- Add iOS and Android native projects.

#### [Service] Cross-Platform OAuth
- Update `GoogleOAuth.js` and `OutlookOAuth.js` to handle **Deep Linking**. On mobile, the redirect must return to the app (`secretary://auth/callback`) instead of a web URL.

### [Management] Admin Panel

#### [NEW] [AdminPage.jsx](file:///Users/mutula/.gemini/antigravity/playground/iridescent-radiation/src/components/Admin/AdminPage.jsx)
- A protected route accessible only to users with `is_admin: true` in `user_profiles`.
- Features: User list, subscription status toggle, global app stats, and sync health monitor.

#### [NEW] [AdminService.js](file:///Users/mutula/.gemini/antigravity/playground/iridescent-radiation/src/services/AdminService.js)
- Specialized service for administrative Supabase calls (requires Service Role key for bulk operations, handled via Supabase Edge Functions).

## Business Tier & Monetization Architecture

### Freemium Strategy
- **Free Tier**: 1 Calendar sync, basic NLP, standard themes. Includes **Ad Banners** in non-intrusive zones (Dashboard sidebar, footer).
- **Premium Tier**: Unlimited "Dual Sync" (Google, Outlook, Apple), Goal AI alignment, Ad-Free experience, custom glassmorphism themes.
- **Revenue Model**: Direct subscription (Stripe/Apple/Google) + Ad Network revenue (AdMob/AdSense).

### [Component] Ad Monetization Framework

#### [NEW] [AdBanner.jsx](file:///Users/mutula/.gemini/antigravity/playground/iridescent-radiation/src/components/UI/AdBanner.jsx)
- Handles conditional rendering: `if (user.tier !== 'free') return null;`.
- Responsive slots for web (banners) and mobile (native ad placements via Capacitor).

#### [DATABASE] [freemium_migration.sql](file:///Users/mutula/.gemini/antigravity/playground/iridescent-radiation/docs/freemium_migration.sql)
- Add `tier` and `is_admin` columns to `user_profiles`.
- Create a `system_stats` table for the admin panel.

## Verification Plan

### Automated Tests
- Verify that `ProtectedRoute` blocks non-admin users from `/admin`.
- Verify that "Duplicate Sync" restricts calendars correctly based on tier in the store.

### Manual Verification
- Build and run on an iOS/Android simulator.
- Toggle a user's status to "Premium" in the Admin Panel and verify features unlock instantly.
