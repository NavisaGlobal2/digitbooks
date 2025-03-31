
import React from "react";
import { GenerateReportDialog } from "@/components/reports/GenerateReportDialog";
import { ReportsLayout } from "./layout/ReportsLayout";
import { ReportsContent } from "./ReportsContent";
import { useFinancialReportState } from "./hooks/useFinancialReportState";

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
    handleSelectReport
  } = useFinancialReportState();

  return (
    <>
      <ReportsLayout
        onGenerateReport={() => setShowGenerateDialog(true)}
        isMobileSidebarOpen={isMobileSidebarOpen}
        setIsMobileSidebarOpen={setIsMobileSidebarOpen}
      >
        <ReportsContent
          selectedReportType={selectedReportType}
          reportPeriod={reportPeriod}
          dateRange={dateRange}
          isCustomDateRange={isCustomDateRange}
          onBack={() => setSelectedReportType(null)}
          onSelectReport={handleSelectReport}
        />
      </ReportsLayout>

      <GenerateReportDialog
        open={showGenerateDialog}
        onOpenChange={setShowGenerateDialog}
        onGenerate={handleGenerateReport}
      />
    </>
  );
};

export default FinancialReports;
