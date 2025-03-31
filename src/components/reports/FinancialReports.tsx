
import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import { GenerateReportDialog } from "@/components/reports/GenerateReportDialog";
import MobileSidebar from "../dashboard/layout/MobileSidebar";
import { useReportGeneration } from "@/hooks/useReportGeneration";
import { ReportsHeader } from "./ReportsHeader";
import { ReportList } from "./ReportList";
import { ReportView } from "./ReportView";

const FinancialReports = () => {
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  const {
    selectedReportType,
    reportPeriod,
    dateRange,
    selectedDatabase,
    handleGenerateReport,
    setSelectedReportType,
    setSelectedDatabase
  } = useReportGeneration();

  const handleSelectReport = (reportType: string) => {
    handleGenerateReport(reportType, "Current Month", "pdf");
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <ReportsHeader 
          onGenerateReport={() => setShowGenerateDialog(true)}
          onMobileMenuOpen={() => setIsMobileSidebarOpen(true)}
          selectedDatabase={selectedDatabase}
          onDatabaseChange={setSelectedDatabase}
        />

        <main className="flex-1 overflow-auto p-3 sm:p-6">
          {selectedReportType ? (
            <ReportView
              selectedReportType={selectedReportType}
              reportPeriod={reportPeriod}
              dateRange={dateRange}
              onBack={() => setSelectedReportType(null)}
            />
          ) : (
            <ReportList onSelectReport={handleSelectReport} />
          )}
        </main>
      </div>

      <GenerateReportDialog
        open={showGenerateDialog}
        onOpenChange={setShowGenerateDialog}
        onGenerate={handleGenerateReport}
      />
    </div>
  );
};

export default FinancialReports;
