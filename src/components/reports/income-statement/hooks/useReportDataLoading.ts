
import { useState } from "react";

/**
 * Custom hook to handle report data loading state
 */
export const useReportDataLoading = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  return {
    isLoading,
    setIsLoading
  };
};
