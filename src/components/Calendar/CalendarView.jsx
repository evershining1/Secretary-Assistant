import React, { useState, useMemo } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    addDays,
    subDays,
    isToday,
    getHours,
    getMinutes
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List, Clock } from 'lucide-react';
import clsx from 'clsx';
import useStore from '../../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import TaskModal from '../Tasks/TaskModal';

function CalendarView() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState('month'); // 'month' | 'day'
    const [editingTask, setEditingTask] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const tasks = useStore(state => state.tasks);

    // Navigation
    const next = () => {
        if (view === 'month') setCurrentDate(addMonths(currentDate, 1));
        else setCurrentDate(addDays(currentDate, 1));
    };

    const prev = () => {
        if (view === 'month') setCurrentDate(subMonths(currentDate, 1));
        else setCurrentDate(subDays(currentDate, 1));
    };

    const goToToday = () => setCurrentDate(new Date());

    // Month Logic
    const monthDays = useMemo(() => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);
        return eachDayOfInterval({ start: startDate, end: endDate });
    }, [currentDate]);

    // Day Logic
    const dayTasks = useMemo(() => {
        return tasks
            .filter(t => isSameDay(new Date(t.date), currentDate))
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [tasks, currentDate]);

    const getTasksForDay = (day) => tasks.filter(task => isSameDay(new Date(task.date), day));

    return (
        <div className="bg-skin-secondary/80 backdrop-blur-sm rounded-[2rem] border border-slate-200/60 dark:border-white/10 shadow-sm overflow-hidden h-full flex flex-col relative transition-colors duration-300">

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-skin-muted/20 bg-skin-secondary/95 z-10 transition-colors duration-300">
                <div className="flex items-center gap-4">
                    <h2 className="text-3xl font-bold text-skin-text tracking-tight transition-colors duration-300">
                        {view === 'month' ? format(currentDate, 'MMMM yyyy') : format(currentDate, 'MMMM d, yyyy')}
                    </h2>
                    <div className="flex bg-skin-primary rounded-xl p-1 gap-1 border border-skin-muted/10">
                        <button
                            onClick={() => setView('day')}
                            className={clsx("px-3 py-1.5 rounded-lg text-sm font-medium transition-all", view === 'day' ? "bg-skin-secondary text-skin-accent shadow-sm" : "text-skin-muted hover:text-skin-text")}
                        >
                            Day
                        </button>
                        <button
                            onClick={() => setView('month')}
                            className={clsx("px-3 py-1.5 rounded-lg text-sm font-medium transition-all", view === 'month' ? "bg-skin-secondary text-skin-accent shadow-sm" : "text-skin-muted hover:text-skin-text")}
                        >
                            Month
                        </button>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button onClick={prev} className="p-2 hover:bg-skin-primary rounded-xl text-skin-muted hover:text-skin-text transition-colors border border-skin-muted/20">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={next} className="p-2 hover:bg-skin-primary rounded-xl text-skin-muted hover:text-skin-text transition-colors border border-skin-muted/20">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto relative bg-skin-primary/30">
                <AnimatePresence mode="wait">
                    {view === 'month' ? (
                        <motion.div
                            key="month"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full flex flex-col"
                        >
                            <div className="grid grid-cols-7 bg-skin-secondary border-b border-skin-muted/20">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div key={day} className="py-4 text-center text-xs font-bold text-skin-muted uppercase tracking-widest">
                                        {day}
                                    </div>
                                ))}
                            </div>
                            <div className="flex-1 grid grid-cols-7 auto-rows-fr bg-skin-muted/10 gap-px border-b border-skin-muted/20">
                                {monthDays.map((day) => {
                                    const dayItems = getTasksForDay(day);
                                    const isCurrentMonth = isSameMonth(day, currentDate);
                                    const isTodayDate = isToday(day);

                                    return (
                                        <div
                                            key={day.toString()}
                                            onClick={() => {
                                                setCurrentDate(day);
                                                setView('day');
                                            }}
                                            className={clsx(
                                                "bg-skin-secondary p-3 min-h-[100px] relative group hover:bg-skin-accent/5 transition-colors cursor-pointer flex flex-col gap-1",
                                                !isCurrentMonth && "bg-skin-primary/60 opacity-60"
                                            )}
                                        >
                                            <span className={clsx(
                                                "w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold mb-1 transition-all",
                                                isTodayDate
                                                    ? "bg-skin-accent text-white shadow-md shadow-skin-accent/30"
                                                    : "text-skin-text group-hover:bg-skin-primary group-hover:shadow-sm"
                                            )}>
                                                {format(day, 'd')}
                                            </span>

                                            {/* Dots/Bars indicator similar to inspiration */}
                                            <div className="flex flex-col gap-1">
                                                {dayItems.slice(0, 4).map(item => (
                                                    <div key={item.id} className="flex items-center gap-1.5 overflow-hidden">
                                                        <div className={clsx("w-1.5 h-1.5 rounded-full shrink-0",
                                                            item.type === 'event' ? "bg-violet-400" : "bg-skin-accent"
                                                        )} />
                                                        <span className={clsx("text-[10px] font-medium truncate", !isCurrentMonth ? "text-skin-muted/60" : "text-skin-muted")}>
                                                            {item.title}
                                                        </span>
                                                    </div>
                                                ))}
                                                {dayItems.length > 4 && (
                                                    <span className="text-[10px] text-skin-muted pl-3">+{dayItems.length - 4} more</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="day"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="p-8 max-w-4xl mx-auto"
                        >
                            {/* Timeline Header */}
                            <div className="flex items-center justify-center mb-10">
                                <div className="text-center">
                                    <div className="text-sm font-bold text-skin-muted uppercase tracking-widest mb-1">{format(currentDate, 'EEEE')}</div>
                                    <h1 className="text-4xl font-black text-skin-text">{format(currentDate, 'd')}</h1>
                                </div>
                            </div>

                            <div className="relative border-l-2 border-skin-muted/20 ml-6 md:ml-20 space-y-12 pb-20">
                                {/* Wake Up Marker */}
                                <div className="relative pl-8 md:pl-12 group">
                                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-skin-secondary border-4 border-amber-300 shadow-sm z-10"></div>
                                    <span className="absolute -left-16 md:-left-24 top-0 text-xs font-bold text-skin-muted w-12 text-right">08:00 AM</span>
                                    <div className="text-lg font-bold text-skin-text">Wake up</div>
                                    <div className="text-skin-muted text-sm">Review daily goals</div>
                                </div>

                                {/* Dynamic Tasks */}
                                {dayTasks.map((task, idx) => (
                                    <div
                                        key={task.id}
                                        onClick={() => setEditingTask(task)}
                                        className="relative pl-8 md:pl-12 group cursor-pointer"
                                    >
                                        <div className={clsx(
                                            "absolute -left-[9px] top-4 w-4 h-4 rounded-full border-4 shadow-sm z-10 transition-transform group-hover:scale-125",
                                            task.completed ? "bg-emerald-500 border-skin-secondary" : "bg-skin-secondary border-skin-accent"
                                        )}></div>

                                        <span className="absolute -left-16 md:-left-24 top-4 text-xs font-bold text-skin-muted w-12 text-right">
                                            {format(new Date(task.date), 'h:mm a')}
                                        </span>

                                        <div className={clsx(
                                            "p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden active:scale-[0.98]",
                                            task.completed
                                                ? "bg-skin-primary border-skin-muted/20 opacity-60"
                                                : "bg-skin-secondary border-slate-200/60 dark:border-white/5 shadow-sm hover:shadow-md hover:border-skin-accent/20"
                                        )}>
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className={clsx("text-lg font-bold transition-colors", task.completed ? "text-skin-muted line-through" : "text-skin-text")}>
                                                    {task.title}
                                                </h3>
                                                {task.type === 'event' && (
                                                    <span className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                                                        Event
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-4 text-sm text-skin-muted">
                                                {task.location && (
                                                    <span className="flex items-center gap-1">
                                                        📍 {task.location}
                                                    </span>
                                                )}
                                                {task.duration && (
                                                    <span className="flex items-center gap-1">
                                                        ⏱ {task.duration} min
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {dayTasks.length === 0 && (
                                    <div className="relative pl-12 opacity-50">
                                        <div className="p-8 rounded-2xl border-2 border-dashed border-skin-muted/40 text-center">
                                            <p className="text-skin-muted font-medium">No tasks scheduled</p>
                                        </div>
                                    </div>
                                )}

                                {/* Sleep Marker */}
                                <div className="relative pl-8 md:pl-12 pb-10">
                                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-skin-secondary border-4 border-skin-muted/40 shadow-sm z-10"></div>
                                    <span className="absolute -left-16 md:-left-24 top-0 text-xs font-bold text-skin-muted w-12 text-right">10:00 PM</span>
                                    <div className="text-lg font-bold text-skin-text">Wind Down</div>
                                    <div className="text-skin-muted text-sm">Prepare for tomorrow</div>
                                </div>
                            </div>
                        </motion.div>
                    )}
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

            {/* Floating Action Button */}
            <button
                onClick={() => setIsCreateModalOpen(true)}
                className="absolute bottom-8 right-8 w-14 h-14 bg-skin-accent hover:opacity-90 text-white rounded-full shadow-xl shadow-skin-accent/30 flex items-center justify-center transition-all hover:scale-110 active:scale-90 z-20"
            >
                <span className="text-3xl font-light mb-1">+</span>
            </button>
        </div>
    );
}

export default CalendarView;
