import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, Target, Settings, Plus, Sun, Moon } from 'lucide-react';
import clsx from 'clsx';
import TaskModal from '../Tasks/TaskModal';
import useStore from '../../store/useStore';

const navItems = [
    { icon: LayoutDashboard, label: 'Today', path: '/' },
    { icon: Calendar, label: 'Calendar', path: '/calendar' },
    { icon: Target, label: 'Goals', path: '/goals' },
];

function Sidebar() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const theme = useStore((state) => state.user.theme);
    const setTheme = useStore((state) => state.setTheme);

    const toggleTheme = () => {
        const next = theme === 'light' ? 'dark' : 'light';
        setTheme(next);
        // Show notification
        import('../../store/useUIStore').then(m => m.useUIStore.getState().addNotification(`Switched to ${next} mode`, 'success'));
    };

    return (
        <>
            <aside className="h-screen w-64 bg-skin-secondary/50 backdrop-blur-xl border-r border-slate-200/60 dark:border-white/10 fixed left-0 top-0 flex flex-col p-6 z-50 transition-colors duration-300">
                <div className="flex items-center gap-3 px-2 mb-10">
                    <img src="/src/assets/logo.png" alt="Secretary Logo" className="w-10 h-10 rounded-xl shadow-lg shadow-skin-accent/30 object-contain" />
                    <span className="font-semibold text-skin-text text-xl tracking-tight">Secretary</span>
                </div>

                <nav className="space-y-1 flex-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                clsx(
                                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
                                    isActive
                                        ? 'bg-skin-accent/10 text-skin-accent shadow-sm'
                                        : 'text-skin-muted hover:bg-black/5 dark:hover:bg-white/5 hover:text-skin-text'
                                )
                            }
                        >
                            <item.icon size={20} className={clsx("transition-transform duration-200 group-hover:scale-110")} strokeWidth={2} />
                            <span className="font-medium">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center gap-2 w-full bg-skin-accent text-white p-3 rounded-xl hover:opacity-90 transition-all duration-200 shadow-lg shadow-skin-accent/30 active:scale-95 group"
                >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                    <span className="font-medium">New Task</span>
                </button>

                <NavLink to="/settings" className={({ isActive }) =>
                    clsx("mt-6 pt-6 border-t border-slate-200/60 dark:border-white/10 flex items-center gap-3 px-2 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 rounded-xl p-2 transition-colors",
                        isActive ? "text-skin-accent" : "text-skin-muted")
                }>
                    <Settings size={20} />
                    <span className="text-sm font-medium">Settings</span>
                </NavLink>

                {/* Theme Toggle Button */}
                <button
                    onClick={toggleTheme}
                    className="mt-2 flex items-center gap-3 px-4 py-2 text-xs font-medium text-skin-muted hover:text-skin-text transition-colors w-full"
                >
                    <span className="w-5 h-5 flex items-center justify-center">
                        <div className={`w-3 h-3 rounded-full ${theme === 'dark' ? 'bg-indigo-500' : 'bg-orange-400'}`}></div>
                    </span>
                    <span>Switch Theme ({theme})</span>
                </button>
            </aside>
            {isModalOpen && <TaskModal onClose={() => setIsModalOpen(false)} />}
        </>
    );
}

export default Sidebar;
