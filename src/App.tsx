import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
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
import { Toaster } from "@/components/ui/sonner"
import Invitation from './pages/Invitation';

function App() {
  const { user, loading } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (!loading) {
      setIsInitializing(false);
    }
  }, [loading]);

  const RequireAuth = ({ children }: { children: React.ReactNode }) => {
    if (isInitializing) {
      return <div>Loading...</div>;
    }

    if (!user) {
      return <Navigate to="/auth" />;
    }

    return <>{children}</>;
  };

  return (
    <Router>
      <Toaster />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/about" element={<About />} />
        <Route path="/features" element={<Features />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/invitation" element={<Invitation />} />
      
        {/* Protected routes */}
        <Route element={<RequireAuth />}>
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
    </Router>
  );
}

export default App;
