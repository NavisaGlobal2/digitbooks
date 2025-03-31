
import React, { useEffect, useState, useRef } from "react";
import { ReportActions } from "../income-statement/ReportActions";
import { useRevenue } from "@/contexts/RevenueContext";
import { useExpenses } from "@/contexts/ExpenseContext";
import ProfitLossHeader from "./ProfitLossHeader";
import ProfitLossSummaryCards from "./ProfitLossSummaryCards";
import ProfitLossTrendsChart from "./ProfitLossTrendsChart";
import ProfitLossSummaryTable from "./ProfitLossSummaryTable";
import ProfitLossMonthlyTable from "./ProfitLossMonthlyTable";
import { useProfitLossData } from "./hooks/useProfitLossData";

interface ProfitLossReportProps {
  onBack: () => void;
  period: string;
  dateRange: { startDate: Date; endDate: Date } | null;
  onDirectGeneration?: () => void; 
}

const ProfitLossReport: React.FC<ProfitLossReportProps> = ({
  onBack,
  period,
  dateRange,
  onDirectGeneration,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const { 
    totalRevenue, 
    totalExpenses, 
    netProfit, 
    profitMargin, 
    monthlySummary,
    formatCurrency,
    isLoading
  } = useProfitLossData(dateRange);

  // Prepare report data for storage
  const reportData = {
    financials: {
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin
    },
    monthlySummary
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ReportActions
        onBack={onBack}
        title="Profit & Loss"
        period={period}
        dateRange={dateRange}
        reportRef={reportRef}
        reportData={reportData}
        onDirectGeneration={onDirectGeneration}
      />

      <div
        ref={reportRef}
        className="bg-white p-8 rounded-lg shadow-sm border print:shadow-none"
      >
        <ProfitLossHeader period={period} dateRange={dateRange} />

        <div className="space-y-6">
          <ProfitLossSummaryCards 
            totalRevenue={totalRevenue}
            totalExpenses={totalExpenses}
            netProfit={netProfit}
            profitMargin={profitMargin}
            formatCurrency={formatCurrency}
          />

          <ProfitLossTrendsChart 
            monthlySummary={monthlySummary}
            formatCurrency={formatCurrency}
          />

          <ProfitLossSummaryTable 
            totalRevenue={totalRevenue}
            totalExpenses={totalExpenses}
            netProfit={netProfit}
            profitMargin={profitMargin}
            formatCurrency={formatCurrency}
          />

          <ProfitLossMonthlyTable 
            monthlySummary={monthlySummary}
            formatCurrency={formatCurrency}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfitLossReport;
