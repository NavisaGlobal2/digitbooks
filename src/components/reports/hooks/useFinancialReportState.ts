
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
    isCustomDateRange
  } = useReportGeneration();

  const handleSelectReport = (reportType: string) => {
    handleGenerateReport(reportType, "Current Month", "pdf");
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
    handleSelectReport
  };
};
