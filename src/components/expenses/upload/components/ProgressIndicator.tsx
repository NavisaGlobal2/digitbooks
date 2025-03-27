
import { Progress } from "@/components/ui/progress";

interface ProgressIndicatorProps {
  progress: number;
  step: string;
  isVisible: boolean;
}

const ProgressIndicator = ({ progress, step, isVisible }: ProgressIndicatorProps) => {
  if (!isVisible) return null;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{step}</span>
        <span>{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
      {progress > 90 && progress < 100 && (
        <p className="text-xs text-muted-foreground text-center animate-pulse">
          Processing large file, please wait...
        </p>
      )}
      {progress === 90 && (
        <p className="text-xs text-muted-foreground text-center">
          Waiting for server response...
        </p>
      )}
    </div>
  );
};

export default ProgressIndicator;
