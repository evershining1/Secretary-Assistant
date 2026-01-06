import { startOfToday, addHours, subHours } from 'date-fns';
import { NLPParser } from './NLPParser';

export class IngestionService {
    /**
     * Mock fetching events from external calendars (Apple, Google)
     */
    static async fetchExternalEvents() {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const today = startOfToday();

        return [
            {
                id: 'ext-1',
                title: 'Team Sync (Google Calendar)',
                date: addHours(today, 10), // 10:00 AM
                duration: 60,
                type: 'event',
                source: 'google',
                priority: 'medium',
                completed: false
            },
            {
                id: 'ext-2',
                title: 'Lunch with Sarah (Apple Calendar)',
                date: addHours(today, 12), // 12:00 PM
                duration: 60,
                type: 'event',
                source: 'apple',
                priority: 'medium',
                completed: false
            }
        ];
    }

    /**
     * Parse user input into a standardized Task/Event object
     */
    static parseNaturalLanguage(text) {
        return NLPParser.parse(text);
    }
}
