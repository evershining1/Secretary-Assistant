import GoogleOAuth from '../auth/GoogleOAuth';
import { normalizeExternalEvent } from '../../models/CalendarEvent';

/**
 * Google Calendar API Client
 * Handles all interactions with Google Calendar API
 */
class GoogleCalendarClient {
    constructor() {
        this.baseUrl = 'https://www.googleapis.com/calendar/v3';
    }

    /**
     * Make authenticated API request
     */
    async request(endpoint, options = {}) {
        const accessToken = await GoogleOAuth.getAccessToken();

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Google Calendar API error');
        }

        return response.json();
    }

    /**
     * Fetch events from Google Calendar
     * @param {Date} timeMin - Start date
     * @param {Date} timeMax - End date
     * @returns {Array} Raw Google calendar events
     */
    async listEvents(timeMin = new Date(), timeMax = null) {
        if (!timeMax) {
            timeMax = new Date(timeMin);
            timeMax.setMonth(timeMax.getMonth() + 1);
        }

        const params = new URLSearchParams({
            timeMin: timeMin.toISOString(),
            timeMax: timeMax.toISOString(),
            singleEvents: 'true',
            orderBy: 'startTime',
            maxResults: '250'
        });

        const data = await this.request(`/calendars/primary/events?${params}`);
        return data.items || [];
    }

    /**
     * Create new event in Google Calendar
     * @param {Object} event - CalendarEvent object
     * @returns {Object} Created event
     */
    async createEvent(event) {
        const googleEvent = this.toGoogleFormat(event);

        const data = await this.request('/calendars/primary/events', {
            method: 'POST',
            body: JSON.stringify(googleEvent)
        });

        return normalizeExternalEvent(data, 'google');
    }

    /**
     * Update existing event
     * @param {string} eventId - Google event ID
     * @param {Object} updates - Fields to update
     * @returns {Object} Updated event
     */
    async updateEvent(eventId, updates) {
        const googleUpdates = this.toGoogleFormat(updates);

        const data = await this.request(`/calendars/primary/events/${eventId}`, {
            method: 'PATCH',
            body: JSON.stringify(googleUpdates)
        });

        return normalizeExternalEvent(data, 'google');
    }

    /**
     * Delete event from Google Calendar
     * @param {string} eventId - Google event ID
     */
    async deleteEvent(eventId) {
        await this.request(`/calendars/primary/events/${eventId}`, {
            method: 'DELETE'
        });
    }

    /**
     * Set up push notifications for calendar changes
     * @param {string} webhookUrl - URL to receive notifications
     * @returns {Object} Watch response
     */
    async watchCalendar(webhookUrl) {
        const watchRequest = {
            id: `watch-${Date.now()}`,
            type: 'web_hook',
            address: webhookUrl,
            expiration: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
        };

        return await this.request('/calendars/primary/events/watch', {
            method: 'POST',
            body: JSON.stringify(watchRequest)
        });
    }

    /**
     * Stop watching calendar changes
     * @param {string} channelId - Watch channel ID
     * @param {string} resourceId - Resource ID from watch response
     */
    async stopWatch(channelId, resourceId) {
        await this.request('/channels/stop', {
            method: 'POST',
            body: JSON.stringify({
                id: channelId,
                resourceId: resourceId
            })
        });
    }

    /**
     * Convert our CalendarEvent format to Google format
     */
    toGoogleFormat(event) {
        const googleEvent = {
            summary: event.title,
            description: event.description,
            location: event.location,
            start: {},
            end: {}
        };

        if (event.is_all_day) {
            googleEvent.start.date = event.start_time.split('T')[0];
            googleEvent.end.date = event.end_time.split('T')[0];
        } else {
            googleEvent.start.dateTime = event.start_time;
            googleEvent.start.timeZone = event.timezone;
            googleEvent.end.dateTime = event.end_time;
            googleEvent.end.timeZone = event.timezone;
        }

        if (event.recurrence_rule) {
            googleEvent.recurrence = [`RRULE:${event.recurrence_rule}`];
        }

        // Map availability
        if (event.availability === 'free') {
            googleEvent.transparency = 'transparent';
        } else {
            googleEvent.transparency = 'opaque';
        }

        return googleEvent;
    }
}

export default new GoogleCalendarClient();
