
import React from "react";
import { ReportView } from "./ReportView";
import { ReportList } from "./ReportList";
import ReportDateFilter from "./filters/ReportDateFilter";
import SavedReportsSection from "./saved/SavedReportsSection";

interface ReportsContentProps {
  selectedReportType: string | null;
  reportPeriod: string;
  dateRange: { startDate: Date; endDate: Date } | null;
  isCustomDateRange: boolean;
  onBack: () => void;
  onSelectReport: (reportType: string) => void;
  onDateRangeChange: (range: { startDate: Date; endDate: Date } | null) => void;
  onGenerateReport?: () => void;
}

export const ReportsContent: React.FC<ReportsContentProps> = ({
  selectedReportType,
  reportPeriod,
  dateRange,
  isCustomDateRange,
  onBack,
  onSelectReport,
  onDateRangeChange,
  onGenerateReport,
}) => {
  return (
    <div className="max-w-5xl mx-auto w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">
          {selectedReportType ? "Report Details" : "Financial Reports"}
        </h2>
        <p className="text-muted-foreground mb-5">
          {selectedReportType 
            ? "View and export your financial report" 
            : "Generate financial reports and export them to analyze your business performance"}
        </p>
        <div className="mb-4">
          <ReportDateFilter
            dateRange={dateRange}
            onDateRangeChange={onDateRangeChange}
            onGenerateReport={onGenerateReport}
          />
        </div>
      </div>

      {selectedReportType ? (
        <ReportView
          selectedReportType={selectedReportType}
          reportPeriod={reportPeriod}
          dateRange={dateRange}
          isCustomDateRange={isCustomDateRange}
          onBack={onBack}
        />
      ) : (
        <div className="space-y-8">
          <ReportList onSelectReport={onSelectReport} />
          <SavedReportsSection />
        </div>
      )}
    </div>
  );
};
