
import { Button } from "@/components/ui/button";
import { ChevronRight, LogOut } from "lucide-react";
import { User } from "@/integrations/supabase/types";

interface SidebarUserProfileProps {
  user: User | null;
  isCollapsed: boolean;
  onLogout: () => void;
}

const SidebarUserProfile = ({ user, isCollapsed, onLogout }: SidebarUserProfileProps) => {
  if (isCollapsed) {
    return (
      <div className="px-2 mt-auto border-t border-border pt-4">
        <div className="flex justify-center mb-4">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <span className="text-blue-600 font-bold text-sm">
                {user?.name?.charAt(0) || 'U'}
              </span>
            )}
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          className="w-full justify-center text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="px-4 mt-auto border-t border-border pt-4">
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <span className="text-blue-600 font-bold text-sm">
                {user?.name?.charAt(0) || 'U'}
              </span>
            )}
          </div>
          <div>
            <p className="font-medium text-sm">{user?.name || 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-secondary ml-auto" />
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div className="h-2 w-3/4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
        </div>
      </div>
      
      <Button 
        variant="ghost" 
        className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
        onClick={onLogout}
      >
        <LogOut className="h-4 w-4" />
        Logout
      </Button>
    </div>
  );
};

export default SidebarUserProfile;
