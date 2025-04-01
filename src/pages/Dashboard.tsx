
import { useEffect, useState } from "react";
import { useInvoices, useExpenses, useRevenues } from "@/lib/db";
import DashboardContainer from "@/components/dashboard/layout/DashboardContainer";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import QuickActions from "@/components/dashboard/QuickActions";
import FinancialOverview from "@/components/dashboard/FinancialOverview";
import CashflowSection from "@/components/dashboard/CashflowSection";
import FinancialChartsSection from "@/components/dashboard/FinancialChartsSection";
import TransactionsSection from "@/components/dashboard/TransactionsSection";
import BillsSection from "@/components/dashboard/BillsSection";
import AIInsights from "@/components/dashboard/AIInsights";
import MainContentSection from "@/components/dashboard/sections/MainContentSection";
import AIChatBot from "@/components/dashboard/AIChatBot";
import { toast } from "sonner";

const Dashboard = () => {
  const { fetchInvoices } = useInvoices();
  const { fetchExpenses } = useExpenses();
  const { fetchRevenues } = useRevenues();

  const [financialData, setFinancialData] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netCashflow: 0,
    positive: true
  });
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching dashboard data...");
        const [invoices, expenses, revenues] = await Promise.all([
          fetchInvoices(),
          fetchExpenses(),
          fetchRevenues()
        ]);

        console.log("Data fetched:", { 
          invoicesCount: invoices?.length || 0,
          expensesCount: expenses?.length || 0, 
          revenuesCount: revenues?.length || 0 
        });

        // Calculate totals
        const totalRevenue = revenues?.reduce((sum, rev) => sum + Number(rev.amount), 0) || 0;
        const totalExpenses = expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;
        const netCashflow = totalRevenue - totalExpenses;

        console.log("Calculated financials:", { totalRevenue, totalExpenses, netCashflow });

        setFinancialData({
          totalRevenue,
          totalExpenses,
          netCashflow,
          positive: netCashflow >= 0
        });
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [fetchInvoices, fetchExpenses, fetchRevenues]);

  return (
    <DashboardContainer>
      <DashboardHeader />
      
      <div className="mb-3 sm:mb-4 md:mb-6">
        <QuickActions />
      </div>
      
      <div className="mb-3 sm:mb-4 md:mb-6">
        <FinancialOverview data={financialData} isLoading={isLoading} />
      </div>

      <div className="mb-3 sm:mb-4 md:mb-6">
        <MainContentSection 
          leftContent={
            <>
              <CashflowSection />
              <FinancialChartsSection />
            </>
          }
          rightContent={<TransactionsSection />}
          bottomContent={<AIInsights />}
        />
      </div>
      
      <div className="mb-3 sm:mb-4 md:mb-6">
        <BillsSection />
      </div>

      {/* AI Chatbot */}
      <AIChatBot />
    </DashboardContainer>
  );
};

export default Dashboard;
