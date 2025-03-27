
import { useState, useCallback } from "react";
import { toast } from "sonner";

/**
 * Custom hook to manage upload error states and handling
 */
export const useUploadError = () => {
  const [error, setError] = useState<string | null>(null);

  /**
   * Handles error messages and updates the error state
   * @param errorMessage - The error message to display
   * @returns Boolean indicating if the error was fatal (false) or can be recovered from (true)
   */
  const handleError = useCallback((errorMessage: string): boolean => {
    setError(errorMessage);
    return false;
  }, []);

  /**
   * Clears the current error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Shows a fallback message toast to the user
   * @param message - Optional custom message to display (defaults to a standard fallback message)
   */
  const showFallbackMessage = useCallback((message: string = "Falling back to client-side parsing") => {
    toast.info(message);
  }, []);

  return {
    error,
    setError,
    handleError,
    clearError,
    showFallbackMessage
  };
};
