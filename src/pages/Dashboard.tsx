
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
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const { fetchInvoices } = useInvoices();
  const { fetchExpenses } = useExpenses();
  const { fetchRevenues } = useRevenues();

  const [isLoading, setIsLoading] = useState(true);
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
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <DashboardContainer>
      <div className="mt-2 mb-4">
        <DashboardHeader />
      </div>
      
      <div className="mb-4">
        <QuickActions />
      </div>
      
      <div className="mb-5">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 sm:h-28 md:h-32 rounded-lg" />
            ))}
          </div>
        ) : (
          <FinancialOverview data={financialData} />
        )}
      </div>

      <div className="mb-5">
        <MainContentSection 
          leftContent={
            <>
              {isLoading ? (
                <div className="space-y-4 sm:space-y-5">
                  <Skeleton className="h-[280px] sm:h-[300px] md:h-[320px] rounded-lg" />
                  <Skeleton className="h-[280px] sm:h-[300px] md:h-[320px] rounded-lg" />
                </div>
              ) : (
                <>
                  <CashflowSection />
                  <FinancialChartsSection />
                </>
              )}
            </>
          }
          rightContent={
            isLoading ? (
              <Skeleton className="h-[280px] sm:h-[300px] md:h-[320px] rounded-lg" />
            ) : (
              <TransactionsSection />
            )
          }
          bottomContent={
            isLoading ? (
              <Skeleton className="h-[150px] rounded-lg" />
            ) : (
              <AIInsights />
            )
          }
        />
      </div>
      
      <div className="mb-5">
        {isLoading ? (
          <Skeleton className="h-[150px] rounded-lg" />
        ) : (
          <BillsSection />
        )}
      </div>
    </DashboardContainer>
  );
};

export default Dashboard;
