import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Dashboard from './components/Dashboard/Dashboard';
import CalendarView from './components/Calendar/CalendarView';
import GoalsDashboard from './components/Goals/GoalsDashboard';
import SettingsPage from './components/Settings/SettingsPage';
import LoginPage from './components/Auth/LoginPage';
import OAuthCallback from './components/Auth/OAuthCallback';
import Sidebar from './components/Layout/Sidebar';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import AuthProvider from './components/Auth/AuthProvider';
import { ThemeManager } from './components/Layout/ThemeManager';
import NotificationCenter from './components/UI/NotificationCenter';
import AdminPage from './components/Admin/AdminPage';
import PricingPage from './components/Commerce/PricingPage';
import CheckoutPage from './components/Commerce/CheckoutPage';
import FeedbackSystem from './components/UI/FeedbackSystem';
// import { SubdomainHandler } from './components/Layout/SubdomainHandler';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <div className="p-10 font-sans text-xl">
      <h1 className="font-bold text-green-600">✅ DEBUG MODE ACTIVE</h1>
      <p>If you see this, the App is loading correctly.</p>
      <p>The crash is inside one of the components.</p>
    </div>
  );
}

export default App;
