import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../../store/useStore';
import { useUIStore } from '../../store/useUIStore';
import {
    Calendar as CalendarIcon,
    Shield,
    User as UserIcon,
    Bell, Palette, Globe,
    MessageCircle, Heart, Star, HelpCircle, ExternalLink,
    Mail, Save, CheckCircle
} from 'lucide-react';
import clsx from 'clsx';
import ConfirmModal from '../UI/ConfirmModal';
import EmilyChat from '../Support/EmilyChat';

function SettingsPage() {
    const navigate = useNavigate();
    const user = useStore(state => state.user);
    const updateProfile = useStore(state => state.updateProfile);
    const [name, setName] = useState(user.name);
    const [saved, setSaved] = useState(false);
    const [integrationToDisconnect, setIntegrationToDisconnect] = useState(null);
    const [showSupport, setShowSupport] = useState(false);

    // Sync local state if user changes externally (optional, but good practice)
    React.useEffect(() => {
        setName(user.name);
    }, [user.name]);

    const integrations = useStore(state => state.user.integrations || {});
    const toggleIntegrationStore = useStore(state => state.toggleIntegration);

    // Mock State for integrations (Replaced by global store)
    /* 
    const [integrations, setIntegrations] = useState({
        google: true,
        outlook: false,
        apple: false
    });
    */

    const handleSave = () => {
        if (useStore.getState().updateProfile) {
            useStore.getState().updateProfile({ name });
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const toggleIntegration = async (key) => {
        // LOCK: Premium Gating
        if (user.tier === 'free' && (key === 'outlook' || key === 'apple')) {
            useUIStore.getState().addNotification(`Connecting ${key} requires a Premium subscription.`, 'info');
            navigate('/pricing');
            return;
        }

        if (integrations[key]) {
            setIntegrationToDisconnect(key);
        } else {
            // Connect
            try {
                if (key === 'google') {
                    const GoogleOAuth = (await import('../../services/auth/GoogleOAuth')).default;
                    await GoogleOAuth.authenticate();
                } else if (key === 'outlook') {
                    const choice = confirm('How would you like to connect Outlook?\n\nOK = OAuth (Recommended)\nCancel = ICS Subscription Link (Easier)');
                    if (choice) {
                        const OutlookOAuth = (await import('../../services/auth/OutlookOAuth')).default;
                        await OutlookOAuth.authenticate();
                    } else {
                        const url = prompt('Please enter your Outlook "Publish Calendar" link (https://outlook.office365.com/...):');
                        if (url) {
                            updateProfile({ metadata: { ...user.metadata, outlookCalendarUrl: url } });
                            toggleIntegrationStore('outlook');
                            useUIStore.getState().addNotification(`Outlook Calendar connected via link!`, 'success');
                        }
                    }
                } else if (key === 'apple') {
                    const url = prompt('Please enter your Public iCloud Calendar link (webcal://...):');
                    if (url) {
                        updateProfile({ metadata: { ...user.metadata, appleCalendarUrl: url } });
                        toggleIntegrationStore('apple');
                        useUIStore.getState().addNotification(`Apple Calendar connected!`, 'success');
                    }
                } else {
                    useUIStore.getState().addNotification(`${key} Calendar integration coming soon!`, 'info');
                }
            } catch (error) {
                console.error(`Failed to connect ${key}:`, error);
                useUIStore.getState().addNotification(`Failed to connect ${key} Calendar`, 'error');
            }
        }
    };

    const confirmDisconnect = async () => {
        const key = integrationToDisconnect;
        if (!key) return;

        try {
            if (key === 'google') {
                const GoogleOAuth = (await import('../../services/auth/GoogleOAuth')).default;
                await GoogleOAuth.disconnect();
            }
            toggleIntegrationStore(key);
            useUIStore.getState().addNotification(`${key} Calendar disconnected`, 'success');
        } catch (error) {
            console.error(`Failed to disconnect ${key}:`, error);
            useUIStore.getState().addNotification(`Failed to disconnect ${key} Calendar`, 'error');
        }
        setIntegrationToDisconnect(null);
    };

    return (
        <div className="py-8 max-w-3xl">
            <h1 className="text-3xl font-bold text-skin-text mb-2">Settings</h1>
            <p className="text-skin-muted mb-8">Manage your profile and connected services.</p>

            <div className="space-y-8">
                {/* Profile Section */}
                <section className="bg-skin-secondary/80 backdrop-blur-sm rounded-3xl p-8 border border-slate-200/60 dark:border-white/10 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-skin-accent/10 p-2 rounded-xl text-skin-accent">
                            <UserIcon size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-skin-text">Profile Settings</h2>
                    </div>

                    <div className="flex items-center gap-6 mb-6">
                        <img src={user.avatar} alt="Profile" className="w-20 h-20 rounded-full object-cover shadow-md" />
                        <div>
                            <input
                                type="file"
                                id="avatar-upload"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;

                                    // Convert to base64 for now (or upload to Supabase Storage)
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                        updateProfile({ avatar: reader.result });
                                    };
                                    reader.readAsDataURL(file);
                                }}
                            />
                            <label
                                htmlFor="avatar-upload"
                                className="text-sm font-medium text-skin-accent hover:opacity-80 bg-skin-accent/10 px-4 py-2 rounded-lg transition-colors cursor-pointer inline-block"
                            >
                                Change Avatar
                            </label>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-skin-muted mb-2">Display Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 bg-skin-primary border border-skin-muted/20 text-skin-text rounded-xl focus:ring-2 focus:ring-skin-accent/20 outline-none transition-all placeholder-skin-muted/50"
                            />
                        </div>
                        <button
                            onClick={handleSave}
                            className={clsx(
                                "flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all",
                                saved ? "bg-emerald-500 text-white" : "bg-skin-text text-skin-secondary hover:opacity-90"
                            )}>
                            {saved ? <span className="flex items-center gap-2"><CheckCircle size={18} /> Saved!</span> : <><Save size={18} /> Save Changes</>}
                        </button>
                    </div>
                </section>

                {/* Integrations Section */}
                <section className="bg-skin-secondary/80 backdrop-blur-sm rounded-3xl p-8 border border-slate-200/60 dark:border-white/10 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-skin-accent/10 p-2 rounded-xl text-skin-accent">
                            <CalendarIcon size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-skin-text">Connected Calendars</h2>
                    </div>

                    <p className="text-skin-muted mb-6 text-sm">
                        Connect your external calendars to automatically import events into your daily schedule.
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border border-skin-muted/20 rounded-2xl hover:border-skin-accent/30 transition-colors bg-skin-primary/30">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-skin-secondary rounded-full flex items-center justify-center shadow-sm text-lg font-bold text-skin-text">
                                    G
                                </div>
                                <div>
                                    <h4 className="font-semibold text-skin-text">Google Calendar</h4>
                                    <p className="text-xs text-skin-muted">Syncs events and meetings</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={integrations.google} onChange={() => toggleIntegration('google')} className="sr-only peer" />
                                <div className="w-11 h-6 bg-skin-muted/20 peer-focus:outline-none ring-0 peer-focus:ring-2 peer-focus:ring-skin-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-skin-accent"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-4 border border-skin-muted/20 rounded-2xl hover:border-skin-accent/30 transition-colors bg-skin-primary/30">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-skin-secondary rounded-full flex items-center justify-center shadow-sm text-lg font-bold text-skin-text">
                                    O
                                </div>
                                <div>
                                    <h4 className="font-semibold text-skin-text">Outlook Calendar</h4>
                                    <p className="text-xs text-skin-muted">Syncs work schedule</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={integrations.outlook} onChange={() => toggleIntegration('outlook')} className="sr-only peer" />
                                <div className="w-11 h-6 bg-skin-muted/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-skin-accent"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-4 border border-skin-muted/20 rounded-2xl hover:border-skin-accent/30 transition-colors bg-skin-primary/30">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-skin-secondary rounded-full flex items-center justify-center shadow-sm text-lg font-bold text-skin-text">
                                    A
                                </div>
                                <div>
                                    <h4 className="font-semibold text-skin-text">Apple Calendar</h4>
                                    <p className="text-xs text-skin-muted">Syncs iCloud events</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={integrations.apple} onChange={() => toggleIntegration('apple')} className="sr-only peer" />
                                <div className="w-11 h-6 bg-skin-muted/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-skin-accent"></div>
                            </label>
                        </div>
                    </div>
                </section>
            </div>

            {/* Help & Support */}
            <div className="mt-8 bg-white dark:bg-slate-900/50 backdrop-blur-xl p-8 rounded-[32px] border border-slate-200/60 dark:border-white/5 shadow-sm mb-8">
                <div className="flex items-center gap-4 mb-8">
                    <div className="bg-indigo-50 dark:bg-indigo-500/10 p-3 rounded-2xl text-indigo-600 dark:text-indigo-400">
                        <HelpCircle size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Help & Support</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Get assistance or share your feedback.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={() => setShowSupport(true)}
                        className="flex items-center justify-between p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 hover:border-skin-accent transition-all group text-left"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl text-skin-accent shadow-sm group-hover:scale-110 transition-transform">
                                <MessageCircle size={20} />
                            </div>
                            <div>
                                <div className="font-bold text-slate-900 dark:text-white">Chat with Emily</div>
                                <div className="text-xs text-slate-500">Instant AI Assistant</div>
                            </div>
                        </div>
                        <ExternalLink size={16} className="text-slate-300 group-hover:text-skin-accent" />
                    </button>

                    <button
                        onClick={() => {
                            // Logic to force show feedback if not already showing
                            localStorage.removeItem('secretary_feedback_prompted');
                            window.location.reload(); // Quick hack to trigger the effect in App
                        }}
                        className="flex items-center justify-between p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 hover:border-red-400 transition-all group text-left"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl text-red-500 shadow-sm group-hover:scale-110 transition-transform">
                                <Heart size={20} />
                            </div>
                            <div>
                                <div className="font-bold text-slate-900 dark:text-white">Share Feedback</div>
                                <div className="text-xs text-slate-500">Rate your experience</div>
                            </div>
                        </div>
                        <Star size={16} className="text-slate-300 group-hover:text-amber-400" />
                    </button>
                </div>
            </div>

            <ConfirmModal
                isOpen={!!integrationToDisconnect}
                onClose={() => setIntegrationToDisconnect(null)}
                onConfirm={confirmDisconnect}
                title="Disconnect Calendar?"
                message={`Are you sure you want to disconnect your ${integrationToDisconnect === 'google' ? 'Google' : integrationToDisconnect} Calendar? Your synced events will be removed from the view.`}
                confirmText="Disconnect"
                type="danger"
            />

            {showSupport && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="relative w-full max-w-lg">
                        <EmilyChat forcedOpen={true} onClose={() => setShowSupport(false)} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default SettingsPage;
