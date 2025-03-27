
import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';
import Index from './pages/Index';
import About from './pages/About';
import Features from './pages/Features';
import Pricing from './pages/Pricing';
import Careers from './pages/Careers';
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Revenue from './pages/Revenue';
import Invoicing from './pages/Invoicing';
import Expenses from './pages/Expenses';
import Budget from './pages/Budget';
import Clients from './pages/Clients';
import FinancialReports from './pages/FinancialReports';
import Ledger from './pages/Ledger';
import SettingsPage from './pages/Settings';
import Agent from './pages/Agent';
import NotFound from './pages/NotFound';
import { useAuth } from './contexts/auth';
import { Toaster } from "@/components/ui/sonner";
import Invitation from './pages/Invitation';
import { RequireAuth } from './components/auth/RequireAuth';

function App() {
  const { user, isAuthenticated } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isInitializing) {
        console.log("Forcing initialization to complete after timeout");
        setIsInitializing(false);
      }
    }, 3000); // 3 seconds timeout
    
    return () => clearTimeout(timer);
  }, [isInitializing]);

  useEffect(() => {
    // Once we know the authentication state, we're no longer initializing
    if (isAuthenticated !== undefined) {
      setIsInitializing(false);
    }
  }, [isAuthenticated]);

  if (isInitializing) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Toaster />
      <Routes>
        {/* Public routes - NO AUTH CHECK */}
        <Route path="/" element={<Index />} />
        <Route path="/about" element={<About />} />
        <Route path="/features" element={<Features />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/invitation" element={<Invitation />} />
      
        {/* Protected routes */}
        <Route path="/onboarding" element={
          <RequireAuth>
            <Onboarding />
          </RequireAuth>
        } />
        
        <Route element={<RequireAuth><Outlet /></RequireAuth>}>
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
    </Router>
  );
}

export default App;
