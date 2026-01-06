import { startOfToday, addDays, format } from 'date-fns';

export const GoalAgent = {
    /**
     * Generates a structural breakdown of tasks for a given goal.
     * In a real app, this would call an LLM.
     */
    generatePlan: async (goalTitle, goalType) => {
        // Mock delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        const today = startOfToday();
        const plan = [];

        // Logic based on keywords to simulate "intelligence"
        const lowerTitle = goalTitle.toLowerCase();

        if (lowerTitle.includes('book') || lowerTitle.includes('read')) {
            // Reading plan
            plan.push({ title: 'Select book for the month', type: 'task', duration: 15, priority: 'high', dayOffset: 0 });
            plan.push({ title: 'Read 20 pages', type: 'task', duration: 30, priority: 'medium', dayOffset: 0, recurring: true });
            plan.push({ title: 'Weekly reading reflection', type: 'task', duration: 15, priority: 'low', dayOffset: 6, recurring: true });
        } else if (lowerTitle.includes('run') || lowerTitle.includes('fitness') || lowerTitle.includes('walk')) {
            // Fitness plan
            plan.push({ title: 'Buy running shoes', type: 'task', duration: 60, priority: 'medium', dayOffset: 0 });
            plan.push({ title: 'Morning Jog', type: 'event', duration: 30, priority: 'high', dayOffset: 1, recurring: true });
            plan.push({ title: 'Stretching routine', type: 'event', duration: 15, priority: 'low', dayOffset: 1, recurring: true });
        } else if (lowerTitle.includes('launch') || lowerTitle.includes('code') || lowerTitle.includes('app')) {
            // Coding plan
            plan.push({ title: 'Define MVP Requirements', type: 'task', duration: 60, priority: 'high', dayOffset: 0 });
            plan.push({ title: 'Setup Development Environment', type: 'task', duration: 45, priority: 'high', dayOffset: 0 });
            plan.push({ title: 'Design Database Schema', type: 'task', duration: 60, priority: 'high', dayOffset: 1 });
            plan.push({ title: 'Daily Coding Session', type: 'event', duration: 120, priority: 'high', dayOffset: 1, recurring: true });
        } else {
            // Generic plan
            plan.push({ title: `Research: ${goalTitle}`, type: 'task', duration: 30, priority: 'medium', dayOffset: 0 });
            plan.push({ title: `Draft outline for ${goalTitle}`, type: 'task', duration: 45, priority: 'medium', dayOffset: 1 });
            plan.push({ title: 'Execute Step 1', type: 'task', duration: 60, priority: 'high', dayOffset: 2 });
        }

        // Hydrate dates
        return plan.map(item => ({
            ...item,
            date: addDays(today, item.dayOffset),
            isGenerated: true
        }));
    }
};
