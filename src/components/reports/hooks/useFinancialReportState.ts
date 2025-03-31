
import { useState, useEffect } from "react";
import { useReportGeneration } from "@/hooks/useReportGeneration";
import { TimelinePeriod } from "../filters/ReportDateFilter";
import { 
  startOfMonth, 
  endOfMonth, 
  subMonths,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  subYears
} from "date-fns";

export const useFinancialReportState = () => {
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<TimelinePeriod>("current-month");
  
  const {
    selectedReportType,
    reportPeriod,
    dateRange,
    handleGenerateReport,
    setSelectedReportType,
    isCustomDateRange
  } = useReportGeneration();

  const handlePeriodChange = (period: TimelinePeriod) => {
    setSelectedTimePeriod(period);

    // Generate appropriate date range based on selected period
    if (period !== "custom-range") {
      const today = new Date();
      let startDate: Date;
      let endDate: Date;

      switch (period) {
        case "current-month":
          startDate = startOfMonth(today);
          endDate = endOfMonth(today);
          break;
        case "last-month":
          const lastMonth = subMonths(today, 1);
          startDate = startOfMonth(lastMonth);
          endDate = endOfMonth(lastMonth);
          break;
        case "current-quarter":
          startDate = startOfQuarter(today);
          endDate = endOfQuarter(today);
          break;
        case "year-to-date":
          startDate = startOfYear(today);
          endDate = today;
          break;
        case "last-year":
          const lastYear = subYears(today, 1);
          startDate = startOfYear(lastYear);
          endDate = endOfYear(lastYear);
          break;
        default:
          startDate = startOfMonth(today);
          endDate = endOfMonth(today);
      }

      handleDateRangeChange({ startDate, endDate });
    }
  };

  const handleDateRangeChange = (newDateRange: { startDate: Date; endDate: Date } | null) => {
    // For now, we'll just store the date range, but we won't regenerate the report yet
    // The actual report generation will happen when a report type is selected
  };

  const handleSelectReport = (reportType: string) => {
    // Use the current date range from the filter
    const periodLabel = getPeriodLabel(selectedTimePeriod);
    handleGenerateReport(reportType, periodLabel, "pdf", dateRange || undefined);
  };

  const getPeriodLabel = (period: TimelinePeriod): string => {
    switch (period) {
      case "current-month": return "Current Month";
      case "last-month": return "Last Month";
      case "current-quarter": return "Current Quarter";
      case "year-to-date": return "Year to Date";
      case "last-year": return "Last Year";
      case "custom-range": return "Custom Range";
      default: return "Current Month";
    }
  };

  return {
    showGenerateDialog,
    setShowGenerateDialog,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    selectedReportType,
    reportPeriod,
    dateRange,
    handleGenerateReport,
    setSelectedReportType,
    isCustomDateRange,
    handleSelectReport,
    selectedTimePeriod,
    handlePeriodChange,
    handleDateRangeChange
  };
};
