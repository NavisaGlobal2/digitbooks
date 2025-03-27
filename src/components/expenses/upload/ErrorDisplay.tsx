
import { AlertCircle } from "lucide-react";

interface ErrorDisplayProps {
  error: string | null;
}

const ErrorDisplay = ({ error }: ErrorDisplayProps) => {
  if (!error) return null;
  
  return (
    <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-start space-x-2">
      <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
      <p className="text-sm">{error}</p>
    </div>
  );
};

export default ErrorDisplay;
