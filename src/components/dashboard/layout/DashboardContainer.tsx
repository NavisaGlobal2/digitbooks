
import { ReactNode, useState, useEffect, Suspense } from "react";
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
  const [isLoading, setIsLoading] = useState(true);

  // Add loading optimization 
  useEffect(() => {
    // Defer intensive rendering
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-background items-center justify-center">
        <div className="animate-pulse text-primary text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      {/* Background elements with deferred rendering */}
      <Suspense fallback={null}>
        <BackgroundElements />
      </Suspense>
      
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
