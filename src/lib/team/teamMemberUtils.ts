
import { toast } from "sonner";

export const handleTeamError = (error: any, defaultMessage: string): void => {
  console.error(defaultMessage, error);
  
  if (error.message && error.message.includes("permission denied")) {
    toast.error("Permission issue. Please contact an administrator.");
  } else if (error.message && (
    error.message.includes("Failed to fetch") || 
    error.message.includes("NetworkError") ||
    error.message.includes("Network request failed") ||
    error.message.includes("Connection failed"))) {
    toast.error("Database connection failed", {
      description: "Please check your internet connection and try again"
    });
  } else {
    toast.error(error.message || defaultMessage);
  }
};
