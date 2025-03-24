
import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import FinancialOverview from "@/components/dashboard/FinancialOverview";
import CashflowSection from "@/components/dashboard/CashflowSection";
import TransactionsSection from "@/components/dashboard/TransactionsSection";
import BillsSection from "@/components/dashboard/BillsSection";

const Dashboard = () => {
  // Sample data for our dashboard
  const financialData = {
    totalRevenue: 24828,
    totalExpenses: 14418,
    netCashflow: 10410,
    positive: true
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <Header />

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6 bg-background">
          <div className="max-w-7xl mx-auto">
            {/* Dashboard Header */}
            <DashboardHeader />

            {/* Financial Overview Cards */}
            <FinancialOverview data={financialData} />

            {/* Cashflow Analysis */}
            <CashflowSection />

            {/* Bottom Section */}
            <div className="grid grid-cols-2 gap-5">
              <TransactionsSection />
              <BillsSection />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
