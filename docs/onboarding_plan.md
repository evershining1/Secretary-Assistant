# Implementation Plan: First-Time Login Onboarding

Add a seamless onboarding experience for new users to set their display name, ensuring the "Secretary" feels personalized from the first interaction.

## Proposed Changes

### [Component] Onboarding Flow

#### [NEW] [OnboardingModal.jsx](file:///Users/mutula/.gemini/antigravity/playground/iridescent-radiation/src/components/Auth/OnboardingModal.jsx)
- A premium, themed modal that appears if the user's name is not set.
- Minimalist input field for the user's name.
- Direct integration with the Zustand store to update the profile.

#### [MODIFY] [Dashboard.jsx](file:///Users/mutula/.gemini/antigravity/playground/iridescent-radiation/src/components/Dashboard/Dashboard.jsx)
- Import and render `OnboardingModal` conditionally based on the user's name or a new `onboardingRequired` state.

### [Store & Services] Data Synchronization

#### [MODIFY] [useStore.js](file:///Users/mutula/.gemini/antigravity/playground/iridescent-radiation/src/store/useStore.js)
- Add `onboardingRequired` flag to the user state.
- Update `updateProfile` to synchronize the `name` field with the Supabase `user_profiles` table.

#### [MODIFY] [AuthService.js](file:///Users/mutula/.gemini/antigravity/playground/iridescent-radiation/src/services/AuthService.js)
- In `loadUserProfile`, detect if the name is the default ('User') and set `onboardingRequired: true` in the store if so.

## Verification Plan

### Manual Verification
- Sign in as a new user (or a user with the name 'User').
- Verify the onboarding modal appears.
- Enter a name and verify it updates the "Good Morning" greeting immediately.
- Refresh the page and verify the name is persisted (loaded from Supabase).
