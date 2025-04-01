
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

  useEffect(() => {
    const loadData = async () => {
      try {
        const [invoices, expenses, revenues] = await Promise.all([
          fetchInvoices(),
          fetchExpenses(),
          fetchRevenues()
        ]);

        // Calculate totals
        const totalRevenue = revenues?.reduce((sum, rev) => sum + rev.amount, 0) || 0;
        const totalExpenses = expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;
        const netCashflow = totalRevenue - totalExpenses;

        setFinancialData({
          totalRevenue,
          totalExpenses,
          netCashflow,
          positive: netCashflow >= 0
        });
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        toast.error("Failed to load dashboard data");
      }
    };

    loadData();
  }, []);

  return (
    <DashboardContainer>
      <DashboardHeader />
      
      <div className="mb-3 sm:mb-4 md:mb-6">
        <QuickActions />
      </div>
      
      <div className="mb-3 sm:mb-4 md:mb-6">
        <FinancialOverview data={financialData} />
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
