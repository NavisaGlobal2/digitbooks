
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { InvoiceProvider } from "@/contexts/InvoiceContext";
import { ClientProvider } from "@/contexts/ClientContext";
import { ExpenseProvider } from "@/contexts/ExpenseContext";
import { RevenueProvider } from "@/contexts/RevenueContext";
import { BudgetProvider } from "@/contexts/BudgetContext";
import { LedgerProvider } from "@/contexts/LedgerContext";
import { AuthProvider } from "@/contexts/auth";
import Index from "./pages/Index";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Help from "./pages/Help";
import Careers from "./pages/Careers";
import NotFound from "./pages/NotFound";
import ApplicationsAdmin from "./pages/ApplicationsAdmin";
import Dashboard from "./pages/Dashboard";
import Invoicing from "./pages/Invoicing";
import Expenses from "./pages/Expenses";
import Clients from "./pages/Clients";
import Revenue from "./pages/Revenue";
import Budget from "./pages/Budget";
import Ledger from "./pages/Ledger";
import FinancialReports from "./pages/FinancialReports";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import Onboarding from "./Onboarding";
import Agent from "./pages/Agent";
import { RequireAuth } from "./components/auth/RequireAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ClientProvider>
          <InvoiceProvider>
            <ExpenseProvider>
              <RevenueProvider>
                <BudgetProvider>
                  <LedgerProvider>
                    <Toaster />
                    <Sonner />
                    <BrowserRouter>
                      <Routes>
                        {/* Public routes */}
                        <Route path="/" element={<Index />} />
                        <Route path="/features" element={<Features />} />
                        <Route path="/pricing" element={<Pricing />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/help" element={<Help />} />
                        <Route path="/careers" element={<Careers />} />
                        
                        {/* Auth routes */}
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/onboarding" element={
                          <RequireAuth>
                            <Onboarding />
                          </RequireAuth>
                        } />
                        
                        {/* Protected routes that require authentication */}
                        <Route path="/dashboard" element={
                          <RequireAuth>
                            <Dashboard />
                          </RequireAuth>
                        } />
                        <Route path="/invoicing" element={
                          <RequireAuth>
                            <Invoicing />
                          </RequireAuth>
                        } />
                        <Route path="/expenses" element={
                          <RequireAuth>
                            <Expenses />
                          </RequireAuth>
                        } />
                        <Route path="/revenue" element={
                          <RequireAuth>
                            <Revenue />
                          </RequireAuth>
                        } />
                        <Route path="/clients" element={
                          <RequireAuth>
                            <Clients />
                          </RequireAuth>
                        } />
                        <Route path="/budget" element={
                          <RequireAuth>
                            <Budget />
                          </RequireAuth>
                        } />
                        <Route path="/ledger" element={
                          <RequireAuth>
                            <Ledger />
                          </RequireAuth>
                        } />
                        <Route path="/reports" element={
                          <RequireAuth>
                            <FinancialReports />
                          </RequireAuth>
                        } />
                        <Route path="/agent" element={
                          <RequireAuth>
                            <Agent />
                          </RequireAuth>
                        } />
                        <Route path="/settings" element={
                          <RequireAuth>
                            <Settings />
                          </RequireAuth>
                        } />
                        <Route path="/admin/applications" element={
                          <RequireAuth>
                            <ApplicationsAdmin />
                          </RequireAuth>
                        } />
                        
                        {/* Fallback route */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </BrowserRouter>
                  </LedgerProvider>
                </BudgetProvider>
              </RevenueProvider>
            </ExpenseProvider>
          </InvoiceProvider>
        </ClientProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
