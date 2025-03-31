
import React, { ReactNode } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import MobileSidebar from "@/components/dashboard/layout/MobileSidebar";
import { ReportsHeader } from "@/components/reports/ReportsHeader";

interface ReportsLayoutProps {
  children: ReactNode;
  onGenerateReport: () => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (isOpen: boolean) => void;
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
          onGenerateReport={onGenerateReport}
          onMobileMenuOpen={() => setIsMobileSidebarOpen(true)}
          showGenerateButton={showGenerateButton}
        />

        <main className="flex-1 overflow-auto p-3 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
