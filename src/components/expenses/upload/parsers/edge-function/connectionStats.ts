
import { toast } from "sonner";

// Track connection statistics
const connectionStats = {
  attempts: 0,
  failures: 0,
  lastFailure: null as Date | null,
  failureReasons: {} as Record<string, number>
};

/**
 * Get connection statistics for edge function calls
 */
export const getConnectionStats = () => {
  return {
    ...connectionStats,
    failureRate: connectionStats.attempts > 0 
      ? Math.round((connectionStats.failures / connectionStats.attempts) * 100) 
      : 0
  };
};

/**
 * Track a successful connection attempt
 */
export const trackSuccessfulConnection = () => {
  connectionStats.attempts++;
};

/**
 * Track a failed connection attempt with a reason
 */
export const trackFailedConnection = (reason: string) => {
  connectionStats.attempts++;
  connectionStats.failures++;
  connectionStats.lastFailure = new Date();
  connectionStats.failureReasons[reason] = (connectionStats.failureReasons[reason] || 0) + 1;
};

/**
 * Show a toast message for fallback processing
 */
export const showFallbackMessage = (message: string = "Using local CSV parser as fallback") => {
  toast.success(message);
};
