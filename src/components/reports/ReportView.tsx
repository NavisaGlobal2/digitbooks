
import React from "react";
import IncomeStatementReport from "./income-statement";
import GenericReportView from "./GenericReportView";

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
    case "revenue-summary":
    case "expense-summary":
    case "cash-flow":
    case "budget-analysis":
    case "profit-loss":
    default:
      return <GenericReportView reportType={selectedReportType} onBack={onBack} />;
  }
};
