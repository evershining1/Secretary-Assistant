import { CalendarEvent } from '../models/CalendarEvent';

/**
 * ICS/iCal Calendar Client
 * Supports syncing via Public iCal (.ics) subscription links (Apple, Outlook, etc.)
 */
export class ICSCalendarClient {
    /**
     * Fetch and parse events from an iCal URL
     */
    static async listEvents(icalUrl) {
        if (!icalUrl) throw new Error('No iCloud Calendar URL provided');

        // iCloud links often start with webcal://, switch to https://
        const fetchUrl = icalUrl.replace('webcal://', 'https://');

        try {
            const response = await fetch(fetchUrl);
            if (!response.ok) throw new Error(`Failed to fetch iCal feed: ${response.statusText}`);

            const icalData = await response.text();
            return this.parseICS(icalData);
        } catch (error) {
            console.error('[AppleCalendar] Fetch error:', error);
            // In a real browser environment, we might need a CORS proxy for some URLs
            throw new Error('Could not sync Apple Calendar. Please ensure the link is a "Public Calendar" link.');
        }
    }

    /**
     * Simple ICS Parser
     * Converts raw VEVENT data to CalendarEvent objects
     * Note: For production, using a library like ical.js is recommended.
     */
    static parseICS(data) {
        const events = [];
        const vevents = data.split('BEGIN:VEVENT');
        vevents.shift(); // Remove content before first VEVENT

        vevents.forEach(block => {
            const lines = block.split(/\r?\n/);
            const fields = {};

            lines.forEach(line => {
                const [key, ...parts] = line.split(':');
                if (!key || parts.length === 0) return;
                const value = parts.join(':').trim();

                // Extract basic fields
                if (key.startsWith('SUMMARY')) fields.summary = value;
                if (key.startsWith('DESCRIPTION')) fields.description = value;
                if (key.startsWith('DTSTART')) fields.start = value;
                if (key.startsWith('DTEND')) fields.end = value;
                if (key.startsWith('LOCATION')) fields.location = value;
                if (key.startsWith('UID')) fields.uid = value;
                if (key.startsWith('LAST-MODIFIED')) fields.lastModified = value;
            });

            if (fields.uid && fields.start) {
                events.push(new CalendarEvent({
                    provider: 'apple',
                    provider_event_id: fields.uid,
                    title: fields.summary || 'Untitled Event',
                    description: fields.description || '',
                    start_time: this.parseICSDate(fields.start),
                    end_time: fields.end ? this.parseICSDate(fields.end) : null,
                    location: fields.location || '',
                    last_modified: fields.lastModified ? this.parseICSDate(fields.lastModified) : new Date().toISOString()
                }));
            }
        });

        return events;
    }

    /**
     * Convert ICS date format (YYYYMMDDTHHMMSSZ) to ISO
     */
    static parseICSDate(icsDate) {
        // Handle formats like 20231027T100000Z
        const cleanDate = icsDate.split(';').pop().replace(/[:\-]/g, '');
        const match = cleanDate.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?$/);

        if (match) {
            const [, y, m, d, h, min, s] = match;
            return new Date(Date.UTC(y, m - 1, d, h, min, s)).toISOString();
        }

        // Fallback for simple date (YYYYMMDD)
        const dateMatch = cleanDate.match(/^(\d{4})(\d{2})(\d{2})$/);
        if (dateMatch) {
            const [, y, m, d] = dateMatch;
            return new Date(y, m - 1, d).toISOString();
        }

        return icsDate;
    }
}

export default AppleCalendarClient;
