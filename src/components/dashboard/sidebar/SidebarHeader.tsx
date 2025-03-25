
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { ChevronLeft, Menu } from "lucide-react";

interface SidebarHeaderProps {
  isCollapsed: boolean;
  isMobileView: boolean;
  onToggleCollapse: () => void;
}

const SidebarHeader = ({ isCollapsed, isMobileView, onToggleCollapse }: SidebarHeaderProps) => {
  return (
    <div className="px-4 mb-6 flex items-center justify-between">
      {!isCollapsed ? (
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8" />
          <span className="font-semibold text-lg text-gray-800">DigiBooks</span>
        </div>
      ) : (
        <Logo className="h-8 w-8 mx-auto" />
      )}
      
      {!isMobileView && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 rounded-full"
          onClick={onToggleCollapse}
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      )}
    </div>
  );
};

export default SidebarHeader;
