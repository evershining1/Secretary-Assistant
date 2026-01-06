import React, { useEffect } from 'react';
import { useUIStore } from '../../store/useUIStore';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';
import clsx from 'clsx';

function NotificationCenter() {
    const notifications = useUIStore(state => state.notifications);
    const removeNotification = useUIStore(state => state.removeNotification);

    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
            <AnimatePresence>
                {notifications.map(notification => (
                    <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onDismiss={() => removeNotification(notification.id)}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}

function NotificationItem({ notification, onDismiss }) {
    useEffect(() => {
        const timer = setTimeout(onDismiss, 5000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    const icons = {
        success: <CheckCircle size={20} className="text-emerald-500" />,
        error: <AlertCircle size={20} className="text-rose-500" />,
        info: <Info size={20} className="text-blue-500" />,
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            className="pointer-events-auto bg-white rounded-xl shadow-lg border border-slate-100 p-4 flex items-start gap-3 w-80 backdrop-blur-md"
        >
            <div className="mt-0.5 shrink-0">
                {icons[notification.type] || icons.info}
            </div>
            <div className="flex-1 pt-0.5">
                <p className="text-sm font-medium text-slate-800 leading-snug">
                    {notification.message}
                </p>
            </div>
            <button
                onClick={onDismiss}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
            >
                <X size={16} />
            </button>
        </motion.div>
    );
}

export default NotificationCenter;
