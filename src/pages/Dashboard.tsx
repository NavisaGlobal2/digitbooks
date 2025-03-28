
import { useState } from "react";
import DashboardContainer from "@/components/dashboard/layout/DashboardContainer";
import FinancialOverview from "@/components/dashboard/FinancialOverview";
import CashflowSection from "@/components/dashboard/CashflowSection";
import BillsSection from "@/components/dashboard/BillsSection";
import TransactionsSection from "@/components/dashboard/TransactionsSection";
import QuickActions from "@/components/dashboard/QuickActions";
import AIInsights from "@/components/dashboard/AIInsights";
import FinancialChartsSection from "@/components/dashboard/FinancialChartsSection";

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  
  return (
    <DashboardContainer>
      <div className="space-y-6">
        <FinancialOverview
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <CashflowSection />
            <FinancialChartsSection />
          </div>
          
          <div className="space-y-6">
            <QuickActions />
            <AIInsights />
            <BillsSection />
            <TransactionsSection />
          </div>
        </div>
      </div>
    </DashboardContainer>
  );
};

export default Dashboard;
