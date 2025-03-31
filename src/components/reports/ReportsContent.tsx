
import React from "react";
import RevenueSummaryReport from "./revenue-summary/RevenueSummaryReport";
import IncomeStatementReport from "./income-statement/IncomeStatementReport";
import ExpenseSummaryReport from "./expense-summary/ExpenseSummaryReport";
import ReportDateFilter from "./filters/ReportDateFilter";

interface ReportsContentProps {
  selectedReportType: string | null;
  reportPeriod: string;
  dateRange: { startDate: Date; endDate: Date } | null;
  isCustomDateRange: boolean;
  onBack: () => void;
  onSelectReport: (reportType: string) => void;
  onDateRangeChange: (range: { startDate: Date; endDate: Date } | null) => void;
  onGenerateReport: () => void;
}

export const ReportsContent: React.FC<ReportsContentProps> = ({
  selectedReportType,
  reportPeriod,
  dateRange,
  isCustomDateRange,
  onBack,
  onSelectReport,
  onDateRangeChange,
  onGenerateReport
}) => {
  if (selectedReportType === "revenue-summary") {
    return (
      <RevenueSummaryReport
        onBack={onBack}
        period={reportPeriod}
        dateRange={dateRange}
        onDirectGeneration={onGenerateReport}
      />
    );
  }

  if (selectedReportType === "income-statement") {
    return (
      <IncomeStatementReport
        onBack={onBack}
        period={reportPeriod}
        dateRange={dateRange}
        onDirectGeneration={onGenerateReport}
      />
    );
  }
  
  if (selectedReportType === "expense-summary") {
    return (
      <ExpenseSummaryReport
        onBack={onBack}
        period={reportPeriod}
        dateRange={dateRange}
        onDirectGeneration={onGenerateReport}
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {isCustomDateRange && dateRange && (
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">Select Date Range</h2>
          <ReportDateFilter 
            dateRange={dateRange}
            onChange={onDateRangeChange}
            onGenerateReport={onGenerateReport}
          />
        </div>
      )}
      
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <ReportCard
          title="Profit & loss statement"
          description="Revenue, COGS, Expenses, and Net Profit"
          variant="blue"
          onClick={() => onSelectReport("income-statement")}
        />
        
        <ReportCard
          title="Revenue summary"
          description="Breakdown of revenue by category"
          variant="green"
          onClick={() => onSelectReport("revenue-summary")}
        />
        
        <ReportCard
          title="Expense summary"
          description="Breakdown of expenses by category"
          variant="yellow"
          onClick={() => onSelectReport("expense-summary")}
        />
      </div>
    </div>
  );
};

interface ReportCardProps {
  title: string;
  description: string;
  variant: "blue" | "green" | "yellow";
  onClick: () => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({
  title,
  description,
  variant,
  onClick
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "blue":
        return "bg-blue-50 border-blue-200 hover:border-blue-300";
      case "green":
        return "bg-green-50 border-green-200 hover:border-green-300";
      case "yellow":
        return "bg-yellow-50 border-yellow-200 hover:border-yellow-300";
      default:
        return "bg-gray-50 border-gray-200 hover:border-gray-300";
    }
  };

  return (
    <div
      className={`cursor-pointer rounded-lg border-2 p-6 transition-all duration-200 ${getVariantClasses()}`}
      onClick={onClick}
    >
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
};
