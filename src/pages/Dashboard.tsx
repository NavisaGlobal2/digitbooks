
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

const Dashboard = () => {
  // Sample data for our dashboard
  const financialData = {
    totalRevenue: 24828,
    totalExpenses: 24828,
    netCashflow: 24828,
    positive: true
  };

  return (
    <DashboardContainer>
      {/* Dashboard Header */}
      <DashboardHeader />
      
      {/* Financial Overview Cards */}
      <FinancialOverview data={financialData} />
      
      {/* Quick Action Buttons */}
      <QuickActions />

      {/* Main Content Sections */}
      <MainContentSection 
        leftContent={
          <>
            <CashflowSection />
            <FinancialChartsSection />
          </>
        }
        rightContent={
          <>
            <AIInsights />
            <TransactionsSection />
          </>
        }
      />
      
      {/* Bills Section */}
      <BillsSection />
    </DashboardContainer>
  );
};

export default Dashboard;
