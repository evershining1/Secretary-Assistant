import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Handles routing logic based on subdomains.
 * e.g. admin.my-secretary.net -> /admin
 */
export function SubdomainHandler() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const hostname = window.location.hostname;

        // Prevent infinite loops if we are already on the right path
        if (hostname.startsWith('admin.') && !location.pathname.startsWith('/admin')) {
            navigate('/admin');
        }
        // app. subdomain already goes to dashboard by default
    }, [location.pathname, navigate]);

    return null;
}
