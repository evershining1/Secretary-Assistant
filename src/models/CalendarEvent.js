import { format, parseISO } from 'date-fns';

/**
 * Unified Calendar Event Model
 */
export class CalendarEvent {
    constructor(data = {}) {
        this.id = data.id || crypto.randomUUID();
        this.provider = data.provider; // 'google' | 'outlook' | 'apple'
        this.provider_event_id = data.provider_event_id;
        this.title = data.title || '';
        this.description = data.description || '';
        this.start_time = data.start_time; // ISO String
        this.end_time = data.end_time;     // ISO String
        this.timezone = data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
        this.is_all_day = !!data.is_all_day;
        this.location = data.location || '';
        this.last_modified = data.last_modified || new Date().toISOString();
        this.sync_status = data.sync_status || 'synced'; // 'synced' | 'pending' | 'conflict'
        this.linked_task_id = data.linked_task_id || null;
        this.metadata = data.metadata || {};
    }

    /**
     * Normalize Google Calendar Event
     */
    static fromGoogle(gEvent) {
        return new CalendarEvent({
            provider: 'google',
            provider_event_id: gEvent.id,
            title: gEvent.summary,
            description: gEvent.description,
            start_time: gEvent.start.dateTime || gEvent.start.date,
            end_time: gEvent.end.dateTime || gEvent.end.date,
            is_all_day: !!gEvent.start.date,
            location: gEvent.location,
            last_modified: gEvent.updated,
            metadata: {
                htmlLink: gEvent.htmlLink,
                hangoutLink: gEvent.hangoutLink
            }
        });
    }

    /**
     * Convert to internal Task format for the UI
     */
    toTask() {
        return {
            id: this.id,
            title: this.title,
            date: parseISO(this.start_time),
            type: 'event',
            priority: 'medium',
            location: this.location,
            completed: false,
            calendarEventId: this.id,
            provider: this.provider
        };
    }
}

export const createCalendarEvent = (data) => new CalendarEvent(data);
