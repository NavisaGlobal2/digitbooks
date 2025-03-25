
import { Button } from "@/components/ui/button";
import { ChevronRight, LogOut } from "lucide-react";

interface SidebarUserProfileProps {
  user: any; // Using any temporarily until we properly type this
  isCollapsed: boolean;
  onLogout: () => void;
}

const SidebarUserProfile = ({ user, isCollapsed, onLogout }: SidebarUserProfileProps) => {
  return (
    <div className="px-4 mt-auto border-t border-border pt-4">
      {!isCollapsed ? (
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
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-secondary ml-auto" />
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div className="h-2 w-3/4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
          </div>
        </div>
      ) : (
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
      )}
      
      <Button 
        variant="ghost" 
        className={`${isCollapsed ? 'w-10 h-10 p-0 rounded-full mx-auto' : 'w-full justify-start gap-2'} text-red-500 hover:text-red-600 hover:bg-red-50`}
        onClick={onLogout}
      >
        <LogOut className="h-4 w-4" />
        {!isCollapsed && <span>Logout</span>}
      </Button>
    </div>
  );
};

export default SidebarUserProfile;
