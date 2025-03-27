
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

// Eagerly load critical pages for better initial load experience
import Index from './pages/Index';
import Auth from './pages/Auth'; // Import Auth directly instead of lazy loading

// Lazy load other pages
const About = lazy(() => import('./pages/About'));
const Features = lazy(() => import('./pages/Features'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Careers = lazy(() => import('./pages/Careers'));
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
      // Set a maximum timeout to prevent indefinite loading
      const timer = setTimeout(() => {
        setIsInitializing(false);
      }, 1000); // Reduce timeout to 1 second
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  // For debugging - add this to help troubleshoot auth state
  useEffect(() => {
    console.log("Auth state in App:", { isAuthenticated, user, isInitializing });
  }, [isAuthenticated, user, isInitializing]);

  if (isInitializing) {
    return <LoadingPage />;
  }

  return (
    <Router>
      <Toaster />
      <Suspense fallback={<LoadingPage />}>
        <Routes>
          {/* Public routes - don't require authentication */}
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/careers" element={<Careers />} />
          
          {/* Auth pages - not protected by RequireAuth */}
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
