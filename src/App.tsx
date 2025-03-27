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
import Auth from './pages/Auth'; // Import Auth directly to avoid module fetch issues

// Group lazy loaded routes by functional area
// Public pages
const publicPages = {
  About: lazy(() => import('./pages/About')),
  Features: lazy(() => import('./pages/Features')),
  Pricing: lazy(() => import('./pages/Pricing')),
  Careers: lazy(() => import('./pages/Careers')),
  Invitation: lazy(() => import('./pages/Invitation')),
};

// Dashboard and main app pages
const appPages = {
  Onboarding: lazy(() => import('./pages/Onboarding')),
  Dashboard: lazy(() => import('./pages/Dashboard')),
  Revenue: lazy(() => import('./pages/Revenue')),
  Invoicing: lazy(() => import('./pages/Invoicing')),
  Expenses: lazy(() => import('./pages/Expenses')),
  Budget: lazy(() => import('./pages/Budget')),
  Clients: lazy(() => import('./pages/Clients')),
  FinancialReports: lazy(() => import('./pages/FinancialReports')),
  Ledger: lazy(() => import('./pages/Ledger')),
  Settings: lazy(() => import('./pages/Settings')),
  Agent: lazy(() => import('./pages/Agent')),
};

// Other pages
const NotFound = lazy(() => import('./pages/NotFound'));

// Optimized loading component with reduced animation delay
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

  // Optimized initialization effect
  useEffect(() => {
    if (isAuthenticated !== undefined) {
      // Use requestAnimationFrame for better performance
      const animationFrame = requestAnimationFrame(() => {
        // Use a shorter timeout to improve perceived performance
        const timer = setTimeout(() => setIsInitializing(false), 500);
        return () => clearTimeout(timer);
      });
      
      return () => cancelAnimationFrame(animationFrame);
    }
  }, [isAuthenticated]);

  // For debugging - use conditional logging to reduce console noise
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log("Auth state in App:", { isAuthenticated, user, isInitializing });
    }
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
          <Route path="/about" element={<publicPages.About />} />
          <Route path="/features" element={<publicPages.Features />} />
          <Route path="/pricing" element={<publicPages.Pricing />} />
          <Route path="/careers" element={<publicPages.Careers />} />
          
          {/* Auth pages - not protected by RequireAuth */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/invitation" element={<publicPages.Invitation />} />
        
          {/* Protected routes */}
          <Route element={<RequireAuth><Outlet /></RequireAuth>}>
            <Route path="/onboarding" element={<appPages.Onboarding />} />
            <Route path="/dashboard" element={<appPages.Dashboard />} />
            <Route path="/revenue" element={<appPages.Revenue />} />
            <Route path="/invoicing" element={<appPages.Invoicing />} />
            <Route path="/expenses" element={<appPages.Expenses />} />
            <Route path="/budget" element={<appPages.Budget />} />
            <Route path="/clients" element={<appPages.Clients />} />
            <Route path="/financial-reports" element={<appPages.FinancialReports />} />
            <Route path="/ledger" element={<appPages.Ledger />} />
            <Route path="/settings/*" element={<appPages.Settings />} />
            <Route path="/agent" element={<appPages.Agent />} />
          </Route>
        
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
