import React, { useState } from 'react';
import { User, ArrowRight, Sparkles } from 'lucide-react';
import useStore from '../../store/useStore';

/**
 * OnboardingModal - First-time login experience
 * Collects the user's name and personalizes the assistant
 */
function OnboardingModal() {
    const { user, updateProfile } = useStore();
    const [name, setName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Only show if onboarding is required
    if (!user.onboardingRequired) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsSubmitting(true);
        try {
            await updateProfile({
                name: name.trim(),
                onboardingRequired: false
            });

            // Show success notification
            import('../../store/useUIStore').then(m =>
                m.useUIStore.getState().addNotification(`Welcome aboard, ${name.trim()}!`, 'success')
            );
        } catch (error) {
            console.error('[Onboarding] Failed to update name:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-500">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20 relative">

                {/* Visual Accent */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-skin-accent via-indigo-500 to-skin-accent"></div>

                <div className="p-10 md:p-12 text-center">
                    <div className="w-20 h-20 bg-skin-accent/10 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <User size={40} className="text-skin-accent" />
                    </div>

                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-widest rounded-full mb-4 border border-indigo-100 dark:border-indigo-500/20">
                        <Sparkles size={12} />
                        Personalizing Your Assistant
                    </div>

                    <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                        What should I call you?
                    </h2>

                    <p className="text-slate-500 dark:text-slate-400 text-lg mb-10 leading-relaxed">
                        Setting your name helps tailor the daily briefings and insights just for you.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative group">
                            <input
                                autoFocus
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your name"
                                className="w-full px-6 py-5 bg-slate-50 dark:bg-white/[0.03] border-2 border-slate-100 dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-skin-accent/10 focus:border-skin-accent focus:bg-white dark:focus:bg-white/[0.05] outline-none text-xl font-bold text-slate-900 dark:text-white transition-all text-center placeholder:text-slate-300 dark:placeholder:text-slate-600"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || !name.trim()}
                            className="w-full bg-skin-accent text-white py-5 rounded-2xl font-bold text-xl shadow-2xl shadow-skin-accent/30 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:grayscale"
                        >
                            {isSubmitting ? (
                                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>Let's Begin</span>
                                    <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default OnboardingModal;
