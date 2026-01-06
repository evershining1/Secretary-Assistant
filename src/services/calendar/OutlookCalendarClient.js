import { CalendarEvent } from '../models/CalendarEvent';

/**
 * Microsoft Outlook Calendar Client
 * Interfaces with Microsoft Graph API
 */
export class OutlookCalendarClient {
    /**
     * Fetch events from Microsoft Graph
     * Requires valid Microsoft OAuth token in oauth_tokens table
     */
    static async listEvents(accessToken) {
        if (!accessToken) throw new Error('No Microsoft access token provided');

        const response = await fetch('https://graph.microsoft.com/v1.0/me/events', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Prefer': 'outlook.body-content-type="text"'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Outlook API error: ${error.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return data.value.map(event => this.mapToCalendarEvent(event));
    }

    /**
     * Map Microsoft Graph event to unified CalendarEvent model
     */
    static mapToCalendarEvent(msEvent) {
        return new CalendarEvent({
            provider: 'outlook',
            provider_event_id: msEvent.id,
            title: msEvent.subject,
            description: msEvent.bodyPreview,
            start_time: msEvent.start.dateTime,
            end_time: msEvent.end.dateTime,
            timezone: msEvent.start.timeZone,
            is_all_day: msEvent.isAllDay,
            location: msEvent.location?.displayName || '',
            last_modified: msEvent.lastModifiedDateTime,
            metadata: {
                importance: msEvent.importance,
                is_cancelled: msEvent.isCancelled,
                web_link: msEvent.webLink
            }
        });
    }
}

export default OutlookCalendarClient;
