import React, { useState } from 'react';
import { format } from 'date-fns';
import { Check, Clock, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import useStore from '../../store/useStore';
import ConfirmModal from '../UI/ConfirmModal';

const priorityColors = {
    high: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    medium: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    low: 'bg-slate-50 text-slate-600 border-slate-100',
    obj: 'bg-amber-50 text-amber-700 border-amber-100'
};

function TaskItem({ task, onEdit }) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const toggleTask = useStore(state => state.toggleTask);
    const deleteTask = useStore(state => state.deleteTask);
    const goals = useStore(state => state.goals);
    const alignedGoal = task.goalId ? goals.find(g => g.id === task.goalId) : null;

    return (
        <div
            onClick={onEdit}
            className={clsx(
                "group flex items-center justify-between p-5 mb-4 bg-skin-secondary/80 backdrop-blur-sm rounded-2xl border transition-all duration-300 cursor-pointer",
                task.completed
                    ? "border-skin-primary opacity-60 hover:opacity-100"
                    : "border-slate-200/60 dark:border-white/5 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-skin-accent/30"
            )}
        >
            <div className="flex items-center gap-4">
                <button
                    onClick={(e) => { e.stopPropagation(); toggleTask(task.id); }}
                    className={clsx(
                        "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                        task.completed
                            ? "bg-skin-accent border-skin-accent text-white"
                            : "border-skin-muted/40 text-transparent hover:border-skin-accent"
                    )}
                >
                    <Check size={16} strokeWidth={3} />
                </button>

                <div className="flex flex-col">
                    <span className={clsx(
                        "text-lg font-medium transition-all duration-300",
                        task.completed ? "text-skin-muted line-through" : "text-skin-text"
                    )}>
                        {task.title}
                    </span>
                    <div className="flex items-center gap-3 mt-1 text-sm text-skin-muted">
                        <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>{format(task.date, 'h:mm a')}</span>
                        </div>
                        {task.duration && (
                            <span>• {task.duration} min</span>
                        )}
                        <span className={clsx(
                            "px-2 py-0.5 rounded-md text-xs font-medium border uppercase tracking-wider",
                            task.type === 'event'
                                ? "bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-100 dark:border-violet-500/20"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                        )}>
                            {task.type}
                        </span>
                        {alignedGoal && (
                            <span className={clsx("ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700 flex items-center gap-1")}>
                                <span className={clsx("w-2 h-2 rounded-full", alignedGoal.color)}></span>
                                {alignedGoal.title}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className={clsx(
                    "px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider border",
                    priorityColors[task.priority] || priorityColors.low
                )}>
                    {task.priority || 'normal'}
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteConfirm(true);
                    }}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                    title="Delete task"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            <ConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={() => deleteTask(task.id)}
                title="Delete Task?"
                message={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
                confirmText="Delete"
                type="danger"
            />
        </div>
    );
}

export default TaskItem;
