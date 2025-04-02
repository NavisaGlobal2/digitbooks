
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw } from "lucide-react";

interface TeamErrorAlertProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  onRetry?: () => void;
}

export const TeamErrorAlert = ({ 
  title = "Error Loading Team Members", 
  description = "There was an error loading team members. Please try again.",
  actionLabel,
  onAction,
  onRetry
}: TeamErrorAlertProps) => {
  return (
    <Alert className="my-8 border-red-500 bg-red-50">
      <AlertCircle className="h-5 w-5 text-red-500" />
      <AlertTitle className="text-red-800">{title}</AlertTitle>
      <AlertDescription className="text-red-700">
        <p className="mb-4">{description}</p>
        <div className="flex gap-3">
          {onRetry && (
            <Button 
              variant="outline" 
              size="sm" 
              className="border-red-500 text-red-700 hover:bg-red-100"
              onClick={onRetry}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          )}
          {actionLabel && onAction && (
            <Button 
              variant="default" 
              size="sm"
              onClick={onAction}
            >
              {actionLabel}
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};
