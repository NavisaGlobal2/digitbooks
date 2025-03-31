
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFinancialReportState } from "./hooks/useFinancialReportState";
import { ReportsLayout } from "./layout/ReportsLayout";
import { ReportsContent } from "./ReportsContent";
import { GenerateReportDialog } from "./GenerateReportDialog";
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

  // This is the handler for the "Generate Report" button in reports view
  // It should only prepare the report without downloading
  const handleReportGeneration = () => {
    if (!dateRange?.startDate || !dateRange?.endDate) {
      toast.error("Please select a date range first");
      return;
    }
    
    toast.success(`Report view updated with selected date range`);
    
    // This will refresh the report with the selected date range
    // but won't trigger a download
    handleGenerateWithCurrentDateRange();
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
        onGenerateReport={selectedReportType ? handleReportGeneration : handleGenerateWithCurrentDateRange}
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
