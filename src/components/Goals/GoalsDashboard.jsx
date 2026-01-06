import React, { useState } from 'react';
import useStore from '../../store/useStore';
import GoalCard from './GoalCard';
import AddGoalModal from './AddGoalModal';
import { Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GoalDetailModal from './GoalDetailModal';

function GoalsDashboard() {
    const goals = useStore(state => state.goals);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState(null);

    const yearlyGoals = goals.filter(g => g.type === 'yearly');
    const monthlyGoals = goals.filter(g => g.type === 'monthly');
    const dailyGoals = goals.filter(g => g.type === 'daily');

    return (
        <div className="py-8 space-y-12">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-skin-text">Goals Hub</h1>
                    <p className="text-skin-muted mt-2 text-lg">Align your daily actions with your life's ambitions.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 py-2.5 px-5 bg-skin-accent text-white rounded-xl hover:opacity-90 transition-all font-medium shadow-lg shadow-skin-accent/20"
                >
                    <Plus size={18} />
                    <span>New Goal</span>
                </button>
            </div>

            <section>
                <h2 className="text-sm font-bold text-skin-muted uppercase tracking-widest mb-6 border-b border-skin-muted/20 pb-2">
                    This Year
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {yearlyGoals.map((goal, idx) => (
                        <motion.div
                            key={goal.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            onClick={() => setSelectedGoal(goal)}
                            className="cursor-pointer"
                        >
                            <GoalCard goal={goal} />
                        </motion.div>
                    ))}
                    {yearlyGoals.length === 0 && <p className="text-skin-muted italic">No yearly goals set.</p>}
                </div>
            </section>

            <section>
                <h2 className="text-sm font-bold text-skin-muted uppercase tracking-widest mb-6 border-b border-skin-muted/20 pb-2">
                    This Month
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {monthlyGoals.map(goal => (
                        <div key={goal.id} onClick={() => setSelectedGoal(goal)} className="cursor-pointer">
                            <GoalCard goal={goal} />
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <h2 className="text-sm font-bold text-skin-muted uppercase tracking-widest mb-6 border-b border-skin-muted/20 pb-2">
                    Daily Intentions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dailyGoals.map(goal => (
                        <div key={goal.id} onClick={() => setSelectedGoal(goal)} className="cursor-pointer">
                            <GoalCard goal={goal} />
                        </div>
                    ))}
                </div>
            </section>

            {/* Modals */}
            <AnimatePresence>
                {isModalOpen && <AddGoalModal onClose={() => setIsModalOpen(false)} />}
                {selectedGoal && <GoalDetailModal goal={selectedGoal} onClose={() => setSelectedGoal(null)} />}
            </AnimatePresence>
        </div>
    );
}

export default GoalsDashboard;
