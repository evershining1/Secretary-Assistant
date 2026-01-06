import useStore from '../store/useStore';
import { CalendarEvent } from '../models/CalendarEvent';

/**
 * Professional Sync Engine for Calendar Integrations
 */
export const CalendarSyncEngine = {
    /**
     * Sync a specific provider
     */
    async syncProvider(provider, fetchFn) {
        console.log(`[SyncEngine] Starting sync for ${provider}...`);

        try {
            // 1. Fetch external events
            const externalEventsRaw = await fetchFn();
            const externalEvents = externalEventsRaw.map(e =>
                provider === 'google' ? CalendarEvent.fromGoogle(e) : new CalendarEvent(e)
            );

            // 2. Get local state
            const { calendarEvents, updateCalendarEvents } = useStore.getState();

            // 3. Diffing Logic
            const { toCreate, toUpdate, toDelete } = this.detectChanges(
                calendarEvents.filter(e => e.provider === provider),
                externalEvents
            );

            console.log(`[SyncEngine] Detect changes:`, {
                created: toCreate.length,
                updated: toUpdate.length,
                deleted: toDelete.length
            });

            // 4. Resolve and Apply
            let nextEvents = [...calendarEvents];

            // Apply Deletions
            const deleteIds = new Set(toDelete.map(e => e.id));
            nextEvents = nextEvents.filter(e => !deleteIds.has(e.id));

            // Apply Updates
            toUpdate.forEach(updatedEvent => {
                const index = nextEvents.findIndex(e => e.provider_event_id === updatedEvent.provider_event_id);
                if (index !== -1) nextEvents[index] = updatedEvent;
            });

            // Apply New
            nextEvents = [...nextEvents, ...toCreate];

            // 5. Sync Linked Tasks
            // Map calendar events to tasks for the UI
            const { tasks } = useStore.getState();
            let nextTasks = [...tasks];

            // Remove old linked tasks for deleted events
            const deletedEventIds = new Set(toDelete.map(e => e.id));
            nextTasks = nextTasks.filter(t => !t.calendarEventId || !deletedEventIds.has(t.calendarEventId));

            // Update or Create tasks for new/updated events
            [...toCreate, ...toUpdate].forEach(event => {
                const taskIndex = nextTasks.findIndex(t => t.calendarEventId === event.id);
                const taskData = event.toTask();

                if (taskIndex !== -1) {
                    // Update existing
                    nextTasks[taskIndex] = { ...nextTasks[taskIndex], ...taskData };
                } else {
                    // Create new
                    nextTasks.push(taskData);
                }
            });

            // 6. Update Global Store
            useStore.setState({ tasks: nextTasks, calendarEvents: nextEvents });

            return { success: true, stats: { created: toCreate.length, updated: toUpdate.length, deleted: toDelete.length } };
        } catch (error) {
            console.error(`[SyncEngine] ${provider} sync failed:`, error);
            throw error;
        }
    },

    /**
     * Sync all enabled providers
     */
    async syncAll() {
        const { integrations } = useStore.getState().user;
        const providers = Object.keys(integrations).filter(k => integrations[k]);

        for (const provider of providers) {
            try {
                if (provider === 'google') {
                    const GoogleCalendarClient = (await import('./calendar/GoogleCalendarClient')).default;
                    await this.syncProvider('google', () => GoogleCalendarClient.listEvents());
                }
                // Add other providers here (Outlook, etc.)
            } catch (err) {
                console.error(`[SyncEngine] Auto-sync failed for ${provider}:`, err);
            }
        }
    },

    /**
     * Diffing algorithm to find changes since last sync
     */
    detectChanges(localEvents, externalEvents) {
        const toCreate = [];
        const toUpdate = [];
        const toDelete = [];

        const localMap = new Map(localEvents.map(e => [e.provider_event_id, e]));
        const externalMap = new Map(externalEvents.map(e => [e.provider_event_id, e]));

        // Find items to create or update
        externalEvents.forEach(extEvent => {
            const localEvent = localMap.get(extEvent.provider_event_id);
            if (!localEvent) {
                toCreate.push(extEvent);
            } else if (extEvent.last_modified !== localEvent.last_modified) {
                // Heuristic: Check if modified timestamp differs
                const updated = { ...localEvent, ...extEvent, id: localEvent.id };
                toUpdate.push(updated);
            }
        });

        // Find items to delete
        localEvents.forEach(locEvent => {
            if (!externalMap.has(locEvent.provider_event_id)) {
                toDelete.push(locEvent);
            }
        });

        return { toCreate, toUpdate, toDelete };
    }
};
