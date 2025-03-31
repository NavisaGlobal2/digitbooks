
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import About from './pages/About';
import Features from './pages/Features';
import Pricing from './pages/Pricing';
import Careers from './pages/Careers';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Ledger from './pages/Ledger';
import Budget from './pages/Budget';
import Expenses from './pages/Expenses';
import Vendors from './pages/Vendors';
import Invoicing from './pages/Invoicing';
import Revenue from './pages/Revenue';
import Settings from './pages/Settings';
import FinancialReports from './pages/FinancialReports';
import ApplicationsAdmin from './pages/ApplicationsAdmin';
import Help from './pages/Help';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from 'sonner';

import { VendorProvider } from './contexts/vendor';
import { ExpenseProvider } from './contexts/expense/ExpenseProvider';
import { AuthProvider } from './contexts/auth/AuthProvider';

function App() {
  return (
    <AuthProvider>
      <ExpenseProvider>
        <VendorProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/features" element={<Features />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/help" element={<Help />} />
              
              {/* Protected routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/ledger" element={<Ledger />} />
              <Route path="/budget" element={<Budget />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/vendors" element={<Vendors />} />
              <Route path="/invoicing" element={<Invoicing />} />
              <Route path="/revenue" element={<Revenue />} />
              <Route path="/reports" element={<FinancialReports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/applications-admin" element={<ApplicationsAdmin />} />
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
            <SonnerToaster position="top-right" />
          </Router>
        </VendorProvider>
      </ExpenseProvider>
    </AuthProvider>
  );
}

export default App;
