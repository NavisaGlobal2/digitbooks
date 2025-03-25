
import { useState, useEffect } from "react";
import { HelpCircle, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import BusinessGreeting from "./header/BusinessGreeting";
import SearchBar from "./header/SearchBar";
import HeaderAction from "./header/HeaderAction";
import NotificationsDropdown from "./header/NotificationsDropdown";
import GenerateReportButton from "./header/GenerateReportButton";
import AgentButton from "./AgentButton";

const Header = () => {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Simulate fetching notifications
    setNotifications([
      { id: 1, title: "New invoice payment", read: false, time: "15m ago" },
      { id: 2, title: "Expense report due", read: false, time: "1h ago" },
      { id: 3, title: "Update available", read: true, time: "3h ago" }
    ]);
    setUnreadCount(2);
  }, []);
  
  const handleReportGeneration = () => {
    navigate("/reports");
    toast.success("Navigating to reports page");
  };

  const handleSettingsClick = () => {
    navigate("/settings");
    toast.success("Opening settings");
  };

  const handleHelpClick = () => {
    navigate("/help");
    toast.success("Opening help center");
  };

  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded);
  };
  
  return (
    <header className="h-14 sm:h-16 border-b border-border px-3 sm:px-6 flex items-center justify-between bg-white shadow-sm z-10">
      <BusinessGreeting />
      
      <div className="flex items-center gap-1 sm:gap-4">
        <SearchBar 
          isExpanded={isSearchExpanded}
          toggleExpand={toggleSearch}
        />

        <HeaderAction 
          icon={HelpCircle}
          label="Help"
          onClick={handleHelpClick}
          showOnMobile={false}
        />
        
        <HeaderAction 
          icon={Settings}
          label="Settings"
          onClick={handleSettingsClick}
          showOnMobile={false}
        />
        
        <NotificationsDropdown 
          notifications={notifications}
          unreadCount={unreadCount}
          setNotifications={setNotifications}
          setUnreadCount={setUnreadCount}
        />
        
        <AgentButton />
        
        <GenerateReportButton onClick={handleReportGeneration} />
      </div>
    </header>
  );
};

export default Header;
