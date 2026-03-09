import React, { useState, useEffect } from 'react';
import { Users, Activity, CreditCard, ShieldCheck, ChevronRight, UserPlus, RefreshCw, Star, Settings2, Megaphone, DollarSign, Plus } from 'lucide-react';
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
    const [activeTab, setActiveTab] = useState('overview');
    const [settings, setSettings] = useState([]);
    const [policies, setPolicies] = useState([]);
    const [recentActivity, setRecentActivity] = useState([
        { id: 1, type: 'user', message: 'New user "Sarah Miller" registered', time: '10m ago', icon: <UserPlus size={14} /> },
        { id: 2, type: 'payment', message: 'Premium subscription renewed: $9.99', time: '1h ago', icon: <CreditCard size={14} /> },
        { id: 3, type: 'sync', message: 'Google Calendar sync optimized for 12 users', time: '3h ago', icon: <RefreshCw size={14} /> },
        { id: 4, type: 'security', message: 'RLS Policy "Admins can manage" triggered', time: '5h ago', icon: <ShieldCheck size={14} /> },
    ]);

    const [adConfig, setAdConfig] = useState({
        sidebar_enabled: true,
        inline_enabled: false,
        affiliate_links: [
            'https://amazon.com/?tag=mysec-20',
            'https://shareasale.com/r.cfm?b=12345',
            'https://partnernetwork.ebay.com/'
        ]
    });
    const [isSavingAdConfig, setIsSavingAdConfig] = useState(false);

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

            const adConf = systemSettings.find(s => s.key === 'ad_configuration');
            if (adConf && adConf.value) {
                setAdConfig(adConf.value);
            }
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

    const handleSaveAdConfig = async () => {
        setIsSavingAdConfig(true);
        try {
            await AdminService.updateSystemSetting('ad_configuration', adConfig);
            useUIStore.getState().addNotification('Ad configuration saved successfully', 'success');
        } catch (error) {
            useUIStore.getState().addNotification('Failed to save ad configuration', 'error');
        } finally {
            setIsSavingAdConfig(false);
        }
    };

    if (!user.is_admin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
                <ShieldCheck size={64} className="text-red-500 mb-4 opacity-50 shadow-2xl shadow-red-500/20 rounded-full p-2" />
                <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tighter italic">Access <span className="text-red-500">Restricted</span></h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">System oversight is exclusively reserved for Level 10 Administrators.</p>

                <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 max-w-sm w-full space-y-3">
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-bold uppercase">Identity</span>
                        <span className="text-slate-900 dark:text-white font-mono">{user.email || 'Anonymous'}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-bold uppercase">Admin Privileges</span>
                        <span className={user.is_admin ? "text-emerald-500 font-black" : "text-red-500 font-black"}>
                            {user.is_admin ? 'ENABLED' : 'DISABLED'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-bold uppercase">Database State</span>
                        <span className="text-slate-500">Sync Pending</span>
                    </div>
                </div>

                <button
                    onClick={() => window.location.reload()}
                    className="mt-8 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all active:scale-95 shadow-xl"
                >
                    <RefreshCw size={18} />
                    <span>Synchronize Profile</span>
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-skin-accent flex items-center justify-center text-white shadow-lg shadow-skin-accent/20">
                            <ShieldCheck size={20} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight italic">Matrix<span className="text-skin-accent">Admin</span></h1>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Secretary Ecosystem Management & Global Oversight</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center px-4 py-2 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5">
                        <Activity size={16} className="text-emerald-500 mr-2" />
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">SYSTEM: STABLE</span>
                    </div>
                    <button
                        onClick={loadData}
                        className="p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-sm hover:scale-105 active:scale-95"
                        title="Refresh Data"
                    >
                        <RefreshCw size={20} className={isLoading ? 'animate-spin text-skin-accent' : 'text-slate-600 dark:text-slate-400'} />
                    </button>
                    <button className="flex items-center gap-2 px-5 py-3 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold text-sm shadow-xl shadow-slate-900/10 dark:shadow-white/5 hover:opacity-90 transition-all">
                        <Plus size={18} />
                        <span>System Action</span>
                    </button>
                </div>
            </header>

            {/* Matrix-Style Mega Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-10">
                {[
                    { id: 'overview', label: 'Dashboard', icon: <Activity />, color: 'bg-blue-500' },
                    { id: 'users', label: 'Users', icon: <Users />, color: 'bg-emerald-500' },
                    { id: 'monetization', label: 'Revenue', icon: <DollarSign />, color: 'bg-amber-500' },
                    { id: 'settings', label: 'Settings', icon: <Settings2 />, color: 'bg-indigo-500' },
                    { id: 'security', label: 'Security', icon: <ShieldCheck />, color: 'bg-rose-500' },
                    { id: 'feedback', label: 'Feedback', icon: <Star />, color: 'bg-violet-500' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={clsx(
                            "flex flex-col items-center justify-center p-6 rounded-3xl transition-all border group",
                            activeTab === tab.id
                                ? `bg-white dark:bg-slate-800 border-transparent shadow-xl ring-2 ring-${tab.id === 'monetization' ? 'amber' : tab.id === 'users' ? 'emerald' : 'skin-accent'}/20`
                                : "bg-slate-50/50 dark:bg-white/[0.02] border-slate-200/50 dark:border-white/5 hover:bg-white dark:hover:bg-white/[0.05]"
                        )}
                    >
                        <div className={clsx(
                            "w-12 h-12 rounded-2xl flex items-center justify-center mb-3 text-white transition-transform group-hover:scale-110",
                            tab.color
                        )}>
                            {tab.icon}
                        </div>
                        <span className={clsx(
                            "text-xs font-black uppercase tracking-widest",
                            activeTab === tab.id ? "text-slate-900 dark:text-white" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                        )}>
                            {tab.label}
                        </span>
                    </button>
                ))}
            </div>

            {/* Conditional Content Rendering */}
            {
                activeTab === 'overview' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Site Analysis Chart (mimics reference) */}
                            <div className="lg:col-span-2 bg-white dark:bg-slate-900/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-200/60 dark:border-white/5 shadow-sm">
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white">System Analysis</h3>
                                        <p className="text-sm text-slate-400 font-medium">Real-time engagement & sync health monitoring</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-500/10 rounded-full">
                                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">Users</span>
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 rounded-full">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Growth</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Hero SVG Chart */}
                                <div className="relative h-64 w-full">
                                    <svg viewBox="0 0 800 200" className="w-full h-full drop-shadow-lg">
                                        <defs>
                                            <linearGradient id="gradient-blue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                                                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                                            </linearGradient>
                                            <linearGradient id="gradient-green" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                                                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>

                                        {/* Grid Lines */}
                                        {[0, 50, 100, 150].map((y) => (
                                            <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="currentColor" strokeOpacity="0.05" className="text-slate-400" />
                                        ))}

                                        {/* Line 1: Blue (Users) */}
                                        <path
                                            d="M0,150 Q100,20 200,80 T400,120 T600,40 T800,100"
                                            fill="none"
                                            stroke="#3b82f6"
                                            strokeWidth="4"
                                            strokeLinecap="round"
                                            className="animate-[dash_3s_ease-in-out_infinite]"
                                        />
                                        <path
                                            d="M0,150 Q100,20 200,80 T400,120 T600,40 T800,100 L800,200 L0,200 Z"
                                            fill="url(#gradient-blue)"
                                        />

                                        {/* Line 2: Green (Growth) */}
                                        <path
                                            d="M0,100 Q150,180 300,60 T500,40 T800,90"
                                            fill="none"
                                            stroke="#10b981"
                                            strokeWidth="4"
                                            strokeLinecap="round"
                                            strokeDasharray="8 8"
                                        />
                                        <path
                                            d="M0,100 Q150,180 300,60 T500,40 T800,90 L800,200 L0,200 Z"
                                            fill="url(#gradient-green)"
                                        />
                                    </svg>

                                    <div className="absolute inset-0 flex items-center justify-between px-2 text-[10px] font-bold text-slate-300 pointer-events-none uppercase tracking-widest mt-60">
                                        <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Stats Column (mimics reference right sidebar) */}
                            <div className="space-y-4">
                                {[
                                    { label: 'Total Users', value: stats.total_users || users.length, icon: <Users size={16} />, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                                    { label: 'Premium Users', value: users.filter(u => u.tier === 'premium').length, icon: <Star size={16} />, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                                    { label: 'Pending Feedback', value: feedback.length, icon: <Star size={16} />, color: 'text-violet-500', bg: 'bg-violet-500/10' },
                                    { label: 'Active Syncs', value: syncHealth.total || 0, icon: <RefreshCw size={16} />, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                                ].map((s, i) => (
                                    <div key={i} className="flex items-center justify-between p-5 bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-white/5 shadow-sm transform transition-all hover:translate-x-1">
                                        <div className="flex items-center gap-4">
                                            <div className={clsx("w-10 h-10 rounded-2xl flex items-center justify-center", s.bg, s.color)}>
                                                {s.icon}
                                            </div>
                                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{s.label}</span>
                                        </div>
                                        <span className="text-xl font-black text-slate-900 dark:text-white">{s.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Latest Activity (Replacement for reference "Latest Posts") */}
                            <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-200/60 dark:border-white/5 shadow-sm">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">Live Activity Audit</h3>
                                <div className="space-y-6">
                                    {recentActivity.map((act) => (
                                        <div key={act.id} className="flex gap-4 group">
                                            <div className="flex flex-col items-center">
                                                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-skin-accent transition-colors">
                                                    {act.icon}
                                                </div>
                                                <div className="w-px h-full bg-slate-100 dark:bg-white/5 mt-2" />
                                            </div>
                                            <div className="pb-6">
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{act.message}</p>
                                                <span className="text-xs text-slate-400 font-medium">{act.time}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Sync Health Dashboard */}
                            <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-200/60 dark:border-white/5 shadow-sm">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">Global Sync Integrity</h3>
                                <div className="flex items-center justify-center mb-10">
                                    <div className="relative w-48 h-48">
                                        <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                                            <path
                                                className="text-slate-100 dark:text-white/5"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                                fill="none"
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            />
                                            <path
                                                className="text-emerald-500"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                                strokeDasharray={`${(syncHealth.healthy / (syncHealth.total || 1)) * 100}, 100`}
                                                strokeLinecap="round"
                                                fill="none"
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-4xl font-black text-slate-900 dark:text-white">
                                                {Math.round((syncHealth.healthy / (syncHealth.total || 1)) * 100)}%
                                            </span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Healthy</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl text-center">
                                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total Streams</p>
                                        <p className="text-xl font-black text-slate-900 dark:text-white">{syncHealth.total}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl text-center">
                                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Latency (avg)</p>
                                        <p className="text-xl font-black text-slate-900 dark:text-white">42ms</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                activeTab === 'users' && (
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
                )
            }

            {
                activeTab === 'settings' && (
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
                )
            }

            {
                activeTab === 'security' && (
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
                )
            }

            {
                activeTab === 'feedback' && (
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
                )
            }

            {
                activeTab === 'monetization' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                        {/* Ads & Affiliates Control */}
                        <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-white/5 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center gap-3">
                                <Megaphone className="text-emerald-500" size={24} />
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Ads & Affiliate Network</h2>
                                    <p className="text-sm text-slate-500 mt-1">Configure the ad banners served to free tier users.</p>
                                </div>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl cursor-pointer">
                                        <div>
                                            <div className="font-bold text-slate-900 dark:text-white">Enable Sidebar Banner</div>
                                            <div className="text-xs text-slate-500">Show native affiliate banner in the left navigation</div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={adConfig.sidebar_enabled}
                                            onChange={(e) => setAdConfig({ ...adConfig, sidebar_enabled: e.target.checked })}
                                            className="w-5 h-5 rounded text-skin-accent focus:ring-skin-accent bg-slate-100 border-slate-300"
                                        />
                                    </label>
                                    <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl cursor-pointer">
                                        <div>
                                            <div className="font-bold text-slate-900 dark:text-white">Enable In-Line App Ads</div>
                                            <div className="text-xs text-slate-500">Show Google AdSense inside dashboard feeds</div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={adConfig.inline_enabled}
                                            onChange={(e) => setAdConfig({ ...adConfig, inline_enabled: e.target.checked })}
                                            className="w-5 h-5 rounded text-skin-accent focus:ring-skin-accent bg-slate-100 border-slate-300"
                                        />
                                    </label>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Affiliate Links (One per line)</label>
                                        <textarea
                                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-skin-accent outline-none text-slate-900 dark:text-white transition-all h-28 resize-none font-mono"
                                            placeholder="https://amazon.com/?tag=mysec-20&#10;https://shareasale.com/..."
                                            value={(adConfig.affiliate_links || []).join('\n')}
                                            onChange={(e) => setAdConfig({ ...adConfig, affiliate_links: e.target.value.split('\n') })}
                                        />
                                        <p className="text-[10px] text-slate-400 mt-2">The system will randomly rotate through these links in ad placements.</p>
                                    </div>
                                    <button
                                        onClick={handleSaveAdConfig}
                                        disabled={isSavingAdConfig}
                                        className="w-full bg-slate-900 dark:bg-white text-white dark:text-black font-bold py-3 rounded-xl hover:opacity-90 transition-opacity flex justify-center items-center gap-2"
                                    >
                                        {isSavingAdConfig && <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />}
                                        <span>{isSavingAdConfig ? 'Saving...' : 'Save Ad Configuration'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Subscription Pricing */}
                        <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-white/5 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center gap-3">
                                <DollarSign className="text-skin-accent" size={24} />
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Premium Subscriptions</h2>
                                    <p className="text-sm text-slate-500 mt-1">Manage pricing tiers and Stripe integration.</p>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row gap-6 mb-6">
                                    <div className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4">
                                            <span className="bg-skin-accent/10 text-skin-accent text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md">Live</span>
                                        </div>
                                        <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">Monthly Premium</h3>
                                        <div className="text-4xl font-black text-slate-900 dark:text-white mb-4">$5.00<span className="text-sm text-slate-400 font-normal">/mo</span></div>
                                        <div className="space-y-2 mb-6">
                                            <div className="text-xs text-slate-500 font-medium">Stripe Price ID: <code className="bg-slate-200 dark:bg-white/10 px-1 rounded">price_1T71fDHCuFYSkqce9H96ZrlR</code></div>
                                            <div className="text-xs text-slate-500 font-medium">Features: Ad-Free, AI Planning, Unlimited Sync</div>
                                        </div>
                                        <button className="w-full border border-slate-300 dark:border-white/20 text-slate-700 dark:text-white font-bold py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-sm">
                                            Edit Price Plan
                                        </button>
                                    </div>

                                    <div className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center opacity-70 group hover:opacity-100 transition-opacity cursor-pointer">
                                        <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center mb-3 group-hover:bg-skin-accent group-hover:text-white transition-colors">
                                            <Plus size={24} />
                                        </div>
                                        <h3 className="font-bold text-slate-900 dark:text-white">Add Yearly Plan</h3>
                                        <p className="text-xs text-slate-500 max-w-[200px] mt-1">Offer a discount for annual billing to increase retention.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}

export default AdminPage;
