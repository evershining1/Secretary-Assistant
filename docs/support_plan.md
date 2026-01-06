# Implementation Plan: Emily AI Support & Feedback System

Integrate a dedicated support personality ("Emily") and an engagement framework to drive improvements and app store reviews.

## User Review Required

> [!NOTE]
> **Emily's Personality**: Emily is helpful, efficient, and slightly witty, reflecting the "Secretary" brand. She can answer questions about calendar sync, goal setting, and technical issues.
> **Engagement Triggers**:
> *   *Feedback Prompt*: Triggered after 10 tasks completed.
> *   *Review Prompt*: Triggered after first successful multi-provider sync.

## Proposed Changes

### [Service] Support & AI

#### [NEW] [SupportAgent.js](file:///Users/mutula/.gemini/antigravity/playground/iridescent-radiation/src/services/SupportAgent.js)
- Specialized service using Gemini 1.5 Flash.
- Knowledge Base: Integrated instructions about the "Dual Sync" system, how to set up Outlook/Apple, and general app help.

### [UI] Chat & Feedback Components

#### [NEW] [EmilyChat.jsx](file:///Users/mutula/.gemini/antigravity/playground/iridescent-radiation/src/components/Support/EmilyChat.jsx)
- A floating chat widget with the Secretary brand palette.
- Accessible from Settings and optional sidebar shortcut.

#### [NEW] [FeedbackSystem.jsx](file:///Users/mutula/.gemini/antigravity/playground/iridescent-radiation/src/components/UI/FeedbackSystem.jsx)
- Contextual modal for star ratings and text feedback.
- Logic to direct 5-star users to "Review on App Store" (if on mobile).

#### [MODIFY] [SettingsPage.jsx](file:///Users/mutula/.gemini/antigravity/playground/iridescent-radiation/src/components/Settings/SettingsPage.jsx)
- Add "Support & Help" section with "Chat with Emily" button.

### [Management] Admin Integration

#### [NEW] [feedback_migration.sql](file:///Users/mutula/.gemini/antigravity/playground/iridescent-radiation/docs/feedback_migration.sql)
- Table for `user_feedback` (rating, comments, metadata).

#### [MODIFY] [AdminPage.jsx](file:///Users/mutula/.gemini/antigravity/playground/iridescent-radiation/src/components/Admin/AdminPage.jsx)
- Add "Feedback" tab to view user ratings and support queries.

## Verification Plan

### Automated Tests
- Verify `SupportAgent` handles sync-related questions correctly.
- Verify feedback modal triggers only when conditions (counts/events) are met.

### Manual Verification
- Chat with Emily and ask "How do I sync my Outlook calendar?".
- Trigger a mock "Sync Completed" event and verify the Review Prompt appears.
