
import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface SidebarLinkProps {
  to: string;
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
}

const SidebarLink = ({ to, icon: Icon, label, isActive, isCollapsed }: SidebarLinkProps) => {
  return (
    <Link to={to}>
      <Button 
        variant="ghost" 
        className={`w-full justify-${isCollapsed ? 'center' : 'start'} gap-3 ${isActive
          ? 'text-primary font-medium bg-accent/10 border-r-4 border-primary' 
          : 'text-secondary'}`}
      >
        <Icon className="h-5 w-5" />
        {!isCollapsed && <span>{label}</span>}
      </Button>
    </Link>
  );
};

export default SidebarLink;
