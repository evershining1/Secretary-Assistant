import { create } from 'zustand';
import { addDays, format, startOfToday } from 'date-fns';
import { IngestionService } from '../services/IngestionService';
import { ReasoningEngine } from '../services/ReasoningEngine';
import { PlanningAgent } from '../services/PlanningAgent';

const useStore = create((set, get) => ({
    // Data - starts empty, loads from Supabase on login
    tasks: [],
    externalEvents: [],
    goals: [],
    user: {
        name: 'Alex',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        xp: 1250,
        level: 3,
        streak: 5,
        theme: 'light', // 'light' | 'dark'
        integrations: {
            google: false,
            outlook: false,
            apple: false
        }
    },

    calendarEvents: [], // Unified model storage

    updateProfile: async (updates) => {
        set((state) => ({ user: { ...state.user, ...updates } }));

        // Sync to Supabase if avatar or name changed
        if (updates.avatar || updates.name) {
            try {
                const { supabase } = await import('../lib/supabase');
                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user) {
                    const dbUpdates = {};
                    if (updates.avatar) dbUpdates.avatar_url = updates.avatar;
                    if (updates.name) dbUpdates.name = updates.name;

                    await supabase
                        .from('user_profiles')
                        .update(dbUpdates)
                        .eq('id', session.user.id);
                }
            } catch (error) {
                console.error('[Store] Failed to sync profile updates:', error);
            }
        }
    },

    toggleIntegration: (key) => set((state) => ({
        user: {
            ...state.user,
            integrations: {
                ...state.user.integrations,
                [key]: !state.user.integrations[key]
            }
        }
    })),

    setTheme: (theme) => set((state) => ({ user: { ...state.user, theme } })),

    addXP: (amount) => set((state) => {
        const newXP = state.user.xp + amount;
        const newLevel = Math.floor(newXP / 1000) + 1;
        return { user: { ...state.user, xp: newXP, level: newLevel } };
    }),

    // Calendar Event Actions
    addCalendarEvent: (event) => set((state) => ({
        calendarEvents: [...state.calendarEvents, event]
    })),

    updateCalendarEvents: (events) => set({
        calendarEvents: events
    }),

    updateCalendarEvent: (id, updates) => set((state) => ({
        calendarEvents: state.calendarEvents.map(e => e.id === id ? { ...e, ...updates } : e)
    })),

    removeCalendarEvent: (id) => set((state) => ({
        calendarEvents: state.calendarEvents.filter(e => e.id !== id)
    })),

    // Load user data from Supabase
    loadUserData: async (userId) => {
        if (!userId) return;

        try {
            const { supabase } = await import('../lib/supabase');

            // Load tasks
            const { data: tasks, error: tasksError } = await supabase
                .from('tasks')
                .select('*')
                .eq('user_id', userId)
                .order('date', { ascending: true });

            if (!tasksError && tasks) {
                set({
                    tasks: tasks.map(t => ({
                        ...t,
                        date: new Date(t.date),
                        goalId: t.goal_id
                    }))
                });
                console.log(`[Store] Loaded ${tasks.length} tasks from Supabase`);
            }

            // Load goals
            const { data: goals, error: goalsError } = await supabase
                .from('goals')
                .select('*')
                .eq('user_id', userId);

            if (!goalsError && goals) {
                set({ goals });
                console.log(`[Store] Loaded ${goals.length} goals from Supabase`);
            }
        } catch (error) {
            console.error('[Store] Failed to load user data:', error);
        }
    },

    // Initialize store with Supabase data
    initializeStore: async (userId) => {
        if (!userId) return;

        try {
            const DataSyncService = (await import('../services/DataSyncService')).default || (await import('../services/DataSyncService')).DataSyncService;

            // Load tasks
            const tasks = await DataSyncService.syncTasks(userId);
            set({ tasks: tasks.map(t => ({ ...t, id: t.id, date: new Date(t.date) })) });

            // Load goals
            const goals = await DataSyncService.syncGoals(userId);
            set({ goals });

            // Load calendar events
            const events = await DataSyncService.syncCalendarEvents(userId);
            set({ calendarEvents: events });

            console.log('[Store] Initialized with Supabase data');
        } catch (error) {
            console.error('[Store] Failed to initialize:', error);
            // Don't crash - just use default data
        }
    },

    // Actions
    toggleTask: async (id) => {
        const task = get().tasks.find(t => t.id === id);
        if (!task) return;

        const newCompleted = !task.completed;

        // Update locally first (optimistic)
        set((state) => ({
            tasks: state.tasks.map((t) =>
                t.id === id ? { ...t, completed: newCompleted } : t
            ),
        }));

        // Sync to Supabase
        try {
            const { supabase } = await import('../lib/supabase');
            const { error } = await supabase
                .from('tasks')
                .update({ completed: newCompleted })
                .eq('id', id);

            if (error) {
                console.error('[Store] Failed to update task:', error);
                // Revert on error
                set((state) => ({
                    tasks: state.tasks.map((t) =>
                        t.id === id ? { ...t, completed: !newCompleted } : t
                    ),
                }));
            }
        } catch (error) {
            console.error('[Store] Task toggle error:', error);
        }
    },

    addTask: async (task) => {
        const goalId = ReasoningEngine.alignTaskToGoal(task, get().goals);
        const newTask = {
            ...task,
            id: Math.random().toString(36).substr(2, 9) + Date.now(),
            completed: false,
            goalId: goalId
        };

        // Add to local state immediately
        set((state) => ({ tasks: [...state.tasks, newTask] }));

        // Sync to Supabase
        try {
            const { supabase } = await import('../lib/supabase');
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user) {
                const { error } = await supabase
                    .from('tasks')
                    .insert({
                        id: newTask.id,
                        user_id: session.user.id,
                        title: newTask.title,
                        completed: newTask.completed,
                        date: newTask.date.toISOString(),
                        priority: newTask.priority || 'medium',
                        type: newTask.type || 'task',
                        duration: newTask.duration,
                        location: newTask.location,
                        goal_id: newTask.goalId
                    });

                if (error) {
                    console.error('[Store] Failed to save task:', error);
                }
            }
        } catch (error) {
            console.error('[Store] Task sync error:', error);
        }
    },

    updateTask: async (id, updates) => {
        // Update locally first
        set((state) => ({
            tasks: state.tasks.map((task) =>
                task.id === id ? { ...task, ...updates } : task
            ),
        }));

        // Sync to Supabase
        try {
            const { supabase } = await import('../lib/supabase');
            const { error } = await supabase
                .from('tasks')
                .update(updates)
                .eq('id', id);

            if (error) {
                console.error('[Store] Failed to update task:', error);
            }
        } catch (error) {
            console.error('[Store] Task update error:', error);
        }
    },

    deleteTask: async (id) => {
        // Remove from local state
        set((state) => ({
            tasks: state.tasks.filter(t => t.id !== id)
        }));

        // Delete from Supabase
        try {
            const { supabase } = await import('../lib/supabase');
            const { error } = await supabase
                .from('tasks')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('[Store] Failed to delete task:', error);
            }
        } catch (error) {
            console.error('[Store] Task delete error:', error);
        }
    },

    addGoal: async (goal) => {
        const newGoal = {
            ...goal,
            id: Math.random().toString(36).substr(2, 9) + Date.now(),
            progress: 0
        };

        // Add locally
        set((state) => ({ goals: [...state.goals, newGoal] }));

        // Sync to Supabase
        try {
            const { supabase } = await import('../lib/supabase');
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user) {
                const { error } = await supabase
                    .from('goals')
                    .insert({
                        id: newGoal.id,
                        user_id: session.user.id,
                        title: newGoal.title,
                        type: newGoal.type,
                        progress: newGoal.progress,
                        color: newGoal.color
                    });

                if (error) {
                    console.error('[Store] Failed to save goal:', error);
                }
            }
        } catch (error) {
            console.error('[Store] Goal sync error:', error);
        }
    },

    updateGoal: async (id, updates) => {
        set((state) => ({
            goals: state.goals.map((goal) =>
                goal.id === id ? { ...goal, ...updates } : goal
            ),
        }));

        // Sync to Supabase
        try {
            const { supabase } = await import('../lib/supabase');
            const { error } = await supabase
                .from('goals')
                .update(updates)
                .eq('id', id);

            if (error) {
                console.error('[Store] Failed to update goal:', error);
            }
        } catch (error) {
            console.error('[Store] Goal update error:', error);
        }
    },

    deleteGoal: async (id) => {
        set((state) => ({
            goals: state.goals.filter(g => g.id !== id)
        }));

        // Delete from Supabase
        try {
            const { supabase } = await import('../lib/supabase');
            const { error } = await supabase
                .from('goals')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('[Store] Failed to delete goal:', error);
            }
        } catch (error) {
            console.error('[Store] Goal delete error:', error);
        }
    },

    syncExternalEvents: async () => {
        const events = await IngestionService.fetchExternalEvents();
        set((state) => {
            const existingIds = new Set(state.tasks.map(t => t.id));
            const newEvents = events.filter(e => !existingIds.has(e.id)).map(e => ({
                ...e,
                id: e.id || Math.random().toString(36).substr(2, 9),
                type: 'event',
                isExternal: true
            }));
            return {
                externalEvents: events,
                tasks: [...state.tasks, ...newEvents]
            };
        });
    },

    designMyDay: () => set((state) => ({
        tasks: PlanningAgent.generateDailyPlan(state.tasks)
    })),

    // Selectors (derived state can be computed in components or via getters if needed, 
    // but Zustand encourages simple state. We can add computed props here if strict selectors are needed.)
    getTodayTasks: () => {
        const today = startOfToday();
        // Simple filter for demo purposes. In real app, check date equality more robustly.
        return get().tasks.filter(t => format(t.date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd'));
    },

    getCompletionPercentage: () => {
        const todayTasks = get().getTodayTasks();
        if (todayTasks.length === 0) return 0;
        const completed = todayTasks.filter(t => t.completed).length;
        return Math.round((completed / todayTasks.length) * 100);
    }
}));

export default useStore;
