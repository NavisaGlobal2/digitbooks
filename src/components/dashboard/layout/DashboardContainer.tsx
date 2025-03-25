
import { ReactNode, useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import BackgroundElements from "./BackgroundElements";
import MobileSidebar from "./MobileSidebar";
import MobileMenuButton from "./MobileMenuButton";
import PageContent from "./PageContent";

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
      {/* Background elements */}
      <BackgroundElements />
      
      {/* Desktop Sidebar - Hidden on mobile, visible on larger screens */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar - Visible only when toggled on small screens */}
      <MobileSidebar 
        isOpen={isMobileSidebarOpen} 
        onClose={toggleMobileSidebar} 
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <div className="relative z-20">
          <Header />
          {/* Mobile menu button - Only shown on mobile */}
          <MobileMenuButton onClick={toggleMobileSidebar} />
        </div>

        {/* Page Content */}
        <PageContent>
          {children}
        </PageContent>
      </div>
    </div>
  );
};

export default DashboardContainer;
