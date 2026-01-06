import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, X, Heart, Github, ExternalLink } from 'lucide-react';
import useStore from '../../store/useStore';
import { supabase } from '../../lib/supabase';
import { useUIStore } from '../../store/useUIStore';
import clsx from 'clsx';

/**
 * FeedbackSystem - Proactive User Engagement
 * Prompts for feedback and app reviews based on usage.
 */
function FeedbackSystem() {
    const [isVisible, setIsVisible] = useState(false);
    const [step, setStep] = useState('rating'); // 'rating' | 'feedback' | 'thanks'
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const { user } = useStore();

    // Logic to trigger feedback (e.g., after 5 tasks)
    // For now, let's trigger it based on a local flag to avoid spamming
    useEffect(() => {
        const hasPrompted = localStorage.getItem('secretary_feedback_prompted');
        const taskCount = user.metadata?.tasks_completed || 0;

        if (!hasPrompted && taskCount >= 5) {
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [user.metadata?.tasks_completed]);

    const handleSubmit = async () => {
        try {
            const { error } = await supabase
                .from('user_feedback')
                .insert({
                    user_id: user.id,
                    rating,
                    comment,
                    metadata: { tasks: user.metadata?.tasks_completed }
                });

            if (error) throw error;

            setStep('thanks');
            localStorage.setItem('secretary_feedback_prompted', 'true');

            // Auto close after 3 seconds if on thanks page
            setTimeout(() => setIsVisible(false), 3000);
        } catch (err) {
            console.error('Feedback failed:', err);
            useUIStore.getState().addNotification('Failed to send feedback', 'error');
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[32px] p-8 shadow-2xl relative overflow-hidden border border-slate-200 dark:border-white/10">
                {/* Decorative Pattern */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-400 via-skin-accent to-indigo-500"></div>

                <button onClick={() => setIsVisible(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors">
                    <X size={20} />
                </button>

                {step === 'rating' && (
                    <div className="text-center animate-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-skin-accent">
                            <Heart size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Enjoying Secretary?</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 px-4">Your feedback helps us build a better assistant for everyone.</p>

                        <div className="flex justify-center gap-3 mb-10">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => {
                                        setRating(star);
                                        setStep('feedback');
                                    }}
                                    className={clsx(
                                        "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                                        star <= rating ? "bg-amber-400 text-white shadow-lg shadow-amber-400/30" : "bg-slate-100 dark:bg-white/5 text-slate-300 hover:text-amber-300"
                                    )}
                                >
                                    <Star size={24} fill={star <= rating ? 'currentColor' : 'none'} />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 'feedback' && (
                    <div className="animate-in slide-in-from-right-4 duration-300">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">What can we improve?</h3>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your thoughts... (optional)"
                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-skin-accent outline-none mb-6 min-h-[120px] dark:text-white"
                        />
                        <div className="flex gap-4">
                            <button
                                onClick={() => setIsVisible(false)}
                                className="flex-1 px-6 py-3 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                            >
                                Skip
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="flex-1 bg-skin-accent text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-skin-accent/30 hover:opacity-90 active:scale-95 transition-all"
                            >
                                Send Feedback
                            </button>
                        </div>
                    </div>
                )}

                {step === 'thanks' && (
                    <div className="text-center animate-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-emerald-600">
                            <Star size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Thank You!</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-8">We've received your feedback. You're helping make Secretary better!</p>

                        {rating >= 4 && (
                            <div className="p-6 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl border border-indigo-100 dark:border-indigo-500/20">
                                <p className="text-sm font-bold text-indigo-700 dark:text-indigo-300 mb-4">Would you mind leaving a review on GitHub?</p>
                                <a
                                    href="https://github.com"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-center gap-2 bg-slate-900 text-white py-2 rounded-xl text-sm font-bold hover:bg-black transition-colors"
                                >
                                    <Github size={18} />
                                    <span>Rate on GitHub</span>
                                    <ExternalLink size={14} />
                                </a>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default FeedbackSystem;
