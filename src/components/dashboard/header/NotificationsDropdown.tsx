
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Notification {
  id: number;
  title: string;
  read: boolean;
  time: string;
}

interface NotificationsDropdownProps {
  notifications: Notification[];
  unreadCount: number;
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
}

const NotificationsDropdown = ({ 
  notifications, 
  unreadCount, 
  setNotifications, 
  setUnreadCount 
}: NotificationsDropdownProps) => {
  
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
    
    // No toast needed here - UI feedback is sufficient
  };
  
  return (
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
      
      <DropdownMenuContent align="end" className="w-[280px] sm:w-80 bg-white">
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
  );
};

export default NotificationsDropdown;
