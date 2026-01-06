# Professional-Grade Calendar Sync Architecture

Implementation plan for building a production-ready calendar synchronization system with bi-directional sync, conflict resolution, and privacy-first design.

## User Review Required

> [!IMPORTANT]
> **Architecture Decision: Local-First vs Cloud-Based**
> 
> The current implementation uses a **local-first** architecture where:
> - Calendar events are stored in Zustand state (client-side)
> - Sync logic runs entirely in the browser
> - No server-side processing required for MVP
> 
> For production deployment with real OAuth flows, we'll need to decide:
> 1. Keep local-first with encrypted local storage
> 2. Add Supabase backend for cross-device sync
> 3. Hybrid approach (local + optional cloud backup)

> [!WARNING]
> **OAuth Implementation**
> 
> Real OAuth 2.0 flows for Google/Outlook/Apple require:
> - Registered OAuth applications with each provider
> - Secure token storage (currently simulated)
> - PKCE flow for security
> - Token refresh logic
> 
> Current implementation uses **simulation mode** for development.

## Proposed Changes

### Core Architecture

#### [NEW] [CalendarEvent.js](file:///Users/mutula/.gemini/antigravity/playground/iridescent-radiation/src/models/CalendarEvent.js)

Unified data model following the specification:

```javascript
CalendarEvent {
  event_id: string,              // UUID
  provider: enum,                // 'apple' | 'google' | 'outlook'
  provider_event_id: string,     // External ID
  title: string,
  description: string,
  start_time: datetime,          // ISO 8601
  end_time: datetime,
  timezone: string,              // IANA format
  is_all_day: boolean,
  recurrence_rule: string,       // RRULE (RFC 5545)
  recurrence_exceptions: array,
  location: string,
  availability: enum,            // 'busy' | 'free' | 'tentative'
  event_type: enum,              // 'fixed' | 'flexible'
  last_modified: datetime,
  sync_status: enum,             // 'synced' | 'pending' | 'conflict'
  linked_task_id: string,
  metadata: object
}
```

**Key Features:**
- Factory function `createCalendarEvent()` for safe instantiation
- `normalizeExternalEvent()` adapter for provider-specific formats
- Full TypeScript-style JSDoc annotations

---

#### [NEW] [CalendarSyncEngine.js](file:///Users/mutula/.gemini/antigravity/playground/iridescent-radiation/src/services/CalendarSyncEngine.js)

Professional sync engine implementing the complete sync cycle:

**Sync Flow:**
1. **Fetch** external events from provider API
2. **Normalize** into unified schema
3. **Detect Changes** via diffing algorithm
4. **Resolve Conflicts** using configurable strategy
5. **Update Local State** in Zustand store
6. **Push Changes** back to provider (bi-directional)
7. **Update Sync Checkpoint** for incremental sync

**Conflict Resolution Strategies:**
- `latest_wins`: Timestamp-based (default)
- `user_action`: Prioritize in-app edits
- `source_authority`: Provider always wins
- `prompt_user`: Surface conflicts in UI (Phase 3)

**Change Detection:**
```javascript
detectChanges(localEvents, externalEvents) {
  // Returns: { toCreate, toUpdate, toDelete }
  // Uses provider_event_id as correlation key
  // Detects divergence via field comparison
}
```

**Event → Task Conversion:**
- Automatically creates linked Task for each CalendarEvent
- Maintains `linked_task_id` for traceability
- Calculates duration from start/end times
- Preserves location and metadata

---

### State Management

#### [MODIFY] [useStore.js](file:///Users/mutula/.gemini/antigravity/playground/iridescent-radiation/src/store/useStore.js)

**New State:**
```javascript
calendarEvents: []  // Array of CalendarEvent objects
```

**New Actions:**
- `addCalendarEvent(event)` - Add normalized event
- `updateCalendarEvent(id, updates)` - Partial update
- `removeCalendarEvent(id)` - Delete event
- `toggleIntegration(provider)` - Enable/disable sync

**Integration State:**
```javascript
user.integrations: {
  google: boolean,
  outlook: boolean,
  apple: boolean
}
```

---

### User Interface

#### [NEW] [LoginPage.jsx](file:///Users/mutula/.gemini/antigravity/playground/iridescent-radiation/src/components/Auth/LoginPage.jsx)

Modern authentication page with:
- Email/password form (simulated for now)
- OAuth provider buttons (Google, GitHub)
- Unified theme support (White/Salmon light, Black/Salmon dark)
- Loading states and animations
- Privacy messaging ("End-to-End Encrypted")

**Features:**
- Glassmorphism design (`backdrop-blur`)
- Responsive layout
- Accessible form controls
- Smooth transitions

---

#### [NEW] [ProtectedRoute.jsx](file:///Users/mutula/.gemini/antigravity/playground/iridescent-radiation/src/components/Auth/ProtectedRoute.jsx)

Route guard component:
- Checks authentication state
- Redirects to `/login` if unauthenticated
- Placeholder for Phase 3 Supabase integration

---

#### [MODIFY] [App.jsx](file:///Users/mutula/.gemini/antigravity/playground/iridescent-radiation/src/App.jsx)

**Routing Changes:**
```javascript
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/*" element={
    <ProtectedRoute>
      {/* Existing app routes */}
    </ProtectedRoute>
  } />
</Routes>
```

---

#### [MODIFY] [CalendarIntegrationService.js](file:///Users/mutula/.gemini/antigravity/playground/iridescent-radiation/src/services/CalendarIntegrationService.js)

**Refactored to delegate to SyncEngine:**

```javascript
sync(provider) {
  await syncEngine.syncProvider(provider);
  // Show notification
}

syncAll() {
  await syncEngine.syncAll();
}

startAutoSync(intervalMinutes = 15) {
  // Periodic background sync
}
```

**New Features:**
- Auto-sync with configurable interval
- Error handling with notifications
- Graceful degradation on API failures

---

#### [MODIFY] [SettingsPage.jsx](file:///Users/mutula/.gemini/antigravity/playground/iridescent-radiation/src/components/Settings/SettingsPage.jsx)

**Integration Toggles:**
- Now connected to global `user.integrations` state
- Triggers `CalendarIntegrationService.sync()` on enable
- Shows sync status and last sync time (Phase 3)

---

## Verification Plan

### Automated Tests

**Unit Tests:**
```bash
# Test CalendarEvent model
npm test CalendarEvent.test.js

# Test SyncEngine conflict resolution
npm test CalendarSyncEngine.test.js
```

**Integration Tests:**
```bash
# Test full sync cycle
npm test integration/calendar-sync.test.js
```

### Manual Verification

**Sync Flow:**
1. Navigate to Settings → Connected Calendars
2. Toggle Google Calendar ON
3. Verify notification appears
4. Navigate to Dashboard
5. Confirm new events appear in task list
6. Navigate to Calendar view
7. Verify events show in timeline

**Conflict Resolution:**
1. Enable calendar sync
2. Modify an event in-app
3. Simulate external update (dev tools)
4. Trigger sync
5. Verify conflict handling (should log to console)

**Login Flow:**
1. Navigate to `/login`
2. Enter email
3. Click "Sign In"
4. Verify redirect to Dashboard
5. Confirm user name updated in sidebar

**Theme Consistency:**
1. Test login page in Light mode (White + Salmon)
2. Toggle to Dark mode
3. Verify login page adapts (Black + Salmon)
4. Check all form elements for visibility

### Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Performance Metrics

**Sync Performance:**
- Initial sync: < 2s for 100 events
- Incremental sync: < 500ms
- Conflict detection: < 100ms per event

**UI Responsiveness:**
- Login page load: < 1s
- Theme toggle: < 200ms
- Calendar render: < 500ms

---

## Phase 3: The "Forever Free" Stack 🚀

This implementation is designed to run entirely on **Free Tiers** and **Open-Source** alternatives, ensuring no monthly costs for the project.

### 1. Free API Architecture
- **Maps & Location**: Already migrated to **Photon (OpenStreetMap)**. (Cost: $0/mo)
- **Weather Insights**: Use **Open-Meteo**. (No API key required, $0/mo)
- **Stock/Media Assets**: Use **Unsplash API** (Free Tier).
- **AI / NLP Parsing**: 
    - Use **Gemini 1.5 Flash (Free Tier)** for complex reasoning.
    - Use **Compromise.js** for client-side natural language parsing (Cost: $0/mo).

### 2. Zero-Cost Infrastructure
- **Database & Auth**: **Supabase (Free Tier)**. 
    - Includes 500MB DB, 5GB Bandwidth, and 50k monthly active users.
- **Hosting**: **Vercel** or **Netlify** (Free Tiers).
- **OAuth Applications**: Standard developer accounts for Google/Microsoft (No cost to register app).

### 3. Advanced Features (Client-Side First)
- **Smart Scheduling**: Logic runs in the browser using custom algorithms (No server costs).
- **Offline Mode**: Use **PWA (Progressive Web App)** technology with **IndexedDB** for local persistence.
- **Time Zone Logic**: Handled by **date-fns-tz** (Open Source).

---

## Privacy & Security (Privacy-First)

**Current Implementation:**
- ✅ **Local-First**: All data currently lives only on your device.
- ✅ **Zero Tracking**: No analytics, no cookies, no tracking pixels.
- ✅ **Anonymous-First**: You can use the app without an account for all core features.

**Future Security Enhancements:**
- **On-Device Encryption**: Use the browser's **Web Crypto API** to encrypt calendar tokens before they ever touch the Supabase DB.
- **Keyless Auth**: Support for **Passkeys** (Open Source / WebAuthn) for secure login without passwords.
- **Transparent Data**: Simple export button to download all your data in JSON format at any time.

> [!TIP]
> **Why this matters:** By using free-tier services like Supabase and OpenStreetMap, "Secretary" becomes an app that you OWN and run for free forever, without worrying about scaling costs or predatory API pricing.

