import React, { useMemo } from 'react';
import useStore from '../../store/useStore';
import { ReflectionAgent } from '../../services/ReflectionAgent';

function DailyGreeting() {
    const user = useStore(state => state.user);
    const tasks = useStore(state => state.tasks);

    const todayTasks = useMemo(() => {
        const today = new Date();
        return tasks.filter(t => new Date(t.date).toDateString() === today.toDateString());
    }, [tasks]);

    const remainingTasks = todayTasks.filter(t => !t.completed).length;

    const insight = useMemo(() => ReflectionAgent.generateWeeklyInsights(tasks), [tasks]);

    return (
        <div className="mb-8">
            <h1 className="text-4xl font-bold text-skin-text tracking-tight">
                Good Morning, {user.name}
            </h1>
            <p className="text-skin-muted mt-2 text-lg">
                {remainingTasks > 0
                    ? `You have ${remainingTasks} tasks remaining for today.`
                    : "You're all clear for today!"}
            </p>
            <p className="text-sm text-skin-accent mt-3 font-medium bg-skin-accent/10 inline-block px-3 py-1.5 rounded-lg border border-skin-accent/20">
                💡 {insight.message}
            </p>
        </div>
    );
}

export default DailyGreeting;
