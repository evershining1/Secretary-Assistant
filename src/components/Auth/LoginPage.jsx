import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../services/AuthService';
import { ArrowRight, Lock, Mail, Github, ShieldCheck, Globe } from 'lucide-react';

function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            if (!password) {
                await AuthService.mockSignIn(email);
            } else {
                await AuthService.signInWithEmail(email, password);
            }
            navigate('/');
        } catch (err) {
            console.error('Login failed:', err);
            setError(err.message || 'Failed to sign in');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOAuthLogin = async (provider) => {
        setIsLoading(true);
        setError(null);

        try {
            await AuthService.signInWithOAuth(provider);
        } catch (err) {
            console.error('OAuth failed:', err);
            let msg = err.message || `Failed to sign in with ${provider}`;

            // Helpful guidance for Supabase configuration issues
            if (msg.toLowerCase().includes('provider is not enabled')) {
                msg = `The ${provider} login provider is not enabled in your Supabase dashboard yet. Please enable it in Authentication > Providers.`;
            }

            setError(msg);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#050505] flex items-center justify-center p-4 selection:bg-skin-accent/30 tracking-tight">
            {/* Ambient Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-skin-accent/5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-indigo-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="w-full max-w-4xl grid md:grid-cols-2 bg-white/40 dark:bg-white/[0.02] backdrop-blur-2xl rounded-[2.5rem] border border-slate-200/50 dark:border-white/5 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden relative z-10">

                {/* Visual Side */}
                <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-skin-accent/10 to-transparent border-r border-slate-200/50 dark:border-white/5">
                    <div>
                        <div className="flex items-center gap-3 mb-10">
                            <img src="/src/assets/logo.png" alt="Secretary Logo" className="w-12 h-12 rounded-2xl shadow-xl shadow-skin-accent/20 object-cover" />
                            <span className="text-xl font-bold text-slate-900 dark:text-white">Secretary</span>
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white leading-[1.1] mb-6">
                            Your intelligent <br />
                            <span className="text-skin-accent">life assistant</span>.
                        </h2>
                        <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-[280px]">
                            Streamline your schedule, sync your life, and focus on what truly matters.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                <ShieldCheck size={16} />
                            </div>
                            Privacy-First & Fully Encrypted
                        </div>
                        <div className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                                <Globe size={16} />
                            </div>
                            Multi-Platform Cloud Sync
                        </div>
                    </div>
                </div>

                {/* Form Side */}
                <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                    <div className="md:hidden flex items-center gap-3 mb-12 justify-center">
                        <img src="/src/assets/logo.png" alt="Secretary Logo" className="w-12 h-12 rounded-2xl shadow-xl shadow-skin-accent/20" />
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Secretary</h1>
                    </div>

                    <div className="mb-10">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Get Started</h3>
                        <p className="text-slate-500 dark:text-slate-400">Sign in to sync your schedule across devices.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleEmailLogin} className="space-y-5">
                        <div className="space-y-2">
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-skin-accent transition-colors" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-skin-accent/20 focus:border-skin-accent focus:bg-white dark:focus:bg-white/[0.05] outline-none text-slate-900 dark:text-white transition-all placeholder:text-slate-400"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-skin-accent transition-colors" size={18} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Password (optional for demo)"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-skin-accent/20 focus:border-skin-accent focus:bg-white dark:focus:bg-white/[0.05] outline-none text-slate-900 dark:text-white transition-all placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-slate-900 dark:bg-white text-white dark:text-black py-4 rounded-2xl font-bold text-lg shadow-xl shadow-slate-900/10 dark:shadow-white/5 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>Sign in to Dashboard</span>
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="my-10 flex items-center gap-4">
                        <div className="h-px bg-slate-200 dark:bg-white/5 flex-1" />
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Secure Connect</span>
                        <div className="h-px bg-slate-200 dark:bg-white/5 flex-1" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => handleOAuthLogin('google')}
                            disabled={isLoading}
                            className="flex items-center justify-center gap-3 py-3.5 rounded-2xl border border-slate-200/50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-slate-900 dark:text-white font-bold text-sm"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Google
                        </button>
                        <button
                            onClick={() => handleOAuthLogin('github')}
                            disabled={isLoading}
                            className="flex items-center justify-center gap-3 py-3.5 rounded-2xl border border-slate-200/50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-slate-900 dark:text-white font-bold text-sm"
                        >
                            <Github size={20} />
                            GitHub
                        </button>
                    </div>
                </div>
            </div>

            <div className="fixed bottom-8 text-center text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em]">
                &copy; 2026 Antigravity Systems &bull; Built for Performance
            </div>
        </div>
    );
}

export default LoginPage;
