
import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";

interface ReportsLayoutProps {
  children: React.ReactNode;
  onGenerateReport: () => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  showGenerateButton?: boolean;
}

export const ReportsLayout: React.FC<ReportsLayoutProps> = ({
  children,
  onGenerateReport,
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
  showGenerateButton = true
}) => {
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
          
          {showGenerateButton && (
            <Button 
              className="bg-green-500 hover:bg-green-600 text-white"
              onClick={onGenerateReport}
            >
              Generate Report
            </Button>
          )}
        </header>

        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
