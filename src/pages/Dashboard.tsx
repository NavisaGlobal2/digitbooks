
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
import { useEffect } from "react";

const Dashboard = () => {
  // Sample data for our dashboard
  const financialData = {
    totalRevenue: 24828,
    totalExpenses: 24828,
    netCashflow: 24828,
    positive: true
  };

  // Force re-render on initial load to ensure latest view
  useEffect(() => {
    // Clear any stale cache data
    const clearCache = () => {
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach(name => {
            caches.delete(name);
          });
        });
      }
    };

    clearCache();
  }, []);

  return (
    <DashboardContainer>
      {/* Dashboard Header */}
      <DashboardHeader />
      
      {/* Quick Action Buttons - Now placed before Financial Overview */}
      <div className="mb-6">
        <QuickActions />
      </div>
      
      {/* Financial Overview Cards */}
      <div className="mb-6">
        <FinancialOverview data={financialData} />
      </div>

      {/* Main Content Sections */}
      <div className="mb-6">
        <MainContentSection 
          leftContent={
            <>
              <CashflowSection />
              <FinancialChartsSection />
            </>
          }
          rightContent={
            <TransactionsSection />
          }
          bottomContent={
            <AIInsights />
          }
        />
      </div>
      
      {/* Bills Section */}
      <div className="mb-6">
        <BillsSection />
      </div>
    </DashboardContainer>
  );
};

export default Dashboard;
