# Implementation Plan: Multi-Provider Calendar Support (Outlook & Apple)

Expand the `CalendarSyncEngine` to support Microsoft Outlook and Apple Calendar, completing the professional sync suite.

## User Review Required

> [!IMPORTANT]
> **Outlook (Microsoft Graph)**: Requires a [Microsoft Entra ID](https://entra.microsoft.com/) app registration (similar to Google Cloud Console).
> **Apple Calendar**: Since Apple lacks a standard OAuth API for web-based calendar access, we will implement support for **iCloud Calendar Subscription Links** (ICS/iCal public links). this is the only "Forever Free" way to sync iCloud data in a browser without proprietary server-side middleware.

## Proposed Changes

### [Service] Calendar Clients

#### [NEW] [OutlookCalendarClient.js](file:///Users/mutula/.gemini/antigravity/playground/iridescent-radiation/src/services/calendar/OutlookCalendarClient.js)
- Implement `listEvents()` using the Microsoft Graph API.
- Use the unified `CalendarEvent` model for mapping.

#### [NEW] [AppleCalendarClient.js](file:///Users/mutula/.gemini/antigravity/playground/iridescent-radiation/src/services/calendar/AppleCalendarClient.js)
- Implement `listEvents()` by fetching and parsing an ICS feed (via a CORS proxy if needed, or direct fetch if available).
- Map ICS data to the unified `CalendarEvent` model.

### [Service] Sync Engine 

#### [MODIFY] [CalendarSyncEngine.js](file:///Users/mutula/.gemini/antigravity/playground/iridescent-radiation/src/services/CalendarSyncEngine.js)
- Update `syncAll()` to include Outlook and Apple providers.
- Add specific mapping logic in `syncProvider` for different data shapes.

### [UI] Settings & Integration

#### [MODIFY] [SettingsPage.jsx](file:///Users/mutula/.gemini/antigravity/playground/iridescent-radiation/src/components/Settings/SettingsPage.jsx)
- Enable the toggles for Outlook and Apple.
- Add a field for "iCloud Feedback URL" for Apple integration.

## Verification Plan

### Automated Tests
- Mock fetch responses for MS Graph and ICS feeds.
- Verify `CalendarSyncEngine` correctly creates tasks from these new providers.

### Manual Verification
- Test connecting Outlook via OAuth (requires user keys).
- Test pasting an iCloud "Public Calendar" link and seeing events appear in the dashboard.
