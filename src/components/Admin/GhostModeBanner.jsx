import React from 'react';
import { EyeOff, ShieldAlert, X } from 'lucide-react';
import useStore from '../../store/useStore';

export function GhostModeBanner() {
    const { isImpersonating, impersonatedUser, exitGhostMode } = useStore();

    if (!isImpersonating || !impersonatedUser) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-rose-600 text-white px-6 py-2 shadow-2xl flex items-center justify-between animate-in slide-in-from-top duration-500">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
                    <ShieldAlert size={12} strokeWidth={3} />
                    <span>Ghost Mode Active</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold opacity-80 uppercase tracking-tighter">Viewing account:</span>
                    <span className="text-xs font-black italic">{impersonatedUser.email}</span>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <p className="hidden md:block text-[10px] font-medium opacity-60 uppercase tracking-widest">Global actions are read-only in this state</p>
                <button
                    onClick={() => {
                        exitGhostMode();
                        window.location.href = '/admin';
                    }}
                    className="flex items-center gap-2 bg-white text-rose-600 px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:brightness-110 transition-all shadow-lg active:scale-95"
                >
                    <EyeOff size={14} strokeWidth={3} />
                    <span>Terminate Session</span>
                </button>
            </div>
        </div>
    );
}
