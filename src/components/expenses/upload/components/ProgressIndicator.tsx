
import { Progress } from "@/components/ui/progress";
import { Loader2, X, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProgressIndicatorProps {
  progress: number;
  step: string | null;
  isVisible?: boolean;
  isWaitingForServer?: boolean;
  isProcessingPdf?: boolean;
  onCancel?: () => void;
}

const ProgressIndicator = ({ 
  progress, 
  step, 
  isVisible = true,
  isWaitingForServer = false,
  isProcessingPdf = false,
  onCancel
}: ProgressIndicatorProps) => {
  if (!isVisible) return null;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{step}</span>
        <div className="flex items-center gap-2">
          <span>{progress}%</span>
          {onCancel && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5" 
              onClick={onCancel}
              title="Cancel"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
      <Progress value={progress} className="h-2" />
      
      {progress > 90 && progress < 100 && !isWaitingForServer && !isProcessingPdf && (
        <p className="text-xs text-muted-foreground text-center animate-pulse">
          Processing large file, please wait...
        </p>
      )}
      
      {isProcessingPdf && (
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <FileImage className="h-3 w-3 animate-pulse" />
          <span>Converting PDF to images for OCR processing...</span>
        </div>
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
