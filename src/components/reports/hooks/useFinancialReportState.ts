
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
    isCustomDateRange,
    setDateRange
  } = useReportGeneration();

  const handleDateRangeChange = (newDateRange: { startDate: Date; endDate: Date } | null) => {
    // Update the date range in the report generation state
    setDateRange(newDateRange);
  };

  const handleSelectReport = (reportType: string) => {
    // Use the current date range from the filter
    const displayPeriod = dateRange 
      ? `${format(dateRange.startDate, "MMM dd, yyyy")} - ${format(dateRange.endDate, "MMM dd, yyyy")}` 
      : "Custom Range";
      
    handleGenerateReport(reportType, displayPeriod, "pdf", dateRange || undefined);
  };

  // Function to generate a report with the current date range
  const handleGenerateWithCurrentDateRange = () => {
    if (!dateRange) {
      toast.error("Please select a date range first");
      return;
    }
    
    if (selectedReportType) {
      // If a report is already selected, regenerate it with the new date range
      const displayPeriod = `${format(dateRange.startDate, "MMM dd, yyyy")} - ${format(dateRange.endDate, "MMM dd, yyyy")}`;
      handleGenerateReport(selectedReportType, displayPeriod, "pdf", dateRange);
    } else {
      // If no report is selected, show dialog to select one
      setShowGenerateDialog(true);
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
    handleDateRangeChange,
    handleGenerateWithCurrentDateRange
  };
};
