import React from 'react';
import useStore from '../../store/useStore';
import TaskItem from './TaskItem';
import { Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useMemo } from 'react';

import TaskModal from './TaskModal';

function TaskList() {
    const allTasks = useStore(state => state.tasks);
    const [editingTask, setEditingTask] = React.useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

    const tasks = useMemo(() => {
        const today = new Date();
        return allTasks.filter(t => new Date(t.date).toDateString() === today.toDateString());
    }, [allTasks]);

    if (tasks.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 border-dashed">
                <h3 className="text-slate-900 font-medium mb-1">No tasks for today</h3>
                <p className="text-slate-500 text-sm">Enjoy your free time or plan ahead.</p>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="mt-4 text-indigo-600 font-medium hover:underline text-sm"
                >
                    + Add a task
                </button>
                {isCreateModalOpen && <TaskModal onClose={() => setIsCreateModalOpen(false)} />}
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center justify-center gap-2 w-full py-4 px-4 bg-skin-accent text-white rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-skin-accent/30 active:scale-95 duration-200"
                >
                    <Plus size={20} />
                    <span className="font-medium">Add Task</span>
                </button>
            </div>

            <div className="space-y-1">
                <AnimatePresence mode='popLayout'>
                    {tasks.map((task, index) => (
                        <motion.div
                            key={task.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <TaskItem task={task} onEdit={() => setEditingTask(task)} />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Modals */}
            {isCreateModalOpen && <TaskModal onClose={() => setIsCreateModalOpen(false)} />}
            {editingTask && (
                <TaskModal
                    taskToEdit={editingTask}
                    onClose={() => setEditingTask(null)}
                />
            )}
        </div>
    );
}

export default TaskList;
