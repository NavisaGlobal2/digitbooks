
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
    
    // Add favicon if it doesn't exist
    if (!document.querySelector("link[rel='icon']")) {
      const favicon = document.createElement('link');
      favicon.rel = 'icon';
      favicon.href = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M4 4H20V28H4V4Z" stroke="%2300C853" stroke-width="2.5" fill="none"/><path d="M12 4V28" stroke="%2300C853" stroke-width="2.5"/><path d="M4 4H20V28H4V4Z" fill="%2300C853" fill-opacity="0.2"/></svg>';
      document.head.appendChild(favicon);
    }
    
    // Force refresh any stale data
    const forceUpdate = () => {
      const timestamp = new Date().getTime();
      document.body.dataset.refresh = timestamp.toString();
    };
    
    forceUpdate();
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
