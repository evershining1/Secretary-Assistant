import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Tag, Flag, MapPin, ChevronRight, LayoutGrid } from 'lucide-react';
import useStore from '../../store/useStore';
import { IngestionService } from '../../services/IngestionService';
import { format } from 'date-fns';
import { LocationAutocomplete } from '../UI/LocationAutocomplete';

function TaskModal({ onClose, taskToEdit = null, initialData = {} }) {
    const addTask = useStore(state => state.addTask);
    const updateTask = useStore(state => state.updateTask);

    const [title, setTitle] = useState('');
    const [priority, setPriority] = useState('medium');
    const [type, setType] = useState('task');
    const [location, setLocation] = useState('');

    // Explicit Date and Time state
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [time, setTime] = useState(format(new Date(), 'HH:mm'));

    useEffect(() => {
        if (taskToEdit) {
            setTitle(taskToEdit.title);
            setPriority(taskToEdit.priority || 'medium');
            setType(taskToEdit.type || 'task');
            setLocation(taskToEdit.location || '');

            if (taskToEdit.date) {
                const d = new Date(taskToEdit.date);
                setDate(format(d, 'yyyy-MM-dd'));
                setTime(format(d, 'HH:mm'));
            }
        } else if (initialData.title) {
            setTitle(initialData.title);
        }
    }, [taskToEdit, initialData]);

    // Dynamic Parsing Hook
    useEffect(() => {
        if (!title || taskToEdit) return;

        const parsed = IngestionService.parseNaturalLanguage(title);

        if (parsed.date) setDate(parsed.date);
        if (parsed.time) {
            setTime(parsed.time);
            setType('event');
        }
        if (parsed.location) setLocation(parsed.location);

        // If we found a date or time, it's likely an event
        if (parsed.hasTime) setType('event');
    }, [title, taskToEdit]);



    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        console.log('[TaskModal] Form submitted:', { title, date, time, priority, type, location });

        let finalDate = new Date();

        // If editing or manually set, use the picker values
        if (date) {
            finalDate = new Date(date);
            if (time) {
                const [hours, minutes] = time.split(':');
                finalDate.setHours(parseInt(hours), parseInt(minutes));
            }
        }

        console.log('[TaskModal] Final date:', finalDate);

        try {
            if (taskToEdit) {
                console.log('[TaskModal] Updating task:', taskToEdit.id);
                await updateTask(taskToEdit.id, {
                    title,
                    priority,
                    type,
                    location,
                    date: finalDate,
                    duration: taskToEdit.duration
                });
                console.log('[TaskModal] Task updated successfully');
            } else {
                const parsed = IngestionService.parseNaturalLanguage(title);
                console.log('[TaskModal] Creating new task, parsed:', parsed);

                await addTask({
                    title: parsed.title,
                    priority,
                    type: parsed.hasTime ? 'event' : type,
                    date: parsed.hasTime ? parsed.date : finalDate,
                    duration: parsed.duration,
                    location,
                    ...initialData
                });
                console.log('[TaskModal] Task created successfully');
            }
            onClose();
        } catch (error) {
            console.error('[TaskModal] Error:', error);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white/95 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/50 ring-1 ring-slate-900/5">

                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-white/50">
                    <div className="flex items-center gap-2 text-slate-400 text-sm font-medium uppercase tracking-wider">
                        <LayoutGrid size={16} />
                        {taskToEdit ? 'Edit Details' : 'New Entry'}
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    {/* Main Input */}
                    <div>
                        <input
                            type="text"
                            placeholder="What needs to be done?"
                            className="w-full text-2xl font-bold placeholder:text-slate-300 border-none focus:ring-0 p-0 text-slate-900 bg-transparent mb-2"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            autoFocus
                        />
                        {!taskToEdit && title && (
                            <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
                                {IngestionService.parseNaturalLanguage(title).hasTime && (
                                    <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase rounded-md flex items-center gap-1 border border-indigo-100">
                                        <Clock size={10} /> Smart Time Detected
                                    </span>
                                )}
                                {IngestionService.parseNaturalLanguage(title).date && (
                                    <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase rounded-md flex items-center gap-1 border border-emerald-100">
                                        <Calendar size={10} /> Smart Date Detected
                                    </span>
                                )}
                                {IngestionService.parseNaturalLanguage(title).location && (
                                    <span className="px-2 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold uppercase rounded-md flex items-center gap-1 border border-amber-100">
                                        <MapPin size={10} /> Smart Location Detected
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Properties Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Time & Date */}
                        <div className="col-span-2 space-y-4">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">When</label>
                            <div className="flex gap-3">
                                <div className="flex-1 bg-slate-50 hover:bg-slate-100 transition-colors rounded-2xl p-3 flex items-center gap-3 border border-slate-200/50">
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-indigo-500 shadow-sm">
                                        <Calendar size={16} />
                                    </div>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="bg-transparent border-none p-0 text-sm font-medium text-slate-700 w-full focus:ring-0 cursor-pointer"
                                    />
                                </div>
                                <div className="flex-1 bg-slate-50 hover:bg-slate-100 transition-colors rounded-2xl p-3 flex items-center gap-3 border border-slate-200/50">
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-indigo-500 shadow-sm">
                                        <Clock size={16} />
                                    </div>
                                    <input
                                        type="time"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                        className="bg-transparent border-none p-0 text-sm font-medium text-slate-700 w-full focus:ring-0 cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Where</label>
                            <LocationAutocomplete
                                value={location}
                                onChange={(val) => setLocation(val)}
                                onSelect={(val) => setLocation(val)}
                            />
                        </div>

                        {/* Type */}
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Type</label>
                            <div className="relative">
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    className="w-full appearance-none bg-slate-50 hover:bg-slate-100 transition-colors rounded-2xl p-3 pl-12 text-sm font-medium text-slate-700 border border-slate-200/50 focus:ring-0 cursor-pointer"
                                >
                                    <option value="task">Task</option>
                                    <option value="event">Event</option>
                                </select>
                                <div className="absolute left-3 top-3 w-8 h-8 rounded-full bg-white flex items-center justify-center text-indigo-500 shadow-sm pointer-events-none">
                                    <Tag size={16} />
                                </div>
                            </div>
                        </div>

                        {/* Priority */}
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Priority</label>
                            <div className="relative">
                                <select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                    className="w-full appearance-none bg-slate-50 hover:bg-slate-100 transition-colors rounded-2xl p-3 pl-12 text-sm font-medium text-slate-700 border border-slate-200/50 focus:ring-0 cursor-pointer"
                                >
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                </select>
                                <div className="absolute left-3 top-3 w-8 h-8 rounded-full bg-white flex items-center justify-center text-indigo-500 shadow-sm pointer-events-none">
                                    <Flag size={16} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-6">
                        <button
                            type="submit"
                            disabled={!title.trim()}
                            className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-900/20 active:scale-95 flex items-center gap-2"
                        >
                            <span>{taskToEdit ? 'Save Changes' : 'Add to Schedule'}</span>
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default TaskModal;
