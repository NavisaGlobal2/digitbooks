
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SupportedFormatsInfoProps {
  isAuthenticated?: boolean;
}

const SupportedFormatsInfo = ({ isAuthenticated = true }: SupportedFormatsInfoProps) => {
  return (
    <div className="text-xs text-muted-foreground mt-2">
      <div className="flex items-center gap-1 mb-1">
        <p>Supported formats:</p>
        {!isAuthenticated && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-amber-500" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Sign in to enable AI-powered processing for all file formats</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <ul className="list-disc list-inside ml-2">
        <li>CSV files from most Nigerian banks</li>
        <li>Excel files (.xlsx, .xls) with transaction data</li>
        <li>PDF files {!isAuthenticated && <span className="text-amber-500">(requires sign-in)</span>}</li>
        <li>Files should include date, description, and amount columns</li>
        <li>Maximum file size: 10MB</li>
      </ul>
      
      {!isAuthenticated && (
        <p className="mt-1 text-amber-500">
          Note: AI-powered processing requires authentication
        </p>
      )}
    </div>
  );
};

export default SupportedFormatsInfo;
