
import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatabaseSelector } from "./DatabaseSelector";

interface ReportsHeaderProps {
  onGenerateReport: () => void;
  onMobileMenuOpen: () => void;
  selectedDatabase: string;
  onDatabaseChange: (database: string) => void;
}

export const ReportsHeader: React.FC<ReportsHeaderProps> = ({ 
  onGenerateReport, 
  onMobileMenuOpen,
  selectedDatabase,
  onDatabaseChange
}) => {
  return (
    <header className="bg-white border-b px-4 sm:px-6 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          className="md:hidden text-muted-foreground p-1"
          onClick={onMobileMenuOpen}
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

      <div className="flex items-center gap-3">
        <DatabaseSelector 
          selectedDatabase={selectedDatabase}
          onDatabaseChange={onDatabaseChange}
        />
        
        <Button
          className="bg-green-500 hover:bg-green-600 text-white text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2"
          onClick={onGenerateReport}
        >
          <span className="hidden xs:inline">Generate Report</span>
          <span className="xs:hidden">Generate</span>
        </Button>
      </div>
    </header>
  );
};
