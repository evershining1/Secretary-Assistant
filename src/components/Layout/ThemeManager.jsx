import { useEffect } from 'react';
import useStore from '../../store/useStore';

export function ThemeManager() {
    const theme = useStore(state => state.user.theme);

    useEffect(() => {
        const root = window.document.documentElement;

        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [theme]);

    return null;
}
