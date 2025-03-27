
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TeamErrorAlertProps {
  onRetry: () => void;
}

export const TeamErrorAlert = ({ onRetry }: TeamErrorAlertProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-lg border border-red-200 bg-red-50 text-red-800">
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <h3 className="text-lg font-medium mb-2">Failed to load team members</h3>
      <p className="text-center text-red-600 mb-4">
        There was an error loading your team members. Please try again.
      </p>
      <Button onClick={onRetry} className="flex items-center gap-2">
        <RefreshCw className="h-4 w-4" />
        Try Again
      </Button>
    </div>
  );
};
