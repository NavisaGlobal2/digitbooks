
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import SidebarHeader from "./sidebar/SidebarHeader";
import SidebarNav from "./sidebar/SidebarNav";
import SidebarUserProfile from "./sidebar/SidebarUserProfile";

const Sidebar = () => {
  const { logout, user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  // Check if we're in a mobile view on initial render and when window resizes
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };

    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    
    return () => {
      window.removeEventListener('resize', checkMobileView);
    };
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`${isCollapsed ? 'w-[70px]' : 'w-[240px]'} h-screen border-r border-border py-4 flex flex-col bg-white shadow-sm transition-all duration-300`}>
      <SidebarHeader 
        isCollapsed={isCollapsed} 
        isMobileView={isMobileView} 
        onToggleCollapse={toggleCollapse} 
      />
      
      <div className="flex-1 px-2">
        <SidebarNav isCollapsed={isCollapsed} />
      </div>

      <SidebarUserProfile 
        user={user} 
        isCollapsed={isCollapsed} 
        onLogout={logout} 
      />
    </div>
  );
};

export default Sidebar;
