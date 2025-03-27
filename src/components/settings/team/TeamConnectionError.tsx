
import { AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface TeamConnectionErrorProps {
  onRetry: () => void;
}

export const TeamConnectionError = ({ onRetry }: TeamConnectionErrorProps) => {
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4 mr-2" />
      <AlertTitle>Database Connection Error</AlertTitle>
      <AlertDescription className="space-y-4">
        <p>Unable to connect to the database server. This could be due to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Internet connection issues</li>
          <li>The database service is temporarily unavailable</li>
          <li>Server maintenance in progress</li>
        </ul>
        <Button 
          onClick={onRetry}
          className="mt-4 flex items-center"
          variant="outline"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry Connection
        </Button>
      </AlertDescription>
    </Alert>
  );
};
