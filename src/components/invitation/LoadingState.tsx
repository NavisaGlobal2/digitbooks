
import { Loader2 } from "lucide-react";

export const LoadingState = () => {
  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
      <div className="flex flex-col items-center space-y-3">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <h1 className="text-xl font-semibold text-center">Verifying invitation...</h1>
      </div>
    </div>
  );
};
