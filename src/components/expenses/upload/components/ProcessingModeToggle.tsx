
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ProcessingModeToggleProps {
  useEdgeFunction: boolean;
  toggleEdgeFunction: () => void;
  edgeFunctionAvailable: boolean;
  disabled: boolean;
}

const ProcessingModeToggle = ({
  useEdgeFunction,
  toggleEdgeFunction,
  edgeFunctionAvailable,
  disabled
}: ProcessingModeToggleProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Switch 
        id="server-processing" 
        checked={useEdgeFunction} 
        onCheckedChange={toggleEdgeFunction}
        disabled={!edgeFunctionAvailable || disabled}
      />
      <Label htmlFor="server-processing" className="flex flex-col">
        <span>
          {useEdgeFunction ? "Server-side processing" : "Client-side processing with column mapping"}
          {!edgeFunctionAvailable && " (server unavailable)"}
        </span>
        <span className="text-xs text-muted-foreground">
          {useEdgeFunction 
            ? "Processes your statement on the server for better accuracy" 
            : "Process and customize column mapping in the browser"}
        </span>
      </Label>
    </div>
  );
};

export default ProcessingModeToggle;
