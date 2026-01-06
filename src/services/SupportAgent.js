/**
 * SupportAgent Service (Emily AI)
 * Uses Gemini Pro to provide 24/7 intelligent customer support.
 */
import { isSupabaseConfigured } from '../lib/supabase';

const EMILY_SYSTEM_PROMPT = `
You are Emily, the dedicated Customer Support Agent for the "Secretary" app.
Your tone is professional, efficient, helpful, and slightly witty. 

APP CONTEXT:
- Secretary is a "Personal Life OS" focusing on Goal Alignment and Calendar Sync.
- Key Feature: "Dual Sync" supports Google, Outlook, and Apple calendars.
- Outlook Support: Users can use OAuth (Microsoft App) or a simpler "Subscription Link".
- Apple Support: Uses public iCloud .ics links.
- Goals: The app uses AI to align daily tasks with long-term goals.
- Privacy: The app is privacy-first and uses a "Forever Free" tech stack.

INSTRUCTIONS:
- If a user asks technical questions about sync, explain the "Easy Link" options.
- If they ask about Premium, mention unlimited calendars and Goal AI.
- Keep responses concise (under 3 sentences unless asked for more details).
- If you can't solve a problem, tell them "I'll flag this for our human admins to review!".
`;

export class SupportAgent {
    static async chat(userMessage, chatHistory = []) {
        try {
            // Check for API key (Placeholder for Gemini integration)
            // In a real app, this would call a Supabase Edge Function to protect the key
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

            if (!apiKey) {
                return "Hi! I'm Emily. Our AI brain is currently resting, but you can still reach out to our human support team at hello@secretary.app!";
            }

            // Simulate AI response for now if key is missing/invalid
            // We'll use a fetch to Gemini in the real implementation
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [
                        { role: 'user', parts: [{ text: EMILY_SYSTEM_PROMPT }] },
                        ...chatHistory,
                        { role: 'user', parts: [{ text: userMessage }] }
                    ]
                })
            });

            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error('[Emily] Chat failed:', error);
            return "I apologize, I'm having a bit of a brain freeze. Could you try again in a moment?";
        }
    }
}

export default SupportAgent;
