
import React, { useState, useEffect, lazy, Suspense } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';

import { useAuth } from './contexts/auth';
import { Toaster } from "@/components/ui/sonner";
import { RequireAuth } from './components/auth/RequireAuth';

// Eagerly load the Index page for better initial load experience
import Index from './pages/Index';

// Lazy load other pages
const About = lazy(() => import('./pages/About'));
const Features = lazy(() => import('./pages/Features'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Careers = lazy(() => import('./pages/Careers'));
const Auth = lazy(() => import('./pages/Auth'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Revenue = lazy(() => import('./pages/Revenue'));
const Invoicing = lazy(() => import('./pages/Invoicing'));
const Expenses = lazy(() => import('./pages/Expenses'));
const Budget = lazy(() => import('./pages/Budget'));
const Clients = lazy(() => import('./pages/Clients'));
const FinancialReports = lazy(() => import('./pages/FinancialReports'));
const Ledger = lazy(() => import('./pages/Ledger'));
const SettingsPage = lazy(() => import('./pages/Settings'));
const Agent = lazy(() => import('./pages/Agent'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Invitation = lazy(() => import('./pages/Invitation'));

// Loading component for Suspense fallback
const LoadingPage = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-pulse flex flex-col items-center">
      <div className="h-12 w-12 rounded-full bg-primary/20 mb-4"></div>
      <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
      <div className="h-3 w-24 bg-gray-200 rounded"></div>
    </div>
  </div>
);

function App() {
  const { user, isAuthenticated } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Once we know the authentication state, we're no longer initializing
    if (isAuthenticated !== undefined) {
      setIsInitializing(false);
    }
  }, [isAuthenticated]);

  if (isInitializing) {
    return <LoadingPage />;
  }

  return (
    <Router>
      <Toaster />
      <Suspense fallback={<LoadingPage />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/invitation" element={<Invitation />} />
        
          {/* Protected routes */}
          <Route element={<RequireAuth><Outlet /></RequireAuth>}>
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/revenue" element={<Revenue />} />
            <Route path="/invoicing" element={<Invoicing />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/financial-reports" element={<FinancialReports />} />
            <Route path="/ledger" element={<Ledger />} />
            <Route path="/settings/*" element={<SettingsPage />} />
            <Route path="/agent" element={<Agent />} />
          </Route>
        
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
