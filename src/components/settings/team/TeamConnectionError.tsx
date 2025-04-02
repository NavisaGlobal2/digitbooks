
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCcw, WifiOff } from "lucide-react";

interface TeamConnectionErrorProps {
  error?: Error;
  onRetry?: () => void;
}

export const TeamConnectionError = ({ error, onRetry }: TeamConnectionErrorProps) => {
  return (
    <Alert className="my-8 border-amber-500 bg-amber-50">
      <WifiOff className="h-5 w-5 text-amber-500" />
      <AlertTitle className="text-amber-800">Connection Error</AlertTitle>
      <AlertDescription className="text-amber-700">
        <p className="mb-4">
          {error?.message || "Unable to connect to the database. Please check your internet connection."}
        </p>
        {onRetry && (
          <Button 
            variant="outline" 
            size="sm" 
            className="border-amber-500 text-amber-700 hover:bg-amber-100"
            onClick={onRetry}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Retry Connection
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};
