
import React from "react";
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
  // Direct report download function for PDF download
  const handleDirectDownload = async () => {
    if (!selectedReportType || !dateRange) {
      toast.error("Cannot generate report: Missing report type or date range");
      return;
    }
    
    toast.info(`Please wait while we generate your PDF...`);
    
    // The actual download will be handled by the component's built-in download function
    // This function is just a placeholder now to maintain the interface
  };

  if (!selectedReportType) return null;

  switch (selectedReportType) {
    case "income-statement":
      return (
        <IncomeStatementReport 
          onBack={onBack}
          period={reportPeriod}
          dateRange={dateRange}
          onDirectGeneration={handleDirectDownload}
        />
      );
    case "cash-flow":
      return (
        <CashFlowReport
          onBack={onBack}
          period={reportPeriod}
          dateRange={dateRange}
          onDirectGeneration={handleDirectDownload}
        />
      );
    case "expense-summary":
      return (
        <ExpenseSummaryReport 
          onBack={onBack}
          period={reportPeriod}
          dateRange={dateRange}
          onDirectGeneration={handleDirectDownload}
        />
      );
    case "revenue-summary":
      return (
        <RevenueSummaryReport 
          onBack={onBack}
          period={reportPeriod}
          dateRange={dateRange}
          onDirectGeneration={handleDirectDownload}
        />
      );
    case "budget-analysis":
      return (
        <BudgetAnalysisReport 
          onBack={onBack}
          period={reportPeriod}
          dateRange={dateRange}
          onDirectGeneration={handleDirectDownload}
        />
      );
    case "profit-loss":
      return (
        <ProfitLossReport 
          onBack={onBack}
          period={reportPeriod}
          dateRange={dateRange}
          onDirectGeneration={handleDirectDownload}
        />
      );
    default:
      return (
        <GenericReportView 
          reportType={selectedReportType} 
          onBack={onBack} 
          dateRange={dateRange}
          onDirectGeneration={handleDirectDownload}
        />
      );
  }
};
