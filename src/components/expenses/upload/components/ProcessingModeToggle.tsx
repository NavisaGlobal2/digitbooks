
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProcessingModeToggleProps {
  useEdgeFunction: boolean;
  toggleEdgeFunction: () => void;
  edgeFunctionAvailable: boolean;
  disabled: boolean;
  isAuthenticated?: boolean;
  preferredAIProvider?: string;
  setPreferredAIProvider?: (provider: string) => void;
  useAIFormatting?: boolean;
  setUseAIFormatting?: (value: boolean) => void;
}

const ProcessingModeToggle = ({
  useEdgeFunction,
  toggleEdgeFunction,
  edgeFunctionAvailable,
  disabled,
  isAuthenticated = true,
  preferredAIProvider = "anthropic",
  setPreferredAIProvider,
  useAIFormatting = true,
  setUseAIFormatting
}: ProcessingModeToggleProps) => {
  // Determine if server-side processing needs auth warning
  const showAuthWarning = useEdgeFunction && !isAuthenticated;
  
  return (
    <div className="flex flex-col space-y-3">
      <div className="flex items-center space-x-2">
        <Switch 
          id="server-processing" 
          checked={useEdgeFunction} 
          onCheckedChange={toggleEdgeFunction}
          disabled={!edgeFunctionAvailable || disabled || !isAuthenticated}
        />
        <Label htmlFor="server-processing" className="flex flex-col">
          <div className="flex items-center gap-1">
            <span>
              {useEdgeFunction ? "Server-side processing" : "Client-side processing with column mapping"}
              {!edgeFunctionAvailable && " (server unavailable)"}
            </span>
            
            {showAuthWarning && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-amber-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Authentication required for server-side processing</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {useEdgeFunction 
              ? "Process the file on our server to extract transactions" 
              : "Process and customize column mapping in the browser (CSV only)"}
          </span>
        </Label>
      </div>
      
      {showAuthWarning && (
        <p className="text-xs text-amber-500 mt-1">
          You need to be signed in to use server-side processing.
        </p>
      )}

      {useEdgeFunction && isAuthenticated && (
        <div className="flex flex-col space-y-3 mt-2">
          {setUseAIFormatting && (
            <div className="flex items-center space-x-2">
              <Switch 
                id="ai-formatting" 
                checked={useAIFormatting} 
                onCheckedChange={setUseAIFormatting}
                disabled={disabled}
              />
              <Label htmlFor="ai-formatting" className="flex flex-col">
                <span>Use AI for transaction formatting</span>
                <span className="text-xs text-muted-foreground">
                  Apply AI to standardize transaction data format (preserves all original data)
                </span>
              </Label>
            </div>
          )}
          
          {setPreferredAIProvider && (
            <div className="flex flex-col space-y-1">
              <Label htmlFor="ai-provider" className="text-sm">Preferred AI Provider</Label>
              <Select
                value={preferredAIProvider}
                onValueChange={setPreferredAIProvider}
                disabled={disabled}
              >
                <SelectTrigger id="ai-provider" className="w-[200px]">
                  <SelectValue placeholder="Select AI provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="anthropic">Anthropic Claude (Default)</SelectItem>
                  <SelectItem value="deepseek">DeepSeek AI</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground">
                Select your preferred AI provider for processing assistance
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProcessingModeToggle;
