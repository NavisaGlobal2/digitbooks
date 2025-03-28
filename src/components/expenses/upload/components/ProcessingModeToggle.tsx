
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface ProcessingModeToggleProps {
  useEdgeFunction: boolean;
  toggleEdgeFunction: () => void;
  edgeFunctionAvailable: boolean;
  disabled: boolean;
  isAuthenticated?: boolean;
  preferredAIProvider?: string;
  setPreferredAIProvider?: (provider: string) => void;
}

const ProcessingModeToggle = ({
  useEdgeFunction,
  toggleEdgeFunction,
  edgeFunctionAvailable,
  disabled,
  isAuthenticated = true,
  preferredAIProvider = "anthropic",
  setPreferredAIProvider
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
              {useEdgeFunction ? "AI-powered processing" : "Client-side processing with column mapping"}
              {!edgeFunctionAvailable && " (server unavailable)"}
            </span>
            
            {showAuthWarning && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-amber-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Authentication required for AI-powered processing</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {useEdgeFunction 
              ? "Uses AI to intelligently extract transactions from any statement format" 
              : "Process and customize column mapping in the browser (CSV only)"}
          </span>
        </Label>
      </div>
      
      {showAuthWarning && (
        <p className="text-xs text-amber-500 mt-1">
          You need to be signed in to use AI-powered processing.
        </p>
      )}

      {useEdgeFunction && isAuthenticated && setPreferredAIProvider && (
        <div className="flex flex-col space-y-1 mt-2">
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
            Select your preferred AI provider for transaction extraction
          </span>
        </div>
      )}
    </div>
  );
};

export default ProcessingModeToggle;
