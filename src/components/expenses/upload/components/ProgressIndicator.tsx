
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

interface ProgressIndicatorProps {
  progress: number;
  step: string;
  isVisible: boolean;
  isWaitingForServer?: boolean;
}

const ProgressIndicator = ({ 
  progress, 
  step, 
  isVisible,
  isWaitingForServer = false
}: ProgressIndicatorProps) => {
  if (!isVisible) return null;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{step}</span>
        <span>{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
      
      {progress > 90 && progress < 100 && !isWaitingForServer && (
        <p className="text-xs text-muted-foreground text-center animate-pulse">
          Processing large file, please wait...
        </p>
      )}
      
      {isWaitingForServer && (
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Waiting for server response...</span>
        </div>
      )}
    </div>
  );
};

export default ProgressIndicator;
