
import { AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface TeamErrorAlertProps {
  onRetry: () => void;
}

export const TeamErrorAlert = ({ onRetry }: TeamErrorAlertProps) => {
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4 mr-2" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Failed to load team members. There may be an issue with the database connection.
        <div className="mt-4">
          <Button 
            onClick={onRetry}
            className="bg-destructive/10 hover:bg-destructive/20 text-destructive px-3 py-1 rounded-md text-sm transition-colors flex items-center"
          >
            <RefreshCw className="h-3 w-3 mr-2" />
            Retry
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};
