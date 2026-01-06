import React from 'react';
import { motion } from 'framer-motion';
import { X, Target, CheckCircle, Circle, BarChart3 } from 'lucide-react';
import useStore from '../../store/useStore';
import clsx from 'clsx';
import { format } from 'date-fns';

function GoalDetailModal({ goal, onClose }) {
    const tasks = useStore(state => state.tasks);
    const connectedTasks = tasks.filter(t => t.goalId === goal.id);
    const completedTasks = connectedTasks.filter(t => t.completed).length;
    const progress = connectedTasks.length > 0 ? Math.round((completedTasks / connectedTasks.length) * 100) : goal.progress;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className={clsx("p-8 text-white relative overflow-hidden", goal.color)}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                        }}
                        className="absolute top-6 right-6 p-2 bg-black/10 hover:bg-black/20 rounded-full backdrop-blur-md transition-colors z-50 cursor-pointer"
                    >
                        <X size={20} />
                    </button>

                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                            <Target size={14} />
                            {goal.type} Goal
                        </div>
                        <h2 className="text-3xl font-bold mb-2">{goal.title}</h2>
                        <div className="flex items-center gap-4 text-white/80 text-sm font-medium">
                            <span className="flex items-center gap-1">
                                <BarChart3 size={16} />
                                {progress}% Complete
                            </span>
                            <span>•</span>
                            <span>{connectedTasks.length} linked tasks</span>
                        </div>
                    </div>

                    {/* Background deco */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                </div>

                {/* Content */}
                <div className="p-8 max-h-[60vh] overflow-y-auto">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Action Plan</h3>

                    {connectedTasks.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl">
                            <p className="text-slate-400 mb-4">No tasks linked to this goal yet.</p>
                            <button
                                onClick={async () => {
                                    // LOCK: Premium Gating
                                    const user = useStore.getState().user;
                                    if (user.tier === 'free') {
                                        useStore.getState().updateProfile({ lastGatedAction: 'goal_gen' }); // Optional tracking
                                        const { useUIStore } = await import('../../store/useUIStore');
                                        useUIStore.getState().addNotification('Goal AI is a Premium feature.', 'info');
                                        // We need navigate, but this is a component. Let's use window.location or a prop.
                                        // Actually, I'll use a portal or just window.location.href for simplicity in this modal.
                                        window.location.href = '/pricing';
                                        return;
                                    }

                                    // Trigger auto-gen on existing goal!
                                    const generatedTasks = await import('../../services/GoalAgent').then(m => m.GoalAgent.generatePlan(goal.title, goal.type));
                                    generatedTasks.forEach(t => useStore.getState().addTask({ ...t, goalId: goal.id }));
                                }}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 font-medium text-sm rounded-lg hover:bg-indigo-100 transition-colors"
                            >
                                ✨ Auto-Generate Plan
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {connectedTasks.map(task => (
                                <div key={task.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl group hover:bg-indigo-50 transition-colors">
                                    <div className={clsx(
                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0",
                                        task.completed ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300 text-transparent"
                                    )}>
                                        <CheckCircle size={14} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className={clsx("font-medium", task.completed ? "text-slate-400 line-through" : "text-slate-800")}>
                                            {task.title}
                                        </h4>
                                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                                            <span>{format(new Date(task.date), 'MMM d')}</span>
                                            {task.duration && <span>• {task.duration}m</span>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

export default GoalDetailModal;
