import { addMinutes, differenceInMinutes, format, isBefore, isSameDay, startOfToday, setHours, setMinutes } from 'date-fns';

export class PlanningAgent {
    /**
     * Generates an optimized schedule for the day.
     * preserving fixed events and slotting tasks around them.
     */
    static generateDailyPlan(tasks, userPreferences = {}) {
        const today = startOfToday();

        // 1. Separate Fixed Events vs Flexible Tasks
        const fixedEvents = tasks.filter(t => t.type === 'event' && !t.completed).sort((a, b) => a.date - b.date);
        const flexibleTasks = tasks.filter(t => t.type === 'task' && !t.completed).sort((a, b) => {
            // Sort by priority (high > medium > low)
            const priorities = { high: 3, medium: 2, low: 1, obj: 0 };
            return priorities[b.priority] - priorities[a.priority];
        });

        // 2. Define Working Hours (e.g., 9am - 5pm)
        // In a real app, this comes from user preferences.
        const workdayStart = setHours(today, 9);
        const workdayEnd = setHours(today, 17);

        // 3. Slotting Algorithm
        const newSchedule = [...fixedEvents]; // Start with fixed events
        let currentTime = workdayStart;

        // Check if current time is already passed? For "re-plan", assuming we plan for "rest of day" or "whole day"?
        // Let's assume re-planning the whole day for simplicity, or starting from 'now' if later.
        const now = new Date();
        if (isBefore(workdayStart, now)) {
            currentTime = now; // Start planning from now
            // Round up to next 15 min?
            const minutes = currentTime.getMinutes();
            const remainder = 15 - (minutes % 15);
            currentTime = addMinutes(currentTime, remainder);
        }

        flexibleTasks.forEach(task => {
            // Find next available slot
            let slotFound = false;
            let attemptTime = currentTime;

            // Simple greedy search: Try to place task at 'attemptTime'
            // verification: does it overlap with any fixed event in 'newSchedule'?

            // Safety break
            let iterations = 0;
            while (!slotFound && isBefore(attemptTime, workdayEnd) && iterations < 50) {
                iterations++;
                const taskEnd = addMinutes(attemptTime, task.duration || 30);

                // Check collision
                const collision = newSchedule.find(event => {
                    const eventEnd = addMinutes(event.date, event.duration || 30);
                    // Overlap logic: (StartA < EndB) && (EndA > StartB)
                    return isBefore(attemptTime, eventEnd) && isBefore(event.date, taskEnd);
                });

                if (!collision) {
                    // Found a slot!
                    newSchedule.push({
                        ...task,
                        date: attemptTime,
                        isScheduled: true // Mark as auto-scheduled
                    });
                    slotFound = true;
                    attemptTime = taskEnd; // Move pointer
                    // Add buffer?
                    attemptTime = addMinutes(attemptTime, 15);
                } else {
                    // Move pointer after the collision event
                    const collisionEnd = addMinutes(collision.date, collision.duration || 30);
                    attemptTime = collisionEnd;
                    // Add buffer
                    attemptTime = addMinutes(attemptTime, 15);
                }
            }

            if (slotFound) {
                currentTime = attemptTime;
            } else {
                // Could not fit today
                // Maybe move to 'unscheduled' list or leave as is?
                // For now, we just don't add a time, or set it to end of day list.
            }
        });

        // Return all tasks, updated ones and original ones
        // We need to return the full list of tasks with updated dates
        const scheduledIds = new Set(newSchedule.map(t => t.id));
        const unscheduled = tasks.filter(t => !scheduledIds.has(t.id)); // Tasks that couldn't fit or were already completed/ignored?

        // Actually, 'newSchedule' contains the NEW versions of tasks.
        // 'unscheduled' contains tasks we didn't touch (e.g. completed ones).
        // wait, we filtered completions out.
        // Let's grab completed tasks and append them back.
        const completedTasks = tasks.filter(t => t.completed);

        const result = [...newSchedule, ...completedTasks, ...unscheduled];

        // Sort logic for display
        return result.sort((a, b) => a.date - b.date);
    }
}
