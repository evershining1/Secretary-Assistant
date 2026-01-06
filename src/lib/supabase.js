/**
 * Supabase Configuration
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a Supabase project at https://supabase.com
 * 2. Copy your project URL and anon key from Settings > API
 * 3. Create a .env file in the project root with:
 *    VITE_SUPABASE_URL=your_project_url
 *    VITE_SUPABASE_ANON_KEY=your_anon_key
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Create Supabase client with error handling
let supabase;
try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    });
} catch (error) {
    console.error('[Supabase] Failed to initialize client:', error);
    // Create a mock client that won't crash
    supabase = {
        auth: {
            getSession: async () => ({ data: { session: null }, error: null }),
            getUser: async () => ({ data: { user: null }, error: null }),
            signOut: async () => ({ error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } })
        },
        from: () => ({
            select: () => ({ eq: () => ({ single: async () => ({ data: null, error: new Error('Supabase not configured') }) }) }),
            insert: () => ({ select: () => ({ single: async () => ({ data: null, error: new Error('Supabase not configured') }) }) }),
            update: () => ({ eq: () => ({ select: () => ({ single: async () => ({ data: null, error: new Error('Supabase not configured') }) }) }) }),
            delete: () => ({ eq: async () => ({ error: new Error('Supabase not configured') }) })
        })
    };
}

export { supabase };

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => {
    return supabaseUrl !== 'https://placeholder.supabase.co' &&
        supabaseAnonKey !== 'placeholder-key';
};

// Database type definitions for TypeScript-style documentation
/**
 * @typedef {Object} UserProfile
 * @property {string} id - UUID from auth.users
 * @property {string} email
 * @property {string} name
 * @property {string} avatar_url
 * @property {number} xp
 * @property {number} level
 * @property {number} streak
 * @property {string} theme - 'light' | 'dark'
 * @property {Object} integrations - { google: boolean, outlook: boolean, apple: boolean }
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} Task
 * @property {string} id - UUID
 * @property {string} user_id - Foreign key to auth.users
 * @property {string} title
 * @property {boolean} completed
 * @property {string} date - ISO datetime
 * @property {string} priority - 'low' | 'medium' | 'high' | 'obj'
 * @property {string} type - 'task' | 'event'
 * @property {number} duration - Minutes
 * @property {string} location
 * @property {string} goal_id - Foreign key to goals
 * @property {string} provider_id - Link to calendar_events
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} Goal
 * @property {string} id - UUID
 * @property {string} user_id
 * @property {string} title
 * @property {string} type - 'daily' | 'monthly' | 'yearly'
 * @property {number} progress - 0-100
 * @property {string} color - Tailwind class
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} CalendarEvent
 * @property {string} event_id - UUID
 * @property {string} user_id
 * @property {string} provider - 'google' | 'outlook' | 'apple' | 'local'
 * @property {string} provider_event_id
 * @property {string} title
 * @property {string} description
 * @property {string} start_time - ISO datetime
 * @property {string} end_time
 * @property {string} timezone
 * @property {boolean} is_all_day
 * @property {string} recurrence_rule
 * @property {Array} recurrence_exceptions
 * @property {string} location
 * @property {string} availability - 'busy' | 'free' | 'tentative'
 * @property {string} event_type - 'fixed' | 'flexible'
 * @property {string} last_modified
 * @property {string} sync_status - 'synced' | 'pending' | 'conflict'
 * @property {string} linked_task_id
 * @property {Object} metadata
 * @property {string} created_at
 * @property {string} updated_at
 */
