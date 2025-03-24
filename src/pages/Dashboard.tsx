
import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import QuickActions from "@/components/dashboard/QuickActions";
import FinancialOverview from "@/components/dashboard/FinancialOverview";
import CashflowSection from "@/components/dashboard/CashflowSection";
import FinancialChartsSection from "@/components/dashboard/FinancialChartsSection";
import TransactionsSection from "@/components/dashboard/TransactionsSection";
import BillsSection from "@/components/dashboard/BillsSection";
import AIInsights from "@/components/dashboard/AIInsights";

const Dashboard = () => {
  // Sample data for our dashboard
  const financialData = {
    totalRevenue: 24828,
    totalExpenses: 24828,
    netCashflow: 24828,
    positive: true
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <Header />

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6 bg-background">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Dashboard Header */}
            <DashboardHeader />
            
            {/* Financial Overview Cards */}
            <FinancialOverview data={financialData} />
            
            {/* Quick Action Buttons */}
            <QuickActions />

            {/* Main Content Sections */}
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 space-y-6">
                {/* Cashflow Analysis */}
                <CashflowSection />
                
                {/* Financial Charts Section */}
                <FinancialChartsSection />
              </div>
              
              <div className="space-y-6">
                {/* AI Insights Section */}
                <AIInsights />
                
                {/* Transactions Section */}
                <TransactionsSection />
              </div>
            </div>
            
            {/* Bills Section */}
            <BillsSection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
