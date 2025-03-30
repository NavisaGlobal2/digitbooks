
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ProcessingModeToggleProps {
  useEdgeFunction: boolean;
  toggleEdgeFunction: () => void;
  edgeFunctionAvailable: boolean;
  disabled?: boolean;
  isAuthenticated?: boolean;
  preferredAIProvider?: string;
  setPreferredAIProvider?: (provider: string) => void;
  useVisionApi?: boolean;
  setUseVisionApi?: (useVision: boolean) => void;
  isPdfFile?: boolean;
}

const ProcessingModeToggle = ({
  useEdgeFunction,
  toggleEdgeFunction,
  edgeFunctionAvailable,
  disabled = false,
  isAuthenticated,
  preferredAIProvider,
  setPreferredAIProvider,
  useVisionApi = true,
  setUseVisionApi,
  isPdfFile = false
}: ProcessingModeToggleProps) => {
  // Handle AI provider change
  const handleProviderChange = (value: string) => {
    if (setPreferredAIProvider) {
      setPreferredAIProvider(value);
    }
  };
  
  // Handle Vision API toggle
  const handleVisionApiToggle = () => {
    if (setUseVisionApi) {
      setUseVisionApi(!useVisionApi);
    }
  };

  return (
    <div className="space-y-3 rounded-md border p-4">
      <div className="font-medium">Processing Options</div>
      
      {isAuthenticated && (
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="ai-provider" className="text-sm font-medium">
              AI Provider
            </Label>
            <Select
              value={preferredAIProvider || 'anthropic'}
              onValueChange={handleProviderChange}
              disabled={disabled}
            >
              <SelectTrigger id="ai-provider" className="w-full">
                <SelectValue placeholder="Select AI Provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="anthropic">Claude (Anthropic)</SelectItem>
                <SelectItem value="deepseek">DeepSeek</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Select your preferred AI provider for document processing
            </p>
          </div>
          
          {isPdfFile && (
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <div className="flex items-center">
                  <Label htmlFor="use-vision-api" className="text-sm font-medium">
                    Use Vision API
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="ml-1 h-4 w-4 cursor-help text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="w-[220px] text-xs">
                          Vision API helps extract text from PDFs with better accuracy. 
                          <strong>Required for real data extraction.</strong>
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-xs text-muted-foreground">
                  <strong className="text-green-600">Recommended</strong> for accurate PDF text extraction
                </p>
              </div>
              <Switch
                id="use-vision-api"
                checked={useVisionApi}
                onCheckedChange={handleVisionApiToggle}
                disabled={disabled}
              />
            </div>
          )}
        </div>
      )}

      {!isAuthenticated && (
        <p className="text-sm text-amber-500">
          Sign in to access advanced AI processing options
        </p>
      )}
    </div>
  );
};

export default ProcessingModeToggle;
