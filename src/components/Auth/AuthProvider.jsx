import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import useStore from '../../store/useStore';
import { AuthService } from '../../services/AuthService';

/**
 * AuthProvider - Manages authentication state
 * Checks for existing session on mount and redirects accordingly
 */
function AuthProvider({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const updateProfile = useStore(state => state.updateProfile);

    useEffect(() => {
        // Check for existing session
        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user) {
                    console.log('[Auth] User session found:', session.user.email);
                    // Load user profile using centralized service
                    await AuthService.loadUserProfile(session.user.id);
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
                await AuthService.loadUserProfile(session.user.id);

                if (location.pathname === '/login' || location.pathname === '/auth/callback') {
                    navigate('/');
                }
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
