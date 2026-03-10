import React, { useState, useEffect } from 'react';
import {
    Users, Activity, CreditCard, ShieldCheck, ChevronRight, UserPlus,
    RefreshCw, Star, Settings2, Megaphone, DollarSign, Plus, Eye,
    Zap, Layout, Bell, Terminal, ShieldAlert, Cpu, Globe, Trash2, Mail
} from 'lucide-react';
import useStore from '../../store/useStore';
import AdminService from '../../services/AdminService';
import { useUIStore } from '../../store/useUIStore';
import clsx from 'clsx';

/**
 * AdminPage - Total Ecosystem Control Center
 * The "Secretary of State" dashboard for the creator.
 */
function AdminPage() {
    const { user, enterGhostMode } = useStore();
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({
        total_users: 0,
        active_syncs: 0,
        premium_conversions: 0,
        mrr: 0,
        growth_rate: 0,
        churn_risk: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [syncHealth, setSyncHealth] = useState({ total: 0, healthy: 0 });
    const [feedback, setFeedback] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [settings, setSettings] = useState([]);
    const [policies, setPolicies] = useState([]);
    const [aiLogs, setAiLogs] = useState([]);
    const [broadcasts, setBroadcasts] = useState([]);

    // Broadcast Form State
    const [newBroadcast, setNewBroadcast] = useState({ title: '', content: '', type: 'info', target_tier: 'all' });
    const [isBroadcasting, setIsBroadcasting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [
                usersList, systemStats, health, systemSettings,
                securityPolicies, revenue, logs
            ] = await Promise.all([
                AdminService.listUsers(),
                AdminService.getSystemStats(),
                AdminService.getSyncHealth(),
                AdminService.getSystemSettings(),
                AdminService.getSecurityPolicies(),
                AdminService.getRevenueAnalytics(),
                AdminService.getAIAuditLogs(20)
            ]);

            // Mocking feedback fetch
            const { data: feedbackData } = await (await import('../../lib/supabase')).supabase
                .from('user_feedback')
                .select('*, user_profiles(name, email)')
                .order('created_at', { ascending: false });

            setUsers(usersList);
            setStats({ ...systemStats, ...revenue });
            setSyncHealth(health);
            setSettings(systemSettings);
            setPolicies(securityPolicies);
            setFeedback(feedbackData || []);
            setAiLogs(logs || []);
        } catch (error) {
            console.error('[Admin] Global Load failed:', error);
            useUIStore.getState().addNotification('Failed to synchronize command center data', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdatePermissions = async (userId, key, currentVal) => {
        const currentUser = users.find(u => u.id === userId);
        const newPerms = {
            ...(currentUser.admin_permissions || {}),
            [key]: !currentVal
        };

        try {
            await AdminService.updateAdminPermissions(userId, newPerms);
            setUsers(users.map(u => u.id === userId ? { ...u, admin_permissions: newPerms, is_admin: Object.values(newPerms).some(v => v === true) } : u));
            useUIStore.getState().addNotification('Administrative scope adjusted', 'success');
        } catch (err) {
            useUIStore.getState().addNotification('Failed to adjust permissions', 'error');
        }
    };

    const handleSendBroadcast = async () => {
        if (!newBroadcast.title || !newBroadcast.content) return;
        setIsBroadcasting(true);
        try {
            await AdminService.sendBroadcast(newBroadcast);
            useUIStore.getState().addNotification('Global broadcast transmission successful', 'success');
            setNewBroadcast({ title: '', content: '', type: 'info', target_tier: 'all' });
            // In a real app we'd fetch the list of broadcasts here
        } catch (err) {
            useUIStore.getState().addNotification('Broadcast transmission failed', 'error');
        } finally {
            setIsBroadcasting(false);
        }
    };

    const handleImpersonate = (targetUser) => {
        if (window.confirm(`Initiate Ghost Mode for ${targetUser.email}? \n\nYou will see the app exactly as they do.`)) {
            enterGhostMode(targetUser);
            window.location.href = '/';
        }
    };

    if (!user.is_admin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
                <ShieldAlert size={64} className="text-rose-500 mb-4 animate-pulse drop-shadow-[0_0_15px_rgba(244,63,94,0.3)]" />
                <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tighter italic">Ecosystem <span className="text-rose-500">Restricted</span></h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">Access requires verified Level 10 Clearance credentials.</p>

                <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 max-w-sm w-full space-y-3">
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-bold uppercase">Subject</span>
                        <span className="text-slate-900 dark:text-white font-mono">{user.email || 'Anonymous'}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-bold uppercase">Clearance</span>
                        <span className={user.is_admin ? "text-emerald-500 font-black" : "text-rose-500 font-black"}>
                            {user.is_admin ? 'VERIFIED' : 'DENIED'}
                        </span>
                    </div>
                </div>

                <button
                    onClick={() => window.location.reload()}
                    className="mt-8 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all hover:scale-105"
                >
                    <RefreshCw size={18} />
                    <span>Synchronize Credentials</span>
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-black shadow-2xl">
                            <ShieldCheck size={24} />
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">Command<span className="text-skin-accent">Center</span></h1>
                    </div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">Global Ecosystem Oversight • v4.0.0</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-2xl">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Global Sync: Active</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-4 py-2 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-2xl">
                        <Globe size={12} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Nodes: 12 Online</span>
                    </div>
                    <button
                        onClick={loadData}
                        className="p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-sm hover:scale-110 active:scale-90"
                    >
                        <RefreshCw size={20} className={isLoading ? 'animate-spin text-skin-accent' : 'text-slate-600 dark:text-slate-400'} />
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-skin-accent text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-skin-accent/20 hover:opacity-90 transition-all">
                        <Plus size={18} />
                        <span>Manual Override</span>
                    </button>
                </div>
            </header>

            {/* Futuristic Mega Tabs */}
            <nav className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-10">
                {[
                    { id: 'overview', label: 'Monitor', icon: <Activity />, color: 'bg-blue-500', group: 'System' },
                    { id: 'users', label: 'Identity', icon: <Users />, color: 'bg-emerald-500', group: 'Society' },
                    { id: 'monetization', label: 'Revenue', icon: <DollarSign />, color: 'bg-amber-500', group: 'Economy' },
                    { id: 'broadcast', label: 'Broadcast', icon: <Megaphone />, color: 'bg-rose-500', group: 'Comms' },
                    { id: 'ai_lab', label: 'AI Lab', icon: <Cpu />, color: 'bg-indigo-500', group: 'Neural' },
                    { id: 'interface', label: 'Interface', icon: <Layout />, color: 'bg-violet-500', group: 'Visuals' },
                    { id: 'security', label: 'Security', icon: <ShieldCheck />, color: 'bg-slate-700', group: 'Core' },
                    { id: 'feedback', label: 'Feedback', icon: <Star />, color: 'bg-teal-500', group: 'Users' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={clsx(
                            "group flex flex-col items-start p-5 rounded-[2rem] transition-all border relative overflow-hidden",
                            activeTab === tab.id
                                ? "bg-white dark:bg-slate-800 border-transparent shadow-2xl ring-2 ring-skin-accent/20"
                                : "bg-slate-50/50 dark:bg-white/[0.02] border-slate-200/50 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20"
                        )}
                    >
                        <div className={clsx(
                            "w-10 h-10 rounded-2xl flex items-center justify-center mb-4 text-white shadow-lg transition-transform group-hover:scale-110",
                            tab.color
                        )}>
                            {tab.icon}
                        </div>
                        <div className="relative z-10">
                            <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{tab.group}</span>
                            <span className={clsx(
                                "text-sm font-black uppercase tracking-tight",
                                activeTab === tab.id ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"
                            )}>
                                {tab.label}
                            </span>
                        </div>
                    </button>
                ))}
            </nav>

            {/* Core Content Engine */}
            <main className="min-h-[600px]">
                {activeTab === 'overview' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: 'Monthly Revenue', value: `$${stats.mrr.toLocaleString()}`, change: `+${stats.growth_rate}%`, icon: <DollarSign />, color: 'bg-emerald-500' },
                                { label: 'Total Subjects', value: stats.total_users, change: '+124 today', icon: <Users />, color: 'bg-blue-500' },
                                { label: 'Reasoning Health', value: '98.4%', change: '-0.2% latency', icon: <Zap />, color: 'bg-amber-500' },
                                { label: 'Churn Probability', value: `${stats.churn_risk}%`, change: 'Optimal', icon: <Activity />, color: 'bg-rose-500' }
                            ].map((s, i) => (
                                <div key={i} className="bg-white dark:bg-slate-900/50 backdrop-blur-xl p-6 rounded-[2.5rem] border border-slate-200/60 dark:border-white/10 shadow-sm relative overflow-hidden group">
                                    <div className={clsx("absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-5 transition-transform group-hover:scale-110", s.color)} />
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={clsx("w-10 h-10 rounded-2xl flex items-center justify-center text-white", s.color)}>
                                            {s.icon}
                                        </div>
                                        <span className={clsx("text-[10px] font-black px-2 py-1 rounded-full", s.color.replace('bg-', 'bg-') + '/10', s.color.replace('bg-', 'text-'))}>
                                            {s.change}
                                        </span>
                                    </div>
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</h3>
                                    <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">{s.value}</p>
                                </div>
                            ))} section
                        </section>

                        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 bg-white dark:bg-slate-900/50 backdrop-blur-3xl p-8 rounded-[3rem] border border-slate-200/60 dark:border-white/10">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                                    <Activity className="text-blue-500" />
                                    <span>Ecosystem Performance Analysis</span>
                                </h3>
                                <div className="h-[300px] w-full flex items-end justify-between gap-2 px-4">
                                    {[65, 45, 75, 55, 90, 85, 96, 78, 88, 72, 60, 85].map((h, i) => (
                                        <div key={i} className="flex-1 group relative">
                                            <div
                                                className="w-full bg-gradient-to-t from-blue-500/20 to-blue-500 rounded-2xl transition-all hover:scale-x-110 hover:brightness-125 cursor-pointer shadow-lg shadow-blue-500/10"
                                                style={{ height: `${h}%` }}
                                            />
                                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] font-black text-slate-400 uppercase">
                                                {['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][i]}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-900/50 backdrop-blur-3xl p-8 rounded-[3rem] border border-slate-200/60 dark:border-white/10">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                                    <Terminal className="text-indigo-500" />
                                    <span>Sync Integrity</span>
                                </h3>
                                <div className="space-y-6">
                                    {[
                                        { label: 'Google Calendar API', status: 'Healthy', latency: '42ms', color: 'bg-emerald-500' },
                                        { label: 'Microsoft Graph', status: 'Degraded', latency: '215ms', color: 'bg-amber-500' },
                                        { label: 'OpenAI Reasoning', status: 'Healthy', latency: '850ms', color: 'bg-emerald-500' },
                                        { label: 'Supabase DB', status: 'Healthy', latency: '12ms', color: 'bg-emerald-500' }
                                    ].map((s, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-slate-100 dark:border-white/5">
                                            <div>
                                                <p className="text-sm font-black text-slate-700 dark:text-slate-200">{s.label}</p>
                                                <p className="text-[10px] font-bold text-slate-400 tracking-wider">LATENCY: {s.latency}</p>
                                            </div>
                                            <span className={clsx("px-2 py-1 rounded-full text-[8px] font-black uppercase text-white shadow-lg", s.color)}>
                                                {s.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-[3rem] border border-slate-200/60 dark:border-white/5 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="p-10 border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Identity Management</h2>
                                <p className="text-sm text-slate-500 font-medium">Control subjects, adjust clearance, and manage administrative scopes.</p>
                            </div>
                            <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200/50 dark:border-white/5">
                                <div className="px-6 py-3 font-black text-xs uppercase tracking-widest text-slate-500">
                                    {users.filter(u => u.is_admin).length} Admins
                                </div>
                                <div className="px-6 py-3 font-black text-xs uppercase tracking-widest text-slate-900 dark:text-white bg-white dark:bg-white/10 rounded-xl shadow-lg">
                                    {users.length} Total
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto p-4">
                            <table className="w-full text-left border-separate border-spacing-y-3">
                                <thead className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                    <tr>
                                        <th className="px-8 py-4">Subject Information</th>
                                        <th className="px-6 py-4">Tier Status</th>
                                        <th className="px-6 py-4">Admin Privileges / Scopes</th>
                                        <th className="px-6 py-4 text-right">Operational Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u) => (
                                        <tr key={u.id} className="bg-slate-50 dark:bg-white/[0.02] hover:bg-white dark:hover:bg-white/5 transition-all group rounded-2xl shadow-sm">
                                            <td className="px-8 py-5 rounded-l-[2rem]">
                                                <div className="flex items-center gap-5">
                                                    <div className="relative">
                                                        <img src={u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`} className="w-14 h-14 rounded-[1.5rem] bg-slate-200 shadow-xl" />
                                                        {u.is_admin && <div className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-lg flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-lg"><ShieldCheck size={10} strokeWidth={3} /></div>}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-lg text-slate-900 dark:text-white tracking-tight leading-none mb-1">{u.name}</div>
                                                        <div className="text-xs text-slate-400 font-bold font-mono tracking-tighter">{u.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={clsx(
                                                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm",
                                                    u.tier === 'premium' ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" : "bg-slate-500/10 text-slate-500 border border-slate-500/20"
                                                )}>
                                                    {u.tier}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-wrap gap-2 max-w-sm">
                                                    {[
                                                        { key: 'manage_users', label: 'Users', color: 'bg-emerald-500' },
                                                        { key: 'manage_billing', label: 'Billing', color: 'bg-amber-500' },
                                                        { key: 'manage_system', label: 'System', color: 'bg-blue-500' },
                                                        { key: 'manage_content', label: 'Content', color: 'bg-rose-500' }
                                                    ].map(perm => (
                                                        <button
                                                            key={perm.key}
                                                            onClick={() => handleUpdatePermissions(u.id, perm.key, u.admin_permissions?.[perm.key])}
                                                            className={clsx(
                                                                "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95",
                                                                u.admin_permissions?.[perm.key]
                                                                    ? `${perm.color} text-white shadow-lg`
                                                                    : "bg-slate-100 dark:bg-white/5 text-slate-400 grayscale border border-slate-200 dark:border-white/5"
                                                            )}
                                                        >
                                                            {perm.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right rounded-r-[2rem]">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleImpersonate(u)}
                                                        className="p-3 bg-blue-500 text-white rounded-2xl shadow-xl shadow-blue-500/10 hover:brightness-110 active:scale-90 flex items-center gap-2"
                                                        title="Ghost Mode"
                                                    >
                                                        <Eye size={16} strokeWidth={3} />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Ghost</span>
                                                    </button>
                                                    <button className="p-3 bg-white dark:bg-white/10 text-slate-400 hover:text-rose-500 rounded-2xl shadow-sm active:scale-90 border border-slate-200/50 dark:border-white/5">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'broadcast' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {/* Composer */}
                        <div className="lg:col-span-2 bg-white dark:bg-slate-900/50 backdrop-blur-3xl p-10 rounded-[3rem] border border-slate-200/60 dark:border-white/10 shadow-2xl">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-4 italic italic tracking-tight">
                                <Megaphone size={32} className="text-rose-500" />
                                <span>Global Terminal Broadcast</span>
                            </h3>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Transmission Alert Level</label>
                                        <div className="flex gap-2">
                                            {['info', 'warning', 'promo', 'critical'].map(t => (
                                                <button
                                                    key={t}
                                                    onClick={() => setNewBroadcast({ ...newBroadcast, type: t })}
                                                    className={clsx(
                                                        "flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                        newBroadcast.type === t
                                                            ? "bg-rose-500 text-white shadow-xl shadow-rose-500/20"
                                                            : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/5"
                                                    )}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Audience Segment</label>
                                        <select
                                            value={newBroadcast.target_tier}
                                            onChange={(e) => setNewBroadcast({ ...newBroadcast, target_tier: e.target.value })}
                                            className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-3 px-4 font-black text-xs uppercase text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-rose-500/50"
                                        >
                                            <option value="all">Global Population (ALL)</option>
                                            <option value="free">Standard Subjects (FREE)</option>
                                            <option value="premium">Elite Subjects (PREMIUM)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Transmission Title</label>
                                    <input
                                        type="text"
                                        placeholder="Enter headline..."
                                        value={newBroadcast.title}
                                        onChange={(e) => setNewBroadcast({ ...newBroadcast, title: e.target.value })}
                                        className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 px-6 font-bold text-lg text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500/50"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Message Payload</label>
                                    <textarea
                                        placeholder="Compose your transmission..."
                                        rows={6}
                                        value={newBroadcast.content}
                                        onChange={(e) => setNewBroadcast({ ...newBroadcast, content: e.target.value })}
                                        className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl py-4 px-6 font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-rose-500/50 resize-none"
                                    />
                                </div>

                                <button
                                    onClick={handleSendBroadcast}
                                    disabled={isBroadcasting || !newBroadcast.title || !newBroadcast.content}
                                    className="w-full py-5 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-sm shadow-2xl shadow-rose-500/30 transition-all flex items-center justify-center gap-3 active:scale-95"
                                >
                                    {isBroadcasting ? <RefreshCw className="animate-spin" /> : <Zap size={20} fill="white" />}
                                    <span>Initiate Global Broadcast</span>
                                </button>
                            </div>
                        </div>

                        {/* Recent History */}
                        <div className="bg-white dark:bg-slate-900/50 backdrop-blur-3xl p-8 rounded-[3rem] border border-slate-200/60 dark:border-white/10">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight">Broadcast Archives</h3>
                            <div className="space-y-4">
                                {broadcasts.length === 0 ? (
                                    <div className="py-20 text-center space-y-4 opacity-30">
                                        <Bell size={48} className="mx-auto" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">No previous transmissions</p>
                                    </div>
                                ) : (
                                    broadcasts.map((b, i) => <div key={i}>{/* list items */}</div>)
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'interface' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="bg-white dark:bg-slate-900/50 backdrop-blur-3xl p-10 rounded-[3rem] border border-slate-200/60 dark:border-white/10">
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-2">Interface Engine</h3>
                                    <p className="text-sm text-slate-400 font-medium">Overhaul the digital fabric. Adjust placement, colors, and global content tokens.</p>
                                </div>
                                <button className="px-6 py-3 bg-white dark:bg-white/10 text-slate-700 dark:text-white border border-slate-200 dark:border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:brightness-110 shadow-lg">
                                    Restore Originals
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Global Visual Tokens</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            {[
                                                { label: 'Primary Accent', value: '#6366f1', type: 'color' },
                                                { label: 'System Surface', value: '#ffffff', type: 'color' },
                                                { label: 'Border Radius', value: '2.5rem', type: 'text' },
                                                { label: 'Font Matrix', value: 'Outfit, Inter', type: 'text' }
                                            ].map((t, i) => (
                                                <div key={i} className="p-4 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-slate-100 dark:border-white/5">
                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.label}</p>
                                                    <div className="flex items-center gap-3">
                                                        {t.type === 'color' && <div className="w-8 h-8 rounded-lg shadow-inner" style={{ backgroundColor: t.value }} />}
                                                        <input type="text" defaultValue={t.value} className="bg-transparent border-none font-mono text-xs font-bold text-slate-600 dark:text-slate-200 focus:ring-0 p-0" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4 p-6 bg-indigo-500/5 rounded-[2rem] border border-indigo-500/10">
                                        <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Layout Sequence Config</h4>
                                        <div className="space-y-3">
                                            {[
                                                { feature: 'Ecosystem Status Header', enabled: true },
                                                { feature: 'Neural Reasoning Flow', enabled: true },
                                                { feature: 'Revenue Analytics Beta', enabled: false },
                                                { feature: 'Legacy Task List', enabled: false },
                                            ].map((f, i) => (
                                                <div key={i} className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{f.feature}</span>
                                                    <div className={clsx("w-10 h-5 rounded-full p-1 cursor-pointer transition-colors", f.enabled ? "bg-indigo-500" : "bg-slate-300 dark:bg-white/10")}>
                                                        <div className={clsx("w-3 h-3 bg-white rounded-full transition-transform", f.enabled ? "translate-x-5" : "translate-x-0")} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Configuration Payload (JSON)</h4>
                                    <div className="bg-slate-900 rounded-[2rem] p-6 font-mono text-xs text-emerald-400 overflow-hidden shadow-2xl h-full border border-white/5">
                                        <pre className="overflow-auto max-h-[400px]">
                                            {`{
  "ecosystem": "secretary-v4",
  "placement": {
    "header": "fixed",
    "sidebar": "glassmorphic",
    "dashboard": [
      "status",
      "analytics",
      "neural_flow"
    ]
  },
  "typography": {
    "headings": "Outfit",
    "body": "Inter",
    "mono": "Space Mono"
  },
  "interactions": {
    "hover_scales": true,
    "magnetic_buttons": true,
    "transitions": "700ms cubic-bezier"
  }
}`}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'ai_lab' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white dark:bg-slate-900/50 backdrop-blur-3xl p-10 rounded-[3rem] border border-slate-200/60 dark:border-white/10 shadow-2xl overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-8 opacity-10"><Cpu size={120} /></div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase italic tracking-tighter">Neural Engine Audit</h3>
                                <p className="text-sm text-slate-400 font-medium mb-10">Monitor the collective reasoning performance and NLP success across the population.</p>

                                <div className="space-y-8">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="p-6 bg-indigo-500/5 rounded-[2rem] border border-indigo-500/10">
                                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Reasoning Success</p>
                                            <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">99.2%</p>
                                        </div>
                                        <div className="p-6 bg-violet-500/5 rounded-[2rem] border border-violet-500/10">
                                            <p className="text-[10px] font-black text-violet-500 uppercase tracking-widest mb-1">Avg. Tokens / Goal</p>
                                            <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">482</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-time Reasoning Stream</h4>
                                        <div className="space-y-3">
                                            {aiLogs.length === 0 ? (
                                                <p className="text-xs text-slate-400 italic py-10 border border-dashed rounded-[2rem] text-center border-slate-200 dark:border-white/10">No logs captured in current sequence.</p>
                                            ) : (
                                                aiLogs.map((log, i) => (
                                                    <div key={i} className="flex items-center gap-4 bg-slate-50 dark:bg-white/[0.03] p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                                                        <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-black text-slate-700 dark:text-slate-200 truncate">{log.input_text}</p>
                                                            <p className="text-[8px] font-bold text-slate-400 tracking-widest uppercase">{log.user_profiles?.email} • {log.latency}ms</p>
                                                        </div>
                                                        <div className="text-[10px] font-black text-indigo-500 px-2 py-1 bg-indigo-500/10 rounded-lg">
                                                            {log.type}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-900/50 backdrop-blur-3xl p-10 rounded-[3rem] border border-slate-200/60 dark:border-white/10 shadow-2xl">
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase italic tracking-tighter">Neural Training Tokens</h3>
                                <p className="text-sm text-slate-400 font-medium mb-10">Configure global reasoning behavior and system prompts.</p>

                                <div className="space-y-6">
                                    <div className="p-6 bg-slate-50 dark:bg-white/[0.03] rounded-[2rem] border border-slate-100 dark:border-white/5">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Reasoning Prompt</h4>
                                            <button className="text-[10px] font-black text-indigo-500 hover:scale-110 active:scale-95 transition-all">EDIT</button>
                                        </div>
                                        <p className="text-xs font-medium text-slate-500 line-clamp-4 leading-relaxed italic">
                                            "You are the Secretary Assistant Reasoning Engine. Your primary objective is to decompose complex human intent into actionable architectural sequences. Maintain a premium, executive tone..."
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Model Selection</h4>
                                        <div className="grid grid-cols-1 gap-3">
                                            {[
                                                { name: 'Gemini 2.0 Flash', active: true, desc: 'High performance, low latency' },
                                                { name: 'Gemini 1.5 Pro', active: false, desc: 'Deep reasoning, complex planning' },
                                                { name: 'GPT-4o Integration', active: false, desc: 'External fallback infrastructure' }
                                            ].map((m, i) => (
                                                <div key={i} className={clsx(
                                                    "p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group",
                                                    m.active ? "bg-indigo-500 border-transparent shadow-lg" : "bg-white dark:bg-white/[0.03] border-slate-100 dark:border-white/10"
                                                )}>
                                                    <div>
                                                        <p className={clsx("text-xs font-black uppercase tracking-widest", m.active ? "text-white" : "text-slate-700 dark:text-slate-200")}>{m.name}</p>
                                                        <p className={clsx("text-[10px] font-medium", m.active ? "text-indigo-100" : "text-slate-400")}>{m.desc}</p>
                                                    </div>
                                                    {m.active && <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-indigo-500 shadow-md"><ShieldCheck size={14} strokeWidth={3} /></div>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <footer className="mt-20 py-10 border-t border-slate-100 dark:border-white/5 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Secretary Operational Command • End of Transmission</p>
                <div className="flex justify-center gap-6 mt-6 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                    <ShieldCheck size={20} />
                    <Terminal size={20} />
                    <Cpu size={20} />
                </div>
            </footer>
        </div>
    );
}

export default AdminPage;
