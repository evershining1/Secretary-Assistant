import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { motion } from 'framer-motion';

function AppShell({ children }) {
    return (
        <div className="flex min-h-screen bg-skin-primary text-skin-text font-sans selection:bg-skin-accent selection:text-white transition-colors duration-500">
            <Sidebar />
            <main className="flex-1 ml-64 p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}

export default AppShell;
