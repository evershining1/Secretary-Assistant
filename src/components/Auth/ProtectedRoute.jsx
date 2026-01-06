import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useStore from '../../store/useStore';
import AuthService from '../../services/AuthService';

/**
 * Route guard for authenticated paths
 */
const ProtectedRoute = ({ children }) => {
    const user = useStore(state => state.user);
    const [isChecking, setIsChecking] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { session } = await AuthService.getSession();
                // If we have a session OR a mock email (for dev)
                setIsAuthenticated(!!session || !!user.email);
            } catch (error) {
                console.error('[ProtectedRoute] Auth check failed:', error);
                setIsAuthenticated(false);
            } finally {
                setIsChecking(false);
            }
        };

        checkAuth();
    }, [user.email]);

    if (isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-skin-primary">
                <div className="w-12 h-12 border-4 border-skin-accent/20 border-t-skin-accent rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) {
        // Redirect to login but save the attempted URL
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
