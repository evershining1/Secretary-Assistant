import React from 'react';
import clsx from 'clsx';
import { Target, TrendingUp, Calendar, CheckCircle2 } from 'lucide-react';
import useStore from '../../store/useStore';

const typeIcons = {
    yearly: Calendar,
    monthly: Target,
    daily: TrendingUp
};

function GoalCard({ goal }) {
    const tasks = useStore(state => state.tasks);
    const linkedTasks = tasks.filter(t => t.goalId === goal.id);
    const completedLinked = linkedTasks.filter(t => t.completed).length;

    const Icon = typeIcons[goal.type] || Target;

    return (
        <div className="bg-skin-secondary/80 backdrop-blur-sm p-6 rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-sm hover:shadow-md hover:border-skin-accent/30 transition-all duration-300 group cursor-pointer">
            <div className="flex items-start justify-between mb-4">
                <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md shadow-black/10", goal.color)}>
                    <Icon size={24} />
                </div>
                <span className="text-xs uppercase font-bold tracking-wider text-skin-muted bg-skin-primary px-2 py-1 rounded-lg border border-skin-muted/10">
                    {goal.type}
                </span>
            </div>

            <h3 className="text-xl font-bold text-skin-text mb-2 group-hover:text-skin-accent transition-colors">
                {goal.title}
            </h3>

            <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                    <span className="text-skin-muted">Progress</span>
                    <span className="text-skin-text">{goal.progress}%</span>
                </div>
                <div className="h-2 bg-skin-primary rounded-full overflow-hidden">
                    <div
                        className={clsx("h-full rounded-full transition-all duration-1000", goal.color)}
                        style={{ width: `${goal.progress}%` }}
                    />
                </div>

                {linkedTasks.length > 0 && (
                    <div className="pt-3 mt-3 border-t border-skin-muted/10 flex items-center justify-between text-xs text-skin-muted">
                        <span className="flex items-center gap-1">
                            <CheckCircle2 size={12} />
                            {completedLinked}/{linkedTasks.length} connected items
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default GoalCard;
