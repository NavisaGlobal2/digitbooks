
import React from "react";
import { ReportView } from "./ReportView";
import { ReportList } from "./ReportList";

interface ReportsContentProps {
  selectedReportType: string | null;
  reportPeriod: string;
  dateRange: { startDate: Date; endDate: Date } | null;
  isCustomDateRange: boolean;
  onBack: () => void;
  onSelectReport: (reportType: string) => void;
}

export const ReportsContent: React.FC<ReportsContentProps> = ({
  selectedReportType,
  reportPeriod,
  dateRange,
  isCustomDateRange,
  onBack,
  onSelectReport
}) => {
  return selectedReportType ? (
    <ReportView
      selectedReportType={selectedReportType}
      reportPeriod={reportPeriod}
      dateRange={dateRange}
      isCustomDateRange={isCustomDateRange}
      onBack={onBack}
    />
  ) : (
    <ReportList onSelectReport={onSelectReport} />
  );
};
