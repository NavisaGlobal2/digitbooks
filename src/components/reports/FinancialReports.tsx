
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
    handleSelectReport,
    handleDateRangeChange,
    handleGenerateWithCurrentDateRange
  } = useFinancialReportState();

  return (
    <>
      <ReportsLayout
        onGenerateReport={() => setShowGenerateDialog(true)}
        isMobileSidebarOpen={isMobileSidebarOpen}
        setIsMobileSidebarOpen={setIsMobileSidebarOpen}
      >
        <div className="p-6">
          <ReportsContent
            selectedReportType={selectedReportType}
            reportPeriod={reportPeriod}
            dateRange={dateRange}
            isCustomDateRange={isCustomDateRange}
            onBack={() => setSelectedReportType(null)}
            onSelectReport={handleSelectReport}
            onDateRangeChange={handleDateRangeChange}
            onGenerateReport={handleGenerateWithCurrentDateRange}
          />
        </div>
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
