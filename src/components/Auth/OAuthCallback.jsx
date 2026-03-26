import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import GoogleOAuth from '../../services/auth/GoogleOAuth';

import logoImg from '../../assets/logo.png';

/**
 * OAuth Callback Handler
 * Handles OAuth redirects from Google, Outlook, Apple
 */
function OAuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = React.useState('Processing...');
    const [error, setError] = React.useState(null);

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const code = searchParams.get('code');
                const state = searchParams.get('state');
                const provider = window.location.pathname.split('/')[2]; // /auth/google/callback

                if (!code) {
                    throw new Error('No authorization code received');
                }

                setStatus(`Connecting to ${provider}...`);

                // Handle based on provider
                switch (provider) {
                    case 'google':
                        await GoogleOAuth.handleCallback(code, state);
                        break;
                    case 'outlook':
                        const OutlookOAuth = (await import('../../services/auth/OutlookOAuth')).default;
                        await OutlookOAuth.handleCallback(code, state);
                        break;
                    // Add other providers later
                    default:
                        throw new Error(`Unknown provider: ${provider}`);
                }

                setStatus('Success! Redirecting...');

                // Close popup if in popup, otherwise redirect
                if (window.opener) {
                    window.opener.postMessage({ type: 'oauth_success', provider }, window.location.origin);
                    window.close();
                } else {
                    setTimeout(() => navigate('/settings'), 1000);
                }
            } catch (err) {
                console.error('[OAuth] Callback error:', err);
                setError(err.message);
                setStatus('Authentication failed');
            }
        };

        handleCallback();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-skin-primary">
            <div className="bg-skin-secondary p-8 rounded-[2.5rem] shadow-2xl shadow-skin-accent/5 border border-slate-200/50 dark:border-white/5 max-w-sm w-full text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-skin-primary via-skin-accent to-skin-primary opacity-50"></div>

                <div className="flex justify-center mb-6">
                    {error ? (
                        <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center text-4xl shadow-inner">
                            ✗
                        </div>
                    ) : (
                        <div className="relative">
                            <div className="absolute inset-0 bg-skin-accent blur-xl opacity-30 animate-pulse"></div>
                            <img
                                src={logoImg}
                                alt="Secretary"
                                className="w-20 h-20 rounded-2xl shadow-xl shadow-skin-accent/20 object-cover relative z-10 animate-pulse"
                            />
                        </div>
                    )}
                </div>

                <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white mb-2">{status}</h2>
                {error && (
                    <p className="text-red-500 text-xs font-medium uppercase tracking-widest mt-4 bg-red-500/5 p-3 rounded-xl border border-red-500/10">
                        {error.replace('Google API Error:', '')}
                    </p>
                )}
                {!error && (
                    <p className="text-slate-400 text-sm font-medium">Securing neural link...</p>
                )}
            </div>
        </div>
    );
}

export default OAuthCallback;
