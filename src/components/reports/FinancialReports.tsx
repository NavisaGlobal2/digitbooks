
import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import { ArrowLeft, BarChart3, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { GenerateReportDialog } from "@/components/reports/GenerateReportDialog";
import { ReportCard } from "@/components/reports/ReportCard";
import { toast } from "sonner";
import MobileSidebar from "../dashboard/layout/MobileSidebar";
import MobileMenuButton from "../dashboard/layout/MobileMenuButton";

const FinancialReports = () => {
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleGenerateReport = (
    reportType: string,
    reportPeriod: string,
    fileFormat: string
  ) => {
    toast.success(
      `Generating ${reportType.replace("-", " ")} report for ${reportPeriod.replace(
        "-",
        " "
      )} in ${fileFormat.toUpperCase()} format`
    );
    // In a real app, this would call an API to generate the report
    setTimeout(() => {
      toast.success("Report generated successfully!");
    }, 2000);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              className="md:hidden text-muted-foreground p-1"
              onClick={() => setIsMobileSidebarOpen(true)}
              aria-label="Open menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <Link
              to="/dashboard"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-lg sm:text-xl font-semibold">Financial Reports</h1>
          </div>

          <Button
            className="bg-green-500 hover:bg-green-600 text-white text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2"
            onClick={() => setShowGenerateDialog(true)}
          >
            <span className="hidden xs:inline">Generate Report</span>
            <span className="xs:hidden">Generate</span>
          </Button>
        </header>

        <main className="flex-1 overflow-auto p-3 sm:p-6">
          {selectedReportType ? (
            <div className="space-y-6">
              <div className="flex flex-col xs:flex-row items-center justify-between gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedReportType(null)}
                  className="flex items-center gap-1 w-full xs:w-auto"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Reports
                </Button>
                <Button
                  className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2 w-full xs:w-auto"
                  onClick={() => {
                    toast.success("Report downloaded successfully!");
                  }}
                >
                  <Download className="h-4 w-4" />
                  Download Report
                </Button>
              </div>

              <div className="bg-white p-4 sm:p-6 rounded-lg border shadow-sm">
                <div className="text-center mb-6 sm:mb-8">
                  <BarChart3 className="h-16 sm:h-24 w-16 sm:w-24 mx-auto text-green-500 mb-2" />
                  <h2 className="text-xl sm:text-2xl font-bold">
                    {selectedReportType.charAt(0).toUpperCase() +
                      selectedReportType.slice(1).replace("-", " ")}{" "}
                    Report
                  </h2>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    Generated on {new Date().toLocaleDateString()}
                  </p>
                </div>

                <div className="bg-gray-100 rounded-lg p-4 sm:p-12 flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="h-12 sm:h-16 w-12 sm:w-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-muted-foreground text-sm">
                      Preview of the report would be displayed here
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">Available Reports</h2>
                <p className="text-muted-foreground text-sm">
                  Select a report type to generate or view
                </p>
              </div>

              <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-3">
                <ReportCard
                  title="Income Statement"
                  description="Summary of revenues, costs, and expenses over a period"
                  variant="green"
                  onClick={() => setSelectedReportType("income-statement")}
                />
                <ReportCard
                  title="Cash Flow Statement"
                  description="Track cash inflows and outflows for your business"
                  variant="blue"
                  onClick={() => setSelectedReportType("cash-flow")}
                />
                <ReportCard
                  title="Expense Summary"
                  description="Breakdown of all expenses by category"
                  variant="yellow"
                  onClick={() => setSelectedReportType("expense-summary")}
                />
                <ReportCard
                  title="Revenue Summary"
                  description="Summary of all revenue sources and trends"
                  variant="green"
                  onClick={() => setSelectedReportType("revenue-summary")}
                />
                <ReportCard
                  title="Budget Analysis"
                  description="Compare actual spending against budget allocations"
                  variant="blue"
                  onClick={() => setSelectedReportType("budget-analysis")}
                />
                <ReportCard
                  title="Profit & Loss"
                  description="Detail of business performance and profitability"
                  variant="yellow"
                  onClick={() => setSelectedReportType("profit-loss")}
                />
              </div>
            </div>
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
