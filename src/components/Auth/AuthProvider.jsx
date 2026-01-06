import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import useStore from '../../store/useStore';

/**
 * AuthProvider - Manages authentication state
 * Checks for existing session on mount and redirects accordingly
 */
function AuthProvider({ children }) {
    const navigate = useNavigate();
    const updateProfile = useStore(state => state.updateProfile);

    useEffect(() => {
        // Check for existing session
        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user) {
                    console.log('[Auth] User session found:', session.user.email);

                    // Load user profile from database
                    const { data: profile } = await supabase
                        .from('user_profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();

                    if (profile) {
                        updateProfile({
                            email: profile.email,
                            name: profile.name,
                            avatar: profile.avatar_url,
                            xp: profile.xp,
                            level: profile.level,
                            streak: profile.streak,
                            theme: profile.theme,
                            integrations: profile.integrations
                        });

                        // Load user's tasks and goals
                        useStore.getState().loadUserData(session.user.id);
                    }
                } else {
                    console.log('[Auth] No active session');
                }
            } catch (error) {
                console.error('[Auth] Session check failed:', error);
            }
        };

        checkSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('[Auth] State changed:', event);

            if (event === 'SIGNED_IN' && session?.user) {
                // User signed in - load profile
                const { data: profile } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (profile) {
                    updateProfile({
                        email: profile.email,
                        name: profile.name,
                        avatar: profile.avatar_url,
                        xp: profile.xp,
                        level: profile.level,
                        streak: profile.streak,
                        theme: profile.theme,
                        integrations: profile.integrations
                    });

                    // Load user's tasks and goals
                    useStore.getState().loadUserData(session.user.id);
                }

                navigate('/');
            } else if (event === 'SIGNED_OUT') {
                // User signed out - clear profile
                updateProfile({ email: null, name: 'Guest' });
                navigate('/login');
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [navigate, updateProfile]);

    return <>{children}</>;
}

export default AuthProvider;
