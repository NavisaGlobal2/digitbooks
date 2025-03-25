
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LucideIcon } from "lucide-react";

interface HeaderActionProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  showOnMobile?: boolean;
}

const HeaderAction = ({ icon: Icon, label, onClick, showOnMobile = true }: HeaderActionProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`rounded-full relative ${!showOnMobile ? 'hidden sm:flex' : 'flex'}`}
            onClick={onClick}
          >
            <Icon className="h-5 w-5 text-secondary" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default HeaderAction;
