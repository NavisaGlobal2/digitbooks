
import React from "react";
import { generateReportPdf } from "@/utils/reports/reportPdfGenerator";
import IncomeStatementReport from "./income-statement";
import GenericReportView from "./GenericReportView";
import CashFlowReport from "./cash-flow";
import ExpenseSummaryReport from "./expense-summary";
import RevenueSummaryReport from "./revenue-summary";
import BudgetAnalysisReport from "./budget-analysis";
import ProfitLossReport from "./profit-loss";
import { toast } from "sonner";
import { format } from "date-fns";

interface ReportViewProps {
  selectedReportType: string | null;
  reportPeriod: string;
  dateRange: { startDate: Date; endDate: Date } | null;
  isCustomDateRange: boolean;
  onBack: () => void;
}

export const ReportView: React.FC<ReportViewProps> = ({
  selectedReportType,
  reportPeriod,
  dateRange,
  isCustomDateRange,
  onBack,
}) => {
  // Direct report generation function
  const handleDirectGeneration = () => {
    if (!selectedReportType || !dateRange) return;
    
    const title = selectedReportType.charAt(0).toUpperCase() + 
                  selectedReportType.slice(1).replace(/-/g, " ");
    
    const period = `${format(dateRange.startDate, "MMM dd, yyyy")} — ${format(dateRange.endDate, "MMM dd, yyyy")}`;
    
    generateReportPdf({
      title,
      period,
      dateRange
    });
    
    toast.success(`${title} report generated and downloaded successfully`);
  };

  if (!selectedReportType) return null;

  switch (selectedReportType) {
    case "income-statement":
      return (
        <IncomeStatementReport 
          onBack={onBack}
          period={reportPeriod}
          dateRange={dateRange}
          onDirectGeneration={handleDirectGeneration}
        />
      );
    case "cash-flow":
      return (
        <CashFlowReport
          onBack={onBack}
          period={reportPeriod}
          dateRange={dateRange}
          onDirectGeneration={handleDirectGeneration}
        />
      );
    case "expense-summary":
      return (
        <ExpenseSummaryReport 
          onBack={onBack}
          period={reportPeriod}
          dateRange={dateRange}
          onDirectGeneration={handleDirectGeneration}
        />
      );
    case "revenue-summary":
      return (
        <RevenueSummaryReport 
          onBack={onBack}
          period={reportPeriod}
          dateRange={dateRange}
          onDirectGeneration={handleDirectGeneration}
        />
      );
    case "budget-analysis":
      return (
        <BudgetAnalysisReport 
          onBack={onBack}
          period={reportPeriod}
          dateRange={dateRange}
          onDirectGeneration={handleDirectGeneration}
        />
      );
    case "profit-loss":
      return (
        <ProfitLossReport 
          onBack={onBack}
          period={reportPeriod}
          dateRange={dateRange}
          onDirectGeneration={handleDirectGeneration}
        />
      );
    default:
      return (
        <GenericReportView 
          reportType={selectedReportType} 
          onBack={onBack} 
          dateRange={dateRange}
          onDirectGeneration={handleDirectGeneration}
        />
      );
  }
};
