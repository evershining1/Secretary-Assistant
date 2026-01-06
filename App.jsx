import { useRef, useEffect } from 'react';
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
    <ErrorBoundary>
      <Router>
        {/* <SubdomainHandler /> */}
        <AuthProvider>
          <ThemeManager />
          <NotificationCenter />
          <FeedbackSystem />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/:provider/callback" element={<OAuthCallback />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <div className="flex min-h-screen bg-skin-primary transition-colors duration-300">
                  <Sidebar />
                  <main className="flex-1 ml-64 p-8 overflow-y-auto">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/calendar" element={<CalendarView />} />
                      <Route path="/goals" element={<GoalsDashboard />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="/admin" element={<AdminPage />} />
                      <Route path="/pricing" element={<PricingPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </main>
                </div>
              </ProtectedRoute>
            } />
          </Routes>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
