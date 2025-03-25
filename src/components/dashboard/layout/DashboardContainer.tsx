
import { ReactNode } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";

interface DashboardContainerProps {
  children: ReactNode;
}

const DashboardContainer = ({ children }: DashboardContainerProps) => {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      {/* Sidebar - Hidden on mobile, visible on larger screens */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <Header />

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-6 bg-background">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContainer;
