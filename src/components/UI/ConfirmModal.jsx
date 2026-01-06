import React from 'react';
import { X, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Action",
    message = "Are you sure you want to proceed?",
    confirmText = "Delete",
    cancelText = "Cancel",
    type = "danger" // 'danger' | 'info' | 'warning'
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20 ring-1 ring-slate-900/5">

                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                        <AlertCircle size={14} className={clsx(
                            type === 'danger' ? 'text-red-500' : 'text-indigo-500'
                        )} />
                        Confirmation
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 text-center">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                        {message}
                    </p>
                </div>

                <div className="flex gap-3 p-6 pt-0">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 rounded-2xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-sm"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={clsx(
                            "flex-1 px-4 py-3 rounded-2xl font-bold text-white shadow-lg transition-all text-sm active:scale-95",
                            type === 'danger'
                                ? "bg-red-500 hover:bg-red-600 shadow-red-500/20"
                                : "bg-skin-accent hover:opacity-90 shadow-skin-accent/20"
                        )}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmModal;
