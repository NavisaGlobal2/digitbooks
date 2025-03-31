
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useReportGeneration } from "@/hooks/useReportGeneration";
import { ReportsLayout } from "./layout/ReportsLayout";
import { ReportsContent } from "./ReportsContent";
import { GenerateReportDialog } from "./GenerateReportDialog";

const FinancialReports = () => {
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();
  
  const {
    selectedReportType,
    reportPeriod,
    dateRange,
    handleGenerateReport,
    setSelectedReportType,
    isCustomDateRange,
    setDateRange
  } = useReportGeneration();

  const onGenerateReport = () => {
    setShowGenerateDialog(true);
  };

  const onBack = () => {
    setSelectedReportType(null);
  };

  // Hide the generate button in the header when a specific report is selected
  const showGenerateButton = !selectedReportType;

  return (
    <ReportsLayout
      onGenerateReport={onGenerateReport}
      isMobileSidebarOpen={isMobileSidebarOpen}
      setIsMobileSidebarOpen={setIsMobileSidebarOpen}
      showGenerateButton={showGenerateButton}
    >
      <ReportsContent
        selectedReportType={selectedReportType}
        reportPeriod={reportPeriod}
        dateRange={dateRange}
        isCustomDateRange={isCustomDateRange}
        onBack={onBack}
        onSelectReport={setSelectedReportType}
        onDateRangeChange={setDateRange}
        onGenerateReport={onGenerateReport}
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
