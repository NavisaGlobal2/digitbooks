
import { ReactNode, useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardContainerProps {
  children: ReactNode;
}

const DashboardContainer = ({ children }: DashboardContainerProps) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      {/* Desktop Sidebar - Hidden on mobile, visible on larger screens */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar - Visible only when toggled on small screens */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 bg-background md:hidden">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Menu</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full" 
                onClick={toggleMobileSidebar}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto">
              <Sidebar />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <div className="relative z-20">
          <Header />
          {/* Mobile menu button - Only shown on mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden absolute left-4 top-1/2 transform -translate-y-1/2 rounded-full"
            onClick={toggleMobileSidebar}
          >
            <Menu className="h-5 w-5 text-secondary" />
          </Button>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-3 sm:p-4 md:p-6 bg-background">
          <div className="max-w-7xl mx-auto space-y-4 md:space-y-6 w-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContainer;
