import React, { useState, useEffect } from 'react';
import { Users, Activity, CreditCard, ShieldCheck, ChevronRight, UserPlus, RefreshCw } from 'lucide-react';
import useStore from '../../store/useStore';
import AdminService from '../../services/AdminService';
import { useUIStore } from '../../store/useUIStore';

/**
 * AdminPage - Centralized management for Secretary App
 * Restricted to users with is_admin: true
 */
function AdminPage() {
    const { user } = useStore();
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({ total_users: 0, active_syncs: 0, premium_conversions: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [syncHealth, setSyncHealth] = useState({ total: 0, healthy: 0 });
    const [feedback, setFeedback] = useState([]);
    const [activeTab, setActiveTab] = useState('users');
    const [settings, setSettings] = useState([]);
    const [policies, setPolicies] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [usersList, systemStats, health, systemSettings, securityPolicies] = await Promise.all([
                AdminService.listUsers(),
                AdminService.getSystemStats(),
                AdminService.getSyncHealth(),
                AdminService.getSystemSettings(),
                AdminService.getSecurityPolicies()
            ]);

            // Mocking feedback fetch for now since AdminService doesn't have it yet
            // In real app: const feedbackData = await AdminService.getFeedback();
            const { data: feedbackData } = await (await import('../../lib/supabase')).supabase
                .from('user_feedback')
                .select('*, user_profiles(name, email)')
                .order('created_at', { ascending: false });

            setUsers(usersList);
            setStats(systemStats);
            setSyncHealth(health);
            setSettings(systemSettings);
            setPolicies(securityPolicies);
            setFeedback(feedbackData || []);
        } catch (error) {
            console.error('[Admin] Load failed:', error);
            useUIStore.getState().addNotification('Failed to load admin data', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleTierChange = async (userId, newTier) => {
        try {
            await AdminService.updateUserTier(userId, newTier);
            setUsers(users.map(u => u.id === userId ? { ...u, tier: newTier } : u));
            useUIStore.getState().addNotification('User tier updated successfully', 'success');
        } catch (error) {
            useUIStore.getState().addNotification('Failed to update tier', 'error');
        }
    };

    if (!user.is_admin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <ShieldCheck size={64} className="text-red-500 mb-4 opacity-50" />
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Access Restricted</h1>
                <p className="text-slate-500 dark:text-slate-400">You do not have administrative privileges to view this page.</p>
            </div>
        );
    }

    return (
        <div className="py-8 max-w-6xl">
            <header className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Admin Console</h1>
                    <p className="text-slate-500 dark:text-slate-400">System-wide management and performance insights.</p>
                </div>
                <button
                    onClick={loadData}
                    className="p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/10 transition-colors shadow-sm"
                >
                    <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
                </button>
            </header>

            {/* Tab Navigation */}
            <div className="flex gap-4 mb-8 p-1 bg-slate-100 dark:bg-white/5 rounded-2xl w-fit">
                {['users', 'settings', 'security', 'feedback'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={clsx(
                            "px-6 py-2 rounded-xl text-sm font-bold transition-all uppercase tracking-wider",
                            activeTab === tab
                                ? "bg-white dark:bg-slate-800 text-skin-accent shadow-sm"
                                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        )}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/60 dark:border-white/5 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-indigo-50 dark:bg-indigo-500/10 p-3 rounded-2xl text-indigo-600 dark:text-indigo-400">
                            <Users size={24} />
                        </div>
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Users</span>
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white">{stats.total_users || users.length}</div>
                </div>

                <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/60 dark:border-white/5 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-2xl text-emerald-600 dark:text-emerald-400">
                            <Activity size={24} />
                        </div>
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Ad Revenue (Est.)</span>
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white">
                        ${((users.filter(u => u.tier === 'free').length) * 0.45).toFixed(2)}
                        <span className="text-sm font-medium text-slate-400 ml-2">CPM Est.</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/60 dark:border-white/5 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-amber-50 dark:bg-amber-500/10 p-3 rounded-2xl text-amber-600 dark:text-amber-400">
                            <CreditCard size={24} />
                        </div>
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Prem. Revenue</span>
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white">
                        ${(users.filter(u => u.tier === 'premium').length * 9.99).toFixed(2)}
                        <span className="text-sm font-medium text-slate-400 ml-2">MRR</span>
                    </div>
                </div>
            </div>

            {/* Conditional Content Rendering */}
            {activeTab === 'users' && (
                <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-white/5 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Users</h2>
                        <div className="flex gap-2">
                            <div className="px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-lg text-xs font-bold text-slate-500">
                                {users.length} TOTAL
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-white/[0.02] text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Subscription</th>
                                    <th className="px-6 py-4">Dual Sync</th>
                                    <th className="px-6 py-4">Created</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                {users.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={u.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg'} className="w-10 h-10 rounded-full bg-slate-100" />
                                                <div>
                                                    <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                                                    <div className="text-xs text-slate-400">{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={u.tier}
                                                onChange={(e) => handleTierChange(u.id, e.target.value)}
                                                className="bg-transparent border-none text-sm font-bold focus:ring-0 cursor-pointer text-indigo-600 dark:text-indigo-400"
                                            >
                                                <option value="free">FREE</option>
                                                <option value="premium">PREMIUM</option>
                                                <option value="trial">TRIAL</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-1">
                                                {u.integrations?.google && <span className="w-2 h-2 rounded-full bg-blue-500" title="Google" />}
                                                {u.integrations?.outlook && <span className="w-2 h-2 rounded-full bg-indigo-600" title="Outlook" />}
                                                {u.integrations?.apple && <span className="w-2 h-2 rounded-full bg-slate-900 dark:bg-white" title="Apple" />}
                                                {!u.integrations && <span className="text-[10px] text-slate-400 font-medium italic">No active syncs</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-400">
                                            {new Date(u.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 text-slate-400 hover:text-skin-accent transition-colors opacity-0 group-hover:opacity-100">
                                                <ChevronRight size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {users.length === 0 && !isLoading && (
                        <div className="p-20 text-center">
                            <UserPlus size={48} className="mx-auto text-slate-200 dark:text-white/10 mb-4" />
                            <p className="text-slate-400">No users found in the system.</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {settings.map((setting) => (
                        <div key={setting.key} className="bg-white dark:bg-slate-900/50 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/60 dark:border-white/5 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">{setting.key.replace(/_/g, ' ')}</h3>
                                <span className="text-[10px] text-slate-400">Last updated: {new Date(setting.updated_at).toLocaleDateString()}</span>
                            </div>
                            <textarea
                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl p-4 text-sm font-mono text-slate-600 dark:text-slate-300 min-h-[120px] focus:ring-1 focus:ring-skin-accent outline-none transition-all"
                                defaultValue={JSON.stringify(setting.value, null, 2)}
                                onBlur={async (e) => {
                                    try {
                                        const newVal = JSON.parse(e.target.value);
                                        await AdminService.updateSystemSetting(setting.key, newVal);
                                        useUIStore.getState().addNotification(`Successfully updated ${setting.key}`, 'success');
                                    } catch (err) {
                                        useUIStore.getState().addNotification('Invalid JSON format', 'error');
                                    }
                                }}
                            />
                            <p className="mt-4 text-xs text-slate-400 italic font-medium">{setting.description}</p>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'security' && (
                <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-white/5 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="p-6 border-b border-slate-100 dark:border-white/5">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Active RLS Policies</h2>
                        <p className="text-sm text-slate-400 mt-1">Direct oversight of Row Level Security across the platform.</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-white/[0.02] text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Table</th>
                                    <th className="px-6 py-4">Policy Name</th>
                                    <th className="px-6 py-4">Action</th>
                                    <th className="px-6 py-4">Definition</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                {policies.map((policy, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white capitalize">{policy.tablename}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{policy.policyname}</td>
                                        <td className="px-6 py-4">
                                            <span className={clsx(
                                                "px-2 py-1 rounded text-[10px] font-black uppercase",
                                                policy.cmd === 'SELECT' ? "bg-blue-50 text-blue-600" :
                                                    policy.cmd === 'ALL' ? "bg-red-50 text-red-600" : "bg-orange-50 text-orange-600"
                                            )}>
                                                {policy.cmd}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-mono text-slate-400 max-w-sm truncate hover:whitespace-normal hover:break-all transition-all cursor-help">
                                            {policy.qual || 'No restrictions'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'feedback' && (
                <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-white/5 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="p-6 border-b border-slate-100 dark:border-white/5">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">User Feedback</h2>
                        <p className="text-sm text-slate-500 mt-1">Direct reviews and satisfaction ratings from your users.</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-white/[0.02] text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Rating</th>
                                    <th className="px-6 py-4">Comment</th>
                                    <th className="px-6 py-4 text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                {feedback.map((f) => (
                                    <tr key={f.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-slate-900 dark:text-white">{f.user_profiles?.name || 'Anonymous'}</div>
                                            <div className="text-[10px] text-slate-400">{f.user_profiles?.email || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <Star
                                                        key={star}
                                                        size={12}
                                                        className={star <= f.rating ? "text-amber-400 fill-amber-400" : "text-slate-200 dark:text-white/5"}
                                                    />
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 max-w-md">
                                            {f.comment || <span className="italic text-slate-400">No comment provided</span>}
                                        </td>
                                        <td className="px-6 py-4 text-right text-xs text-slate-400">
                                            {new Date(f.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {feedback.length === 0 && (
                        <div className="p-20 text-center">
                            <p className="text-slate-400">No feedback received yet.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default AdminPage;
