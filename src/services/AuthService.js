import { supabase, isSupabaseConfigured } from '../lib/supabase';
import useStore from '../store/useStore';

/**
 * Authentication Service
 * Handles all Supabase auth operations
 */
export class AuthService {
    /**
     * Sign in with email/password
     */
    static async signInWithEmail(email, password) {
        if (!isSupabaseConfigured()) {
            console.warn('[AuthService] Supabase not configured, using mock auth');
            return this.mockSignIn(email);
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        // Load user profile
        await this.loadUserProfile(data.user.id);

        return data;
    }

    /**
     * Sign in with OAuth provider (Google, GitHub, etc.)
     */
    static async signInWithOAuth(provider) {
        if (!isSupabaseConfigured()) {
            console.warn('[AuthService] Supabase not configured, using mock auth');
            return this.mockSignIn(`user@${provider}.com`);
        }

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/`,
                scopes: provider === 'google' ? 'https://www.googleapis.com/auth/calendar' : undefined
            }
        });

        if (error) throw error;
        return data;
    }

    /**
     * Sign up new user
     */
    static async signUp(email, password, metadata = {}) {
        if (!isSupabaseConfigured()) {
            return this.mockSignIn(email);
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata
            }
        });

        if (error) throw error;

        // Create user profile
        if (data.user) {
            await this.createUserProfile(data.user.id, {
                email: data.user.email,
                name: metadata.name || email.split('@')[0],
                ...metadata
            });
        }

        return data;
    }

    /**
     * Sign out
     */
    static async signOut() {
        if (!isSupabaseConfigured()) {
            useStore.getState().updateProfile({ email: null });
            return;
        }

        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        // Clear local state
        useStore.getState().updateProfile({ email: null });
    }

    /**
     * Get current session
     */
    static async getSession() {
        if (!isSupabaseConfigured()) {
            return { session: null };
        }

        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        return data;
    }

    /**
     * Listen to auth state changes
     */
    static onAuthStateChange(callback) {
        if (!isSupabaseConfigured()) {
            return { data: { subscription: { unsubscribe: () => { } } } };
        }

        return supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
                await this.loadUserProfile(session.user.id);
            } else if (event === 'SIGNED_OUT') {
                useStore.getState().updateProfile({ email: null });
            }
            callback(event, session);
        });
    }

    /**
     * Load user profile from database
     */
    static async loadUserProfile(userId) {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('[AuthService] Failed to load profile:', error);
            return null;
        }

        // Update Zustand store
        useStore.getState().updateProfile({
            id: data.id,
            name: data.name,
            email: data.email,
            avatar: data.avatar_url,
            xp: data.xp,
            level: data.level,
            streak: data.streak,
            theme: data.theme,
            integrations: data.integrations,
            tier: data.tier,
            is_admin: data.is_admin,
            metadata: data.metadata || {},
            onboardingRequired: !data.name || data.name === 'User'
        });

        // Initialize store with user data
        await useStore.getState().initializeStore(userId);

        return data;
    }

    /**
     * Create user profile in database
     */
    static async createUserProfile(userId, profileData) {
        const { data, error } = await supabase
            .from('user_profiles')
            .insert({
                id: userId,
                email: profileData.email,
                name: profileData.name || 'User',
                avatar_url: profileData.avatar_url || null,
                xp: 0,
                level: 1,
                streak: 0,
                theme: 'light',
                integrations: { google: false, outlook: false, apple: false },
                tier: 'free',
                is_admin: false,
                metadata: {}
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Update user profile
     */
    static async updateUserProfile(userId, updates) {
        const { data, error } = await supabase
            .from('user_profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Mock sign in for development
     */
    static async mockSignIn(email) {
        await new Promise(resolve => setTimeout(resolve, 1000));

        useStore.getState().updateProfile({
            email,
            name: email.split('@')[0]
        });

        return {
            user: { id: 'mock-user-id', email },
            session: { access_token: 'mock-token' }
        };
    }
}

export default AuthService;
