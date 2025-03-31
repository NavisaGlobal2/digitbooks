
import { useState } from "react";
import { useReportGeneration } from "@/hooks/useReportGeneration";

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

  const handleSelectReport = (reportType: string) => {
    setSelectedReportType(reportType);
  };

  const handleDateRangeChange = (range: { startDate: Date; endDate: Date } | null) => {
    setDateRange(range);
  };

  const handleGenerateWithCurrentDateRange = () => {
    if (!dateRange) return;
    
    handleGenerateReport(
      selectedReportType || "custom-report",
      "Custom Range",
      "pdf",
      dateRange
    );
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
