import { addDays, addHours, startOfToday, setHours, setMinutes, format } from 'date-fns';

/**
 * Parses natural language text to extract date, time, title, and location.
 */
export class NLPParser {
    static parse(text) {
        const result = {
            title: text,
            date: null, // Return null if not explicitly found for dynamic updates
            time: null,
            location: null,
            hasTime: false,
            duration: 30
        };

        if (!text) return result;

        const lowerText = text.toLowerCase();
        let dateModifier = 0;
        let foundDate = false;

        // 1. Detect Date Keywords
        if (/\btomorrow\b/i.test(text)) {
            dateModifier = 1;
            foundDate = true;
            result.title = result.title.replace(/\btomorrow\b/i, '').trim();
        } else if (/\btoday\b/i.test(text)) {
            dateModifier = 0;
            foundDate = true;
            result.title = result.title.replace(/\btoday\b/i, '').trim();
        }

        if (foundDate) {
            result.date = format(addDays(startOfToday(), dateModifier), 'yyyy-MM-dd');
        }

        // 2. Detect Time (e.g., "at 5pm", "at 9:30am", "5pm")
        const timeRegex = /\b(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i;
        const timeMatch = text.match(timeRegex);

        if (timeMatch) {
            result.hasTime = true;
            let hours = parseInt(timeMatch[1], 10);
            const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
            const meridiem = timeMatch[3].toLowerCase();

            if (meridiem === 'pm' && hours < 12) hours += 12;
            if (meridiem === 'am' && hours === 12) hours = 0;

            result.time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            result.title = result.title.replace(timeMatch[0], '').trim();
        }

        // 3. Detect Location (e.g., "at Starbucks", "in London")
        // Basic heuristic: look for "at " or "in " at the end of the string or followed by capitalized word
        const locRegex = /\b(?:at|in)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/;
        const locMatch = text.match(locRegex);

        if (locMatch) {
            result.location = locMatch[1];
            result.title = result.title.replace(locMatch[0], '').trim();
        } else {
            // Check for simple "at [word]" at the end if not capitalized
            const locEndRegex = /\s+(?:at|in)\s+([a-z]+)$/i;
            const locEndMatch = text.match(locEndRegex);
            if (locEndMatch) {
                result.location = locEndMatch[1];
                result.title = result.title.replace(locEndMatch[0], '').trim();
            }
        }

        // Clean up extra spaces
        result.title = result.title.replace(/\s+/g, ' ').trim();

        return result;
    }
}
