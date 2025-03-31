
import { useState, useEffect } from "react";
import { useReportGeneration } from "@/hooks/useReportGeneration";
import { format } from "date-fns";
import { toast } from "sonner";

export const useFinancialReportState = () => {
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  const {
    selectedReportType,
    reportPeriod,
    dateRange,
    handleGenerateReport,
    setSelectedReportType,
    isCustomDateRange
  } = useReportGeneration();

  const handleDateRangeChange = (newDateRange: { startDate: Date; endDate: Date } | null) => {
    // For now, we'll just store the date range, but we won't regenerate the report yet
    // The actual report generation will happen when a report type is selected
  };

  const handleSelectReport = (reportType: string) => {
    // Use the current date range from the filter
    const displayPeriod = dateRange 
      ? `${format(dateRange.startDate, "MMM dd, yyyy")} - ${format(dateRange.endDate, "MMM dd, yyyy")}` 
      : "Custom Range";
      
    handleGenerateReport(reportType, displayPeriod, "pdf", dateRange || undefined);
  };

  // New function to generate a report with the current date range
  const handleGenerateWithCurrentDateRange = () => {
    if (!dateRange) {
      toast.error("Please select a date range first");
      return;
    }
    
    // Show report type selection prompt
    setShowGenerateDialog(true);
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
    handleDateRangeChange,
    handleGenerateWithCurrentDateRange
  };
};
