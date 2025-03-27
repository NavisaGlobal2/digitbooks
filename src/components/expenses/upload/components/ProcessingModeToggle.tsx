
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ProcessingModeToggleProps {
  useEdgeFunction: boolean;
  toggleEdgeFunction: () => void;
  edgeFunctionAvailable: boolean;
  disabled: boolean;
  isAuthenticated?: boolean;
}

const ProcessingModeToggle = ({
  useEdgeFunction,
  toggleEdgeFunction,
  edgeFunctionAvailable,
  disabled,
  isAuthenticated = true
}: ProcessingModeToggleProps) => {
  // Determine if server-side processing needs auth warning
  const showAuthWarning = useEdgeFunction && !isAuthenticated;
  
  return (
    <div className="flex flex-col space-y-1">
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
                    <InfoCircledIcon className="h-4 w-4 text-amber-500" />
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
              ? "Processes your statement on the server for better accuracy" 
              : "Process and customize column mapping in the browser"}
          </span>
        </Label>
      </div>
      
      {showAuthWarning && (
        <p className="text-xs text-amber-500 mt-1">
          You need to be signed in to use server-side processing.
        </p>
      )}
    </div>
  );
};

export default ProcessingModeToggle;
