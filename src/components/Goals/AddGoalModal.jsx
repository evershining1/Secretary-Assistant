import React, { useState } from 'react';
import useStore from '../../store/useStore';
import { X, Target, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoalAgent } from '../../services/GoalAgent';

function AddGoalModal({ onClose }) {
    const addGoal = useStore(state => state.addGoal);
    const addTask = useStore(state => state.addTask);
    const [title, setTitle] = useState('');
    const [type, setType] = useState('monthly');
    const [color, setColor] = useState('bg-indigo-500');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        addGoal({ title, type, color });
        onClose();
    };

    const handleGeneratePlan = async () => {
        setIsGenerating(true);
        // 1. Create the Goal
        // We need the ID to link tasks, but our store generates IDs internally.
        // For this demo, we'll manually create the ID here to link them.
        const goalId = Math.random().toString(36).substr(2, 9);

        // Add Goal directly to store with explicit ID
        useStore.getState().addGoal({
            id: goalId,
            title,
            type,
            color,
            progress: 0
        });

        // 2. Generate Tasks
        const tasks = await GoalAgent.generatePlan(title, type);

        // 3. Add tasks to store linked to this goal
        tasks.forEach(task => {
            addTask({ ...task, goalId });
        });

        setIsGenerating(false);
        onClose();
    };

    const colors = [
        'bg-indigo-500', 'bg-violet-500', 'bg-emerald-500',
        'bg-orange-400', 'bg-rose-500', 'bg-sky-500'
    ];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden"
                >
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <Target className="text-indigo-600" size={24} />
                                New Goal
                            </h2>
                            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X size={20} className="text-slate-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Goal Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g., Read 12 Books"
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-slate-900 placeholder:text-slate-400 font-medium"
                                    autoFocus
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Timeframe</label>
                                    <select
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-slate-900 font-medium appearance-none"
                                    >
                                        <option value="daily">Daily Habit</option>
                                        <option value="monthly">Monthly Goal</option>
                                        <option value="yearly">Yearly Ambition</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Color Tag</label>
                                    <div className="flex gap-2">
                                        {colors.map(c => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => setColor(c)}
                                                className={`w-8 h-8 rounded-full ${c} ${color === c ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button
                                    type="submit"
                                    disabled={!title.trim()}
                                    className="flex-1 py-3.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-slate-900/20"
                                >
                                    Create Goal
                                </button>
                                <button
                                    type="button"
                                    onClick={async () => {
                                        // LOCK: Premium Gating
                                        const user = useStore.getState().user;
                                        if (user.tier === 'free') {
                                            const { useUIStore } = await import('../../store/useUIStore');
                                            useUIStore.getState().addNotification('Auto-Plan is a Premium feature.', 'info');
                                            window.location.href = '/pricing';
                                            return;
                                        }
                                        handleGeneratePlan();
                                    }}
                                    disabled={!title.trim() || isGenerating}
                                    className="flex-1 py-3.5 bg-indigo-50 text-indigo-600 rounded-xl font-medium hover:bg-indigo-100 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden"
                                >
                                    {isGenerating ? (
                                        <>
                                            <span className="animate-spin">✨</span> Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles size={18} />
                                            {useStore.getState().user.tier === 'free' ? 'Auto-Plan (Premium)' : 'Auto-Plan'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

export default AddGoalModal;
