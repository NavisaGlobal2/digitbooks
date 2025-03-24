
import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import { ArrowLeft, BarChart3, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { GenerateReportDialog } from "@/components/reports/GenerateReportDialog";
import { ReportCard } from "@/components/reports/ReportCard";
import { toast } from "sonner";

const FinancialReports = () => {
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<string | null>(null);

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
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-semibold">Financial Reports</h1>
          </div>

          <Button
            className="bg-green-500 hover:bg-green-600 text-white"
            onClick={() => setShowGenerateDialog(true)}
          >
            Generate Report
          </Button>
        </header>

        <main className="flex-1 overflow-auto p-6">
          {selectedReportType ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setSelectedReportType(null)}
                  className="flex items-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Reports
                </Button>
                <Button
                  className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2"
                  onClick={() => {
                    toast.success("Report downloaded successfully!");
                  }}
                >
                  <Download className="h-4 w-4" />
                  Download Report
                </Button>
              </div>

              <div className="bg-white p-6 rounded-lg border shadow-sm">
                <div className="text-center mb-8">
                  <BarChart3 className="h-24 w-24 mx-auto text-green-500 mb-2" />
                  <h2 className="text-2xl font-bold">
                    {selectedReportType.charAt(0).toUpperCase() +
                      selectedReportType.slice(1).replace("-", " ")}{" "}
                    Report
                  </h2>
                  <p className="text-muted-foreground">
                    Generated on {new Date().toLocaleDateString()}
                  </p>
                </div>

                <div className="bg-gray-100 rounded-lg p-12 flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-muted-foreground">
                      Preview of the report would be displayed here
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">Available Reports</h2>
                <p className="text-muted-foreground">
                  Select a report type to generate or view
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
