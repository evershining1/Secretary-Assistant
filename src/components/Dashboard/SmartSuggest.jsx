import React, { useState } from 'react';
import { Sparkles, X, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

function SmartSuggest() {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed bottom-8 right-8 z-40 max-w-sm w-full"
            >
                <div className="bg-white rounded-2xl shadow-2xl border border-indigo-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white font-bold">
                            <Sparkles size={18} fill="currentColor" />
                            <span>Smart Suggestion</span>
                        </div>
                        <button onClick={() => setIsVisible(false)} className="text-white/60 hover:text-white">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="p-6">
                        <p className="text-slate-600 mb-4 leading-relaxed">
                            You have a 2-hour gap between 2 PM and 4 PM. It's a great time to tackle <strong>"Update documentation"</strong>.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsVisible(false)}
                                className="flex-1 bg-indigo-600 text-white py-2 rounded-xl font-medium text-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                            >
                                Schedule it <ArrowRight size={16} />
                            </button>
                            <button
                                onClick={() => setIsVisible(false)}
                                className="px-4 py-2 text-slate-400 font-medium text-sm hover:text-slate-600"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

export default SmartSuggest;
