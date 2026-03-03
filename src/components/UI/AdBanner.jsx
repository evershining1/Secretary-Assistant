import React from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../../store/useStore';
import { Sparkles, X, ExternalLink } from 'lucide-react';
import clsx from 'clsx';

/**
 * AdBanner - Smart Monetization Component
 * Only visible to 'free' tier users.
 */
function AdBanner({ placement = 'sidebar' }) {
    const { user, adConfig } = useStore();
    const [isVisible, setIsVisible] = React.useState(true);
    const navigate = useNavigate();

    // Only show for free tier and if not manually dismissed
    if (user.tier !== 'free' || !isVisible) return null;

    // Respect Admin Settings
    if (placement === 'sidebar' && !adConfig?.sidebar_enabled) return null;
    if (placement === 'inline' && !adConfig?.inline_enabled) return null;

    const bannerStyles = {
        sidebar: "bg-gradient-to-br from-slate-900 to-slate-800 p-4 rounded-2xl border border-white/10 shadow-lg mt-auto overflow-hidden relative group",
        dashboard: "bg-white dark:bg-slate-900/50 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/60 dark:border-white/5 shadow-sm mb-6 relative overflow-hidden",
        inline: "bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 my-4 text-center cursor-pointer hover:bg-slate-100 transition-colors"
    };

    const handleAdClick = () => {
        if (placement === 'sidebar' || placement === 'dashboard') {
            navigate('/pricing');
        } else if (placement === 'inline') {
            window.open(adConfig?.default_affiliate_link || 'https://amazon.com/?tag=mysec-20', '_blank');
        }
    };

    return (
        <div className={bannerStyles[placement]} onClick={placement === 'inline' ? handleAdClick : undefined}>
            {/* Ambient Glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-skin-accent/20 blur-3xl rounded-full group-hover:bg-skin-accent/30 transition-all duration-700"></div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-full">Sponsored</span>
                    <button onClick={(e) => { e.stopPropagation(); setIsVisible(false); }} className="text-slate-500 hover:text-white transition-colors">
                        <X size={14} />
                    </button>
                </div>

                <div className="flex gap-4 items-center">
                    {placement !== 'inline' && (
                        <div className="w-12 h-12 bg-skin-accent/10 rounded-xl flex-shrink-0 flex items-center justify-center text-skin-accent">
                            <Sparkles size={24} />
                        </div>
                    )}

                    <div className="flex-1 text-left">
                        <h4 className={clsx("font-bold text-slate-900 dark:text-white mb-1", placement === 'inline' ? 'text-sm' : 'text-sm text-white')}>
                            {placement === 'inline' ? 'Recommended Tools for Productivity' : 'Go Ad-Free with Premium'}
                        </h4>
                        <p className={clsx("text-xs leading-relaxed mb-3", placement === 'inline' ? 'text-slate-500 dark:text-slate-400' : 'text-slate-400')}>
                            {placement === 'inline' ? 'Check out our favorite gear to help you stay focused and hit your goals faster.' : 'Unlock Unlimited Sync, Goal AI, and remove all ads today.'}
                        </p>

                        {placement !== 'inline' && (
                            <button
                                onClick={(e) => { e.stopPropagation(); handleAdClick(); }}
                                className="w-full bg-skin-accent hover:opacity-90 text-white text-xs font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-skin-accent/20"
                            >
                                <span>Upgrade Now</span>
                                <ExternalLink size={12} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdBanner;
