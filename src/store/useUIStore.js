import { create } from 'zustand';
// Removed uuid import to avoid dependency issues
// import { v4 as uuidv4 } from 'uuid';

// Extended Store for Notifications
// In a real app, this might be a separate slice or store, but for simplicity:

// Since we are adding to existing store, we will just add a notification component 
// that subscribes to a new slice if possible, OR we just add it to the main store.
// Let's create a separate store for UI-transient state like notifications to avoid cluttering domain store.

export const useUIStore = create((set) => ({
    notifications: [],
    addNotification: (message, type = 'info') => set((state) => ({
        notifications: [
            ...state.notifications,
            { id: Math.random().toString(), message, type }
        ]
    })),
    removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
    })),
}));
