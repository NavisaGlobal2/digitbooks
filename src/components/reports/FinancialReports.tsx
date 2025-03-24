
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { ReportCard } from "@/components/reports/ReportCard";

const FinancialReports = () => {
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-semibold">Financial Reports</h1>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-semibold mb-2">Ready to gain financial Insights?</h2>
              <p className="text-muted-foreground">
                Create your first financial report to track your business performance
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <ReportCard
                title="Profit & loss statement"
                description="Revenue, COGS, Expenses, and Net Profit"
                variant="blue"
                onClick={() => setShowGenerateDialog(true)}
              />
              
              <ReportCard
                title="Balance sheet"
                description="Assets, Liabilities, and Equity"
                variant="yellow"
                onClick={() => setShowGenerateDialog(true)}
              />
              
              <ReportCard
                title="Cash flow statement"
                description="Operating, Investing, and Financing Activities"
                variant="green"
                onClick={() => setShowGenerateDialog(true)}
              />
            </div>

            <div className="flex justify-center">
              <Button 
                className="bg-green-500 hover:bg-green-600 text-white w-full max-w-md"
                onClick={() => setShowGenerateDialog(true)}
              >
                Generate custom report
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FinancialReports;
