
import { useState, useEffect } from "react";
import { Bell, Search, HelpCircle, Settings, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { user } = useAuth();
  const [businessName, setBusinessName] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchBusinessProfile = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('business_name')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error("Error fetching profile:", error);
          return;
        }
        
        if (data && data.business_name) {
          setBusinessName(data.business_name);
        }
      } catch (error) {
        console.error("Error fetching business profile:", error);
      }
    };
    
    fetchBusinessProfile();
    
    // Simulate fetching notifications
    setNotifications([
      { id: 1, title: "New invoice payment", read: false, time: "15m ago" },
      { id: 2, title: "Expense report due", read: false, time: "1h ago" },
      { id: 3, title: "Update available", read: true, time: "3h ago" }
    ]);
    setUnreadCount(2);
  }, [user]);
  
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
  
  const handleNotificationClick = (id: number) => {
    // Mark notification as read
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
    
    // Update unread count
    setUnreadCount(prev => Math.max(0, prev - 1));
    
    toast.success("Notification marked as read");
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = e.target as HTMLFormElement;
    const searchInput = target.elements.namedItem('search') as HTMLInputElement;
    
    if (searchInput && searchInput.value) {
      toast.success(`Searching for: ${searchInput.value}`);
      searchInput.value = '';
      setIsSearchExpanded(false);
    }
  };
  
  return (
    <header className="h-14 sm:h-16 border-b border-border px-3 sm:px-6 flex items-center justify-between bg-white shadow-sm z-10">
      <h1 className="text-base sm:text-xl font-bold ml-10 md:ml-0 truncate">
        {businessName ? 
          `Hi ${businessName}, let's get organized` : 
          "Welcome, let's get organized"}
      </h1>
      
      <div className="flex items-center gap-1 sm:gap-4">
        {/* Search - Collapsible on mobile, expanded on desktop */}
        {isSearchExpanded ? (
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-[200px] sm:max-w-[260px]">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input 
              type="text"
              name="search"
              placeholder="Search..."
              className="pl-8 pr-3 py-1.5 rounded-full border border-input bg-background w-full focus:outline-none focus:ring-1 focus:ring-primary text-xs sm:text-sm"
              autoFocus
              onBlur={(e) => {
                // Only collapse if no value and clicked outside
                if (!e.currentTarget.value) {
                  setIsSearchExpanded(false);
                }
              }}
            />
          </form>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full relative hidden sm:flex" onClick={toggleSearch}>
                  <Search className="h-5 w-5 text-secondary" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Search</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full relative hidden sm:flex"
                onClick={handleHelpClick}
              >
                <HelpCircle className="h-5 w-5 text-secondary" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Help</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full relative hidden sm:flex"
                onClick={handleSettingsClick}
              >
                <Settings className="h-5 w-5 text-secondary" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Settings</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <DropdownMenu>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full relative">
                    <Bell className="h-5 w-5 text-secondary" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                        {unreadCount > 9 ? (
                          <span className="text-[8px] text-white font-medium">9+</span>
                        ) : null}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Notifications</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <DropdownMenuContent align="end" className="w-80">
            <div className="px-4 py-2 font-medium">Notifications</div>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                No notifications yet
              </div>
            ) : (
              <>
                {notifications.map((notification) => (
                  <DropdownMenuItem 
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification.id)}
                    className="px-4 py-3 cursor-pointer flex flex-col items-start"
                  >
                    <div className="flex w-full justify-between items-start mb-1">
                      <span className={`text-sm ${notification.read ? 'font-normal' : 'font-medium'}`}>
                        {notification.title}
                      </span>
                      {!notification.read && (
                        <span className="h-2 w-2 bg-blue-500 rounded-full mt-1 ml-2"></span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{notification.time}</span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="p-2 text-center cursor-pointer">
                  <span className="text-sm text-blue-500 mx-auto">View all notifications</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button 
          className="bg-primary hover:bg-primary/90 text-white px-2 sm:px-4 py-1 rounded-full text-xs sm:text-sm hidden sm:flex"
          onClick={handleReportGeneration}
        >
          Generate Report
        </Button>
      </div>
    </header>
  );
};

export default Header;
