
import { useState, useEffect } from "react";
import { Bell, Search, HelpCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const { user } = useAuth();
  const [businessName, setBusinessName] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
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
  }, [user]);
  
  const handleReportGeneration = () => {
    navigate("/reports");
  };

  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded);
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
          <div className="relative w-full max-w-[200px] sm:max-w-[260px]">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input 
              type="text" 
              placeholder="Search..."
              className="pl-8 pr-3 py-1.5 rounded-full border border-input bg-background w-full focus:outline-none focus:ring-1 focus:ring-primary text-xs sm:text-sm"
              autoFocus
              onBlur={() => setIsSearchExpanded(false)}
            />
          </div>
        ) : (
          <Button variant="ghost" size="icon" className="rounded-full relative hidden sm:flex" onClick={toggleSearch}>
            <Search className="h-5 w-5 text-secondary" />
          </Button>
        )}

        <Button variant="ghost" size="icon" className="rounded-full relative hidden sm:flex">
          <HelpCircle className="h-5 w-5 text-secondary" />
        </Button>
        
        <Button variant="ghost" size="icon" className="rounded-full relative hidden sm:flex">
          <Settings className="h-5 w-5 text-secondary" />
        </Button>
        
        <Button variant="ghost" size="icon" className="rounded-full relative">
          <Bell className="h-5 w-5 text-secondary" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></span>
        </Button>
        
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
