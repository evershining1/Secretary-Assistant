import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Data Sync Service
 * Handles synchronization between Zustand store and Supabase database
 */
export class DataSyncService {
    /**
     * Sync tasks to/from Supabase
     */
    static async syncTasks(userId) {
        if (!isSupabaseConfigured()) {
            console.log('[DataSync] Supabase not configured, using local storage');
            return [];
        }

        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: true });

        if (error) {
            console.error('[DataSync] Failed to fetch tasks:', error);
            throw error;
        }

        return data || [];
    }

    /**
     * Create task in Supabase
     */
    static async createTask(userId, task) {
        if (!isSupabaseConfigured()) return task;

        const { data, error } = await supabase
            .from('tasks')
            .insert({
                user_id: userId,
                title: task.title,
                completed: task.completed || false,
                date: task.date,
                priority: task.priority || 'medium',
                type: task.type || 'task',
                duration: task.duration,
                location: task.location,
                goal_id: task.goalId,
                provider_id: task.provider_id
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Update task in Supabase
     */
    static async updateTask(taskId, updates) {
        if (!isSupabaseConfigured()) return updates;

        const { data, error } = await supabase
            .from('tasks')
            .update(updates)
            .eq('id', taskId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Delete task from Supabase
     */
    static async deleteTask(taskId) {
        if (!isSupabaseConfigured()) return;

        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', taskId);

        if (error) throw error;
    }

    /**
     * Sync goals to/from Supabase
     */
    static async syncGoals(userId) {
        if (!isSupabaseConfigured()) return [];

        const { data, error } = await supabase
            .from('goals')
            .select('*')
            .eq('user_id', userId);

        if (error) {
            console.error('[DataSync] Failed to fetch goals:', error);
            throw error;
        }

        return data || [];
    }

    /**
     * Create goal in Supabase
     */
    static async createGoal(userId, goal) {
        if (!isSupabaseConfigured()) return goal;

        const { data, error } = await supabase
            .from('goals')
            .insert({
                user_id: userId,
                title: goal.title,
                type: goal.type,
                progress: goal.progress || 0,
                color: goal.color || 'bg-indigo-500'
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Update goal in Supabase
     */
    static async updateGoal(goalId, updates) {
        if (!isSupabaseConfigured()) return updates;

        const { data, error } = await supabase
            .from('goals')
            .update(updates)
            .eq('id', goalId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Sync calendar events to/from Supabase
     */
    static async syncCalendarEvents(userId) {
        if (!isSupabaseConfigured()) return [];

        const { data, error } = await supabase
            .from('calendar_events')
            .select('*')
            .eq('user_id', userId)
            .order('start_time', { ascending: true });

        if (error) {
            console.error('[DataSync] Failed to fetch calendar events:', error);
            throw error;
        }

        return data || [];
    }

    /**
     * Create calendar event in Supabase
     */
    static async createCalendarEvent(userId, event) {
        if (!isSupabaseConfigured()) return event;

        const { data, error } = await supabase
            .from('calendar_events')
            .insert({
                user_id: userId,
                event_id: event.event_id,
                provider: event.provider,
                provider_event_id: event.provider_event_id,
                title: event.title,
                description: event.description,
                start_time: event.start_time,
                end_time: event.end_time,
                timezone: event.timezone,
                is_all_day: event.is_all_day,
                recurrence_rule: event.recurrence_rule,
                recurrence_exceptions: event.recurrence_exceptions,
                location: event.location,
                availability: event.availability,
                event_type: event.event_type,
                last_modified: event.last_modified,
                sync_status: event.sync_status,
                linked_task_id: event.linked_task_id,
                metadata: event.metadata
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Update calendar event in Supabase
     */
    static async updateCalendarEvent(eventId, updates) {
        if (!isSupabaseConfigured()) return updates;

        const { data, error } = await supabase
            .from('calendar_events')
            .update(updates)
            .eq('event_id', eventId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Subscribe to real-time changes
     */
    static subscribeToTasks(userId, callback) {
        if (!isSupabaseConfigured()) return { unsubscribe: () => { } };

        const subscription = supabase
            .channel('tasks_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'tasks',
                    filter: `user_id=eq.${userId}`
                },
                callback
            )
            .subscribe();

        return subscription;
    }

    static subscribeToGoals(userId, callback) {
        if (!isSupabaseConfigured()) return { unsubscribe: () => { } };

        const subscription = supabase
            .channel('goals_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'goals',
                    filter: `user_id=eq.${userId}`
                },
                callback
            )
            .subscribe();

        return subscription;
    }
}

export default DataSyncService;
