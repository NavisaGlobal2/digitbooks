
import { useState } from "react";
import { toast } from "sonner";

export const useUploadError = () => {
  const [error, setError] = useState<string | null>(null);

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    return false;
  };

  const clearError = () => {
    setError(null);
  };

  const showFallbackMessage = (message: string = "Falling back to client-side parsing") => {
    toast.info(message);
  };

  return {
    error,
    setError,
    handleError,
    clearError,
    showFallbackMessage
  };
};
