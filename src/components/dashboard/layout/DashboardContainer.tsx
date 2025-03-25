
import { ReactNode, useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardContainerProps {
  children: ReactNode;
}

const DashboardContainer = ({ children }: DashboardContainerProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Mobile Header with menu button */}
      <div className="md:hidden flex items-center h-16 border-b border-border px-4 bg-white">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="mr-4"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <span className="text-lg font-semibold">DigiBooks</span>
      </div>

      {/* Mobile Sidebar - Overlay when open */}
      <div 
        className={`md:hidden fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />
      
      <div 
        className={`fixed md:static h-full md:h-auto z-40 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-[240px]">
        {/* Top Header - Hidden on mobile */}
        <div className="hidden md:block">
          <Header />
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-3 sm:p-4 md:p-6 bg-background">
          <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContainer;
