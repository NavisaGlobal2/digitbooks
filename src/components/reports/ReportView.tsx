
import React from "react";
import IncomeStatementReport from "./income-statement";
import GenericReportView from "./GenericReportView";
import CashFlowReport from "./cash-flow";
import ExpenseSummaryReport from "./expense-summary";
import RevenueSummaryReport from "./revenue-summary";
import BudgetAnalysisReport from "./budget-analysis";
import ProfitLossReport from "./profit-loss";

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
  if (!selectedReportType) return null;

  switch (selectedReportType) {
    case "income-statement":
      return (
        <IncomeStatementReport 
          onBack={onBack}
          period={reportPeriod}
          dateRange={dateRange}
        />
      );
    case "cash-flow":
      return (
        <CashFlowReport
          onBack={onBack}
          period={reportPeriod}
          dateRange={dateRange}
        />
      );
    case "expense-summary":
      return (
        <ExpenseSummaryReport 
          onBack={onBack}
          period={reportPeriod}
          dateRange={dateRange}
        />
      );
    case "revenue-summary":
      return (
        <RevenueSummaryReport 
          onBack={onBack}
          period={reportPeriod}
          dateRange={dateRange}
        />
      );
    case "budget-analysis":
      return (
        <BudgetAnalysisReport 
          onBack={onBack}
          period={reportPeriod}
          dateRange={dateRange}
        />
      );
    case "profit-loss":
      return (
        <ProfitLossReport 
          onBack={onBack}
          period={reportPeriod}
          dateRange={dateRange}
        />
      );
    default:
      return (
        <GenericReportView 
          reportType={selectedReportType} 
          onBack={onBack} 
        />
      );
  }
};
