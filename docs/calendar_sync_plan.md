# Calendar Sync Implementation Plan

## Overview
Implement real calendar API integration for Google Calendar, Outlook Calendar, and Apple Calendar with OAuth 2.0 authentication and bi-directional sync.

## Current State
✅ **Already Built:**
- `CalendarSyncEngine` - Conflict resolution, diffing, normalization
- `CalendarEvent` model - Unified data schema
- `CalendarIntegrationService` - High-level sync API
- Supabase `calendar_events` table
- Settings page with integration toggles

⚠️ **Currently Simulated:**
- External calendar API calls
- OAuth flows
- Real-time event fetching

## Implementation Phases

### Phase 1: Google Calendar Integration

#### 1.1 OAuth Setup
**Files to Create:**
- `src/services/auth/GoogleOAuth.js` - Google OAuth flow

**Steps:**
1. Get Google Cloud credentials (Client ID, Client Secret)
2. Enable Google Calendar API
3. Configure OAuth consent screen
4. Add redirect URI: `http://localhost:5173/auth/google/callback`

**Environment Variables:**
```env
VITE_GOOGLE_CLIENT_ID=your_client_id
VITE_GOOGLE_CLIENT_SECRET=your_client_secret
```

#### 1.2 Google Calendar API Client
**File:** `src/services/calendar/GoogleCalendarClient.js`

**Methods:**
- `authenticate()` - OAuth flow
- `fetchEvents(timeMin, timeMax)` - Get events
- `createEvent(event)` - Create event
- `updateEvent(eventId, updates)` - Update event
- `deleteEvent(eventId)` - Delete event
- `watchCalendar()` - Set up push notifications

#### 1.3 Integration Points
**Update:** `src/services/CalendarSyncEngine.js`
- Replace mock `fetchFromProvider('google')` with real API calls
- Use `GoogleCalendarClient` for all Google operations

---

### Phase 2: Outlook Calendar Integration

#### 2.1 Microsoft OAuth
**Files to Create:**
- `src/services/auth/MicrosoftOAuth.js`

**Steps:**
1. Register app in Azure AD
2. Get Application (client) ID
3. Create client secret
4. Add redirect URI
5. Configure Microsoft Graph API permissions

**Environment Variables:**
```env
VITE_MICROSOFT_CLIENT_ID=your_client_id
VITE_MICROSOFT_CLIENT_SECRET=your_client_secret
VITE_MICROSOFT_TENANT_ID=common
```

#### 2.2 Outlook API Client
**File:** `src/services/calendar/OutlookCalendarClient.js`

**Uses:** Microsoft Graph API (`https://graph.microsoft.com/v1.0/me/events`)

**Methods:**
- `authenticate()`
- `fetchEvents(startDateTime, endDateTime)`
- `createEvent(event)`
- `updateEvent(eventId, updates)`
- `deleteEvent(eventId)`
- `subscribeToChanges()` - Webhooks

---

### Phase 3: Apple Calendar Integration

#### 3.1 iCloud Authentication
**File:** `src/services/auth/AppleOAuth.js`

**Challenge:** Apple Calendar uses CalDAV protocol, not REST API

**Options:**
1. **CalDAV Client** - Direct protocol implementation
2. **iCloud API** - Unofficial, may break
3. **Apple Sign In** + CalDAV - Most reliable

**Recommended:** Use CalDAV with Apple Sign In for auth

#### 3.2 CalDAV Client
**File:** `src/services/calendar/AppleCalendarClient.js`

**Library:** Consider using `tsdav` or `dav` npm package

**Methods:**
- `authenticate()`
- `fetchEvents()`
- `createEvent()`
- `updateEvent()`
- `deleteEvent()`

---

### Phase 4: Unified Sync Flow

#### 4.1 Update CalendarSyncEngine
**File:** `src/services/CalendarSyncEngine.js`

**Changes:**
```javascript
// Replace mock implementation
async fetchFromProvider(provider) {
    switch(provider) {
        case 'google':
            return await GoogleCalendarClient.fetchEvents();
        case 'outlook':
            return await OutlookCalendarClient.fetchEvents();
        case 'apple':
            return await AppleCalendarClient.fetchEvents();
    }
}
```

#### 4.2 Token Management
**File:** `src/services/auth/TokenManager.js`

**Features:**
- Store OAuth tokens securely (Supabase or localStorage)
- Auto-refresh expired tokens
- Handle token revocation

#### 4.3 Webhook/Push Notifications
**For Real-time Sync:**

**Google:** Push notifications via webhooks
**Outlook:** Microsoft Graph subscriptions
**Apple:** CalDAV sync-token for changes

---

## Database Updates

### Add OAuth Tokens Table
```sql
CREATE TABLE oauth_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL, -- 'google', 'outlook', 'apple'
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE oauth_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own tokens" ON oauth_tokens
    FOR ALL USING (auth.uid() = user_id);
```

---

## Security Considerations

1. **Never expose secrets in frontend**
   - Use backend proxy for OAuth flows
   - Store tokens server-side when possible

2. **Token encryption**
   - Encrypt tokens before storing in database
   - Use Supabase Vault or similar

3. **Scope minimization**
   - Request only calendar read/write permissions
   - No email or profile access unless needed

---

## Testing Strategy

### 1. OAuth Flows
- Test sign-in for each provider
- Verify token refresh works
- Test token revocation

### 2. CRUD Operations
- Create event → verify in external calendar
- Update event → check sync
- Delete event → confirm removal
- Bi-directional sync test

### 3. Conflict Resolution
- Create same event in two places
- Modify event in both systems
- Verify conflict detection and resolution

---

## Rollout Plan

### Week 1: Google Calendar
- Set up OAuth
- Implement API client
- Test basic sync

### Week 2: Outlook Calendar
- Azure AD setup
- Graph API integration
- Test sync

### Week 3: Apple Calendar
- CalDAV research
- Implementation
- Testing

### Week 4: Polish & Real-time
- Webhooks setup
- Conflict resolution UI
- Performance optimization

---

## Next Immediate Steps

1. **Get API Credentials**
   - Google Cloud Console
   - Azure AD Portal
   - Apple Developer Account

2. **Create OAuth Services**
   - Start with Google (easiest)
   - Build reusable OAuth pattern

3. **Test with Real Data**
   - Use your own calendars
   - Verify sync works correctly

Would you like me to start with Google Calendar integration?
