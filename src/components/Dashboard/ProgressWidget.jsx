import React, { useMemo } from 'react';
import useStore from '../../store/useStore';

function ProgressWidget() {
    const allTasks = useStore(state => state.tasks);

    // Calculate locally to avoid subscribe loops
    const { total, completed, percentage } = useMemo(() => {
        const today = new Date();
        const todayTasks = allTasks.filter(t => new Date(t.date).toDateString() === today.toDateString());

        const total = todayTasks.length;
        const completed = todayTasks.filter(t => t.completed).length;
        const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

        return { total, completed, percentage };
    }, [allTasks]);

    return (
        <div className="bg-skin-secondary rounded-3xl p-8 shadow-sm border border-slate-200/50 dark:border-white/10 mb-10 overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-skin-accent/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-700"></div>

            <div className="relative z-10 flex items-end justify-between mb-4">
                <div>
                    <span className="text-sm uppercase tracking-wider text-skin-muted font-semibold">Daily Progress</span>
                    <h3 className="text-3xl font-bold text-skin-text mt-1">
                        {completed} of {total}
                    </h3>
                </div>
                <div className="bg-skin-accent/10 text-skin-accent px-4 py-2 rounded-full font-bold text-xl">
                    {percentage}%
                </div>
            </div>

            <div className="h-4 bg-skin-primary rounded-full overflow-hidden">
                <div
                    className="h-full bg-skin-accent transition-all duration-1000 ease-out rounded-full"
                    style={{ width: `${percentage}%` }}
                />
            </div>


        </div>
    );
}

export default ProgressWidget;
