import { supabase } from '../../lib/supabase';

/**
 * Google OAuth 2.0 Service
 * Handles authentication flow for Google Calendar API access
 */
class GoogleOAuthService {
    constructor() {
        this.clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        this.redirectUri = `${window.location.origin}/auth/google/callback`;
        this.scope = 'https://www.googleapis.com/auth/calendar';
    }

    /**
     * Initiate OAuth flow
     * Opens Google sign-in popup
     */
    async authenticate() {
        const state = this.generateState();
        const codeVerifier = this.generateCodeVerifier();
        const codeChallenge = await this.generateCodeChallenge(codeVerifier);

        // Store for callback
        sessionStorage.setItem('google_oauth_state', state);
        sessionStorage.setItem('google_code_verifier', codeVerifier);

        const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        authUrl.searchParams.set('client_id', this.clientId);
        authUrl.searchParams.set('redirect_uri', this.redirectUri);
        authUrl.searchParams.set('response_type', 'code');
        authUrl.searchParams.set('scope', this.scope);
        authUrl.searchParams.set('state', state);
        authUrl.searchParams.set('code_challenge', codeChallenge);
        authUrl.searchParams.set('code_challenge_method', 'S256');
        authUrl.searchParams.set('access_type', 'offline');
        authUrl.searchParams.set('prompt', 'consent');

        // Open in popup
        const width = 500;
        const height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        window.open(
            authUrl.toString(),
            'Google Calendar Auth',
            `width=${width},height=${height},left=${left},top=${top}`
        );
    }

    /**
     * Handle OAuth callback
     * Exchange authorization code for access token
     */
    async handleCallback(code, state) {
        // Verify state
        const savedState = sessionStorage.getItem('google_oauth_state');
        if (state !== savedState) {
            throw new Error('Invalid state parameter');
        }

        const codeVerifier = sessionStorage.getItem('google_code_verifier');

        // Exchange code for tokens
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code,
                client_id: this.clientId,
                redirect_uri: this.redirectUri,
                grant_type: 'authorization_code',
                code_verifier: codeVerifier
            })
        });

        if (!response.ok) {
            throw new Error('Failed to exchange code for token');
        }

        const tokens = await response.json();

        // Store tokens securely
        await this.saveTokens(tokens);

        // Clean up
        sessionStorage.removeItem('google_oauth_state');
        sessionStorage.removeItem('google_code_verifier');

        return tokens;
    }

    /**
     * Save tokens to Supabase
     */
    async saveTokens(tokens) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Not authenticated');

        const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

        await supabase
            .from('oauth_tokens')
            .upsert({
                user_id: session.user.id,
                provider: 'google',
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                expires_at: expiresAt.toISOString()
            }, {
                onConflict: 'user_id,provider'
            });
    }

    /**
     * Get valid access token (refresh if needed)
     */
    async getAccessToken() {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Not authenticated');

        const { data: tokenData } = await supabase
            .from('oauth_tokens')
            .select('*')
            .eq('user_id', session.user.id)
            .eq('provider', 'google')
            .single();

        if (!tokenData) {
            throw new Error('No Google Calendar connected. Please authenticate first.');
        }

        // Check if token expired
        const expiresAt = new Date(tokenData.expires_at);
        if (expiresAt > new Date()) {
            return tokenData.access_token;
        }

        // Refresh token
        return await this.refreshAccessToken(tokenData.refresh_token);
    }

    /**
     * Refresh expired access token
     */
    async refreshAccessToken(refreshToken) {
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                client_id: this.clientId,
                refresh_token: refreshToken,
                grant_type: 'refresh_token'
            })
        });

        if (!response.ok) {
            throw new Error('Failed to refresh token');
        }

        const tokens = await response.json();
        await this.saveTokens({ ...tokens, refresh_token: refreshToken });

        return tokens.access_token;
    }

    /**
     * Disconnect Google Calendar
     */
    async disconnect() {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        await supabase
            .from('oauth_tokens')
            .delete()
            .eq('user_id', session.user.id)
            .eq('provider', 'google');
    }

    // PKCE helpers
    generateState() {
        return Math.random().toString(36).substring(2, 15);
    }

    generateCodeVerifier() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return this.base64URLEncode(array);
    }

    async generateCodeChallenge(verifier) {
        const encoder = new TextEncoder();
        const data = encoder.encode(verifier);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return this.base64URLEncode(new Uint8Array(hash));
    }

    base64URLEncode(buffer) {
        return btoa(String.fromCharCode(...buffer))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    }
}

export default new GoogleOAuthService();
