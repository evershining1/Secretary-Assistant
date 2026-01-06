import React from 'react';
import useStore from '../../store/useStore';
import { format } from 'date-fns';
import { Bell } from 'lucide-react';

function TopBar() {
    const user = useStore((state) => state.user);
    const today = new Date();

    return (
        <header className="h-20 px-8 flex items-center justify-between bg-transparent">
            <div>
                <h2 className="text-xl font-semibold text-slate-800">
                    {format(today, 'EEEE, MMMM d')}
                </h2>
            </div>

            <div className="flex items-center gap-6">
                <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
                    <Bell size={20} />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-slate-50"></span>
                </button>

                <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500">Pro Plan</p>
                    </div>
                    <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover"
                    />
                </div>
            </div>
        </header>
    );
}

export default TopBar;
