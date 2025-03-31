
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
    selectedTimePeriod,
    handlePeriodChange,
    handleDateRangeChange
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
            selectedTimePeriod={selectedTimePeriod}
            onPeriodChange={handlePeriodChange}
            onDateRangeChange={handleDateRangeChange}
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
