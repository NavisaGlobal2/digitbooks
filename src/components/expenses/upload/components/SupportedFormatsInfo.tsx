
import { Info, Download } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

interface SupportedFormatsInfoProps {
  isAuthenticated?: boolean;
  onDownloadTemplate?: () => void;
}

const SupportedFormatsInfo = ({ 
  isAuthenticated = true, 
  onDownloadTemplate 
}: SupportedFormatsInfoProps) => {
  return (
    <div className="text-xs text-muted-foreground mt-2">
      <div className="flex items-center gap-1 mb-1">
        <p>Supported format:</p>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-gray-400" />
            </TooltipTrigger>
            <TooltipContent>
              <p>CSV format only with date, description and amount columns</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <ul className="list-disc list-inside ml-2">
        <li>CSV files from most Nigerian banks</li>
        <li>Files should include date, description, and amount columns</li>
        <li>Maximum file size: 10MB</li>
      </ul>
      
      <div className="mt-3 flex flex-col space-y-1">
        <p className="font-medium">Don't have a CSV file?</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs flex items-center gap-1 w-fit"
          onClick={onDownloadTemplate}
        >
          <Download className="h-3 w-3" />
          Download CSV template
        </Button>
      </div>
    </div>
  );
};

export default SupportedFormatsInfo;
