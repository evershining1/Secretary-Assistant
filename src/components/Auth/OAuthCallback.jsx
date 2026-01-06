import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import GoogleOAuth from '../../services/auth/GoogleOAuth';

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
            <div className="bg-skin-secondary p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
                <div className="mb-4">
                    {error ? (
                        <div className="text-red-600 text-5xl mb-4">✗</div>
                    ) : (
                        <div className="animate-spin text-skin-accent text-5xl mb-4">⟳</div>
                    )}
                </div>
                <h2 className="text-2xl font-bold text-skin-text mb-2">{status}</h2>
                {error && (
                    <p className="text-red-600 text-sm mt-4">{error}</p>
                )}
                {!error && (
                    <p className="text-skin-muted text-sm">Please wait...</p>
                )}
            </div>
        </div>
    );
}

export default OAuthCallback;
