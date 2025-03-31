
import React from "react";
import { ReportView } from "./ReportView";
import { ReportList } from "./ReportList";
import ReportDateFilter, { TimelinePeriod } from "./filters/ReportDateFilter";

interface ReportsContentProps {
  selectedReportType: string | null;
  reportPeriod: string;
  dateRange: { startDate: Date; endDate: Date } | null;
  isCustomDateRange: boolean;
  onBack: () => void;
  onSelectReport: (reportType: string) => void;
  onPeriodChange: (period: TimelinePeriod) => void;
  onDateRangeChange: (range: { startDate: Date; endDate: Date } | null) => void;
  selectedTimePeriod: TimelinePeriod;
}

export const ReportsContent: React.FC<ReportsContentProps> = ({
  selectedReportType,
  reportPeriod,
  dateRange,
  isCustomDateRange,
  onBack,
  onSelectReport,
  onPeriodChange,
  onDateRangeChange,
  selectedTimePeriod
}) => {
  return (
    <div>
      {!selectedReportType && (
        <ReportDateFilter
          selectedPeriod={selectedTimePeriod}
          dateRange={dateRange}
          onPeriodChange={onPeriodChange}
          onDateRangeChange={onDateRangeChange}
        />
      )}

      {selectedReportType ? (
        <ReportView
          selectedReportType={selectedReportType}
          reportPeriod={reportPeriod}
          dateRange={dateRange}
          isCustomDateRange={isCustomDateRange}
          onBack={onBack}
        />
      ) : (
        <ReportList onSelectReport={onSelectReport} />
      )}
    </div>
  );
};
