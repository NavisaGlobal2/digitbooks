
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ProcessingModeToggleProps {
  title: string;
  description: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const ProcessingModeToggle = ({
  title,
  description,
  options,
  value,
  onChange,
  disabled = false
}: ProcessingModeToggleProps) => {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center">
        <Label htmlFor="processing-mode" className="text-sm font-medium">
          {title}
        </Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="ml-1 h-4 w-4 cursor-help text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="w-[220px] text-xs">{description}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger id="processing-mode">
          <SelectValue placeholder="Select option" />
        </SelectTrigger>
        <SelectContent>
          {options.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        {description}
      </p>
    </div>
  );
};

export default ProcessingModeToggle;
