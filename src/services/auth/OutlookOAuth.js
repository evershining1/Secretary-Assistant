import { supabase } from '../../lib/supabase';

/**
 * Microsoft Outlook OAuth 2.0 Service
 * Handles authentication flow for Microsoft Graph API access
 */
class OutlookOAuthService {
    constructor() {
        this.clientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID;
        this.redirectUri = `${window.location.origin}/auth/outlook/callback`;
        this.scope = 'offline_access User.Read Calendars.Read';
    }

    /**
     * Initiate OAuth flow
     * Redirects to Microsoft sign-in
     */
    async authenticate() {
        if (!this.clientId) {
            throw new Error('Microsoft Client ID not configured in .env');
        }

        const state = this.generateState();
        const codeVerifier = this.generateCodeVerifier();
        const codeChallenge = await this.generateCodeChallenge(codeVerifier);

        // Store for callback
        sessionStorage.setItem('outlook_oauth_state', state);
        sessionStorage.setItem('outlook_code_verifier', codeVerifier);

        const authUrl = new URL('https://login.microsoftonline.com/common/oauth2/v2.0/authorize');
        authUrl.searchParams.set('client_id', this.clientId);
        authUrl.searchParams.set('redirect_uri', this.redirectUri);
        authUrl.searchParams.set('response_type', 'code');
        authUrl.searchParams.set('scope', this.scope);
        authUrl.searchParams.set('state', state);
        authUrl.searchParams.set('code_challenge', codeChallenge);
        authUrl.searchParams.set('code_challenge_method', 'S256');
        authUrl.searchParams.set('response_mode', 'query');

        // Redirect (Safari-friendly)
        window.location.href = authUrl.toString();
    }

    /**
     * Handle OAuth callback
     */
    async handleCallback(code, state) {
        const savedState = sessionStorage.getItem('outlook_oauth_state');
        if (state !== savedState) {
            throw new Error('Invalid state parameter');
        }

        const codeVerifier = sessionStorage.getItem('outlook_code_verifier');

        const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: this.clientId,
                scope: this.scope,
                code: code,
                redirect_uri: this.redirectUri,
                grant_type: 'authorization_code',
                code_verifier: codeVerifier
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Microsoft Token Error: ${error.error_description || response.statusText}`);
        }

        const tokens = await response.json();
        await this.saveTokens(tokens);

        // Clean up
        sessionStorage.removeItem('outlook_oauth_state');
        sessionStorage.removeItem('outlook_code_verifier');

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
                provider: 'outlook',
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                expires_at: expiresAt.toISOString()
            }, {
                onConflict: 'user_id,provider'
            });
    }

    /**
     * Disconnect Outlook
     */
    async disconnect() {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        await supabase
            .from('oauth_tokens')
            .delete()
            .eq('user_id', session.user.id)
            .eq('provider', 'outlook');
    }

    // PKCE helpers (same as Google)
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

export default new OutlookOAuthService();
