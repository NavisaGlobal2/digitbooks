
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { InvoiceProvider } from "@/contexts/InvoiceContext";
import { ClientProvider } from "@/contexts/ClientContext";
import { ExpenseProvider } from "@/contexts/ExpenseContext";
import { RevenueProvider } from "@/contexts/RevenueContext";
import { BudgetProvider } from "@/contexts/BudgetContext";
import { LedgerProvider } from "@/contexts/LedgerContext";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
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
                      <Route path="/" element={<Index />} />
                      <Route path="/features" element={<Features />} />
                      <Route path="/pricing" element={<Pricing />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/help" element={<Help />} />
                      <Route path="/careers" element={<Careers />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/invoicing" element={<Invoicing />} />
                      <Route path="/expenses" element={<Expenses />} />
                      <Route path="/revenue" element={<Revenue />} />
                      <Route path="/clients" element={<Clients />} />
                      <Route path="/budget" element={<Budget />} />
                      <Route path="/ledger" element={<Ledger />} />
                      <Route path="/reports" element={<FinancialReports />} />
                      <Route path="/admin/applications" element={<ApplicationsAdmin />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </LedgerProvider>
              </BudgetProvider>
            </RevenueProvider>
          </ExpenseProvider>
        </InvoiceProvider>
      </ClientProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
