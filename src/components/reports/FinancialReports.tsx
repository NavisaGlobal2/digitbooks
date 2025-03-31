
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFinancialReportState } from "./hooks/useFinancialReportState";
import { ReportsLayout } from "./layout/ReportsLayout";
import { ReportsContent } from "./ReportsContent";
import { GenerateReportDialog } from "./GenerateReportDialog";
import { generateReportPdf } from "@/utils/reports/reportPdfGenerator";
import { format } from "date-fns";
import { toast } from "sonner";

const FinancialReports = () => {
  const {
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
  } = useFinancialReportState();
  
  const navigate = useNavigate();

  // This is the direct generation handler for when in a specific report view
  const handleDirectGeneration = () => {
    if (!selectedReportType || !dateRange) {
      toast.error("Please select a date range first");
      return;
    }
    
    const title = selectedReportType.charAt(0).toUpperCase() + 
                 selectedReportType.slice(1).replace(/-/g, " ");
    
    const period = `${format(dateRange.startDate, "MMM dd, yyyy")} — ${format(dateRange.endDate, "MMM dd, yyyy")}`;
    
    generateReportPdf({
      title,
      period,
      dateRange
    });
    
    toast.success(`${title} report generated and downloaded successfully`);
  };

  // Main page - open dialog
  const onGenerateReport = () => {
    setShowGenerateDialog(true);
  };

  return (
    <ReportsLayout
      onGenerateReport={onGenerateReport}
      isMobileSidebarOpen={isMobileSidebarOpen}
      setIsMobileSidebarOpen={setIsMobileSidebarOpen}
      showGenerateButton={!selectedReportType}
    >
      <ReportsContent
        selectedReportType={selectedReportType}
        reportPeriod={reportPeriod}
        dateRange={dateRange}
        isCustomDateRange={isCustomDateRange}
        onBack={() => setSelectedReportType(null)}
        onSelectReport={handleSelectReport}
        onDateRangeChange={handleDateRangeChange}
        onGenerateReport={selectedReportType ? handleDirectGeneration : handleGenerateWithCurrentDateRange}
      />

      <GenerateReportDialog
        open={showGenerateDialog}
        onOpenChange={setShowGenerateDialog}
        onGenerate={handleGenerateReport}
      />
    </ReportsLayout>
  );
};

export default FinancialReports;
