
import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TeamConnectionErrorProps {
  onRetry: () => void;
}

export const TeamConnectionError = ({ onRetry }: TeamConnectionErrorProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-lg border border-yellow-200 bg-yellow-50 text-yellow-800">
      <WifiOff className="h-12 w-12 text-yellow-500 mb-4" />
      <h3 className="text-lg font-medium mb-2">Connection Error</h3>
      <p className="text-center text-yellow-700 mb-4">
        Could not connect to the database. Check your internet connection and try again.
      </p>
      <Button onClick={onRetry} variant="outline" className="flex items-center gap-2">
        <RefreshCw className="h-4 w-4" />
        Retry Connection
      </Button>
    </div>
  );
};
