
import { getAuthToken, sleep } from "./retryHandler";
import { trackSuccessfulConnection, trackFailedConnection } from "./connectionStats";
import { showFallbackMessage } from "./index";
import { handleFallbackProcessing } from "./fallbackHandler";

const MAX_RETRIES = 3;

export const parseViaEdgeFunction = async (fileContent: string, fileType: string) => {
  let retries = 0;
  
  while (retries < MAX_RETRIES) {
    try {
      // Get authentication token
      const authToken = getAuthToken();
      if (!authToken) {
        throw new Error("Authentication failed");
      }
      
      // Here would be the actual API call to the edge function
      // For now, we'll simulate it:
      await sleep(500); // Simulate network delay
      
      const mockResponse = {
        success: true,
        data: {
          transactions: [
            { date: "2023-05-01", description: "Coffee Shop", amount: 4.50 },
            { date: "2023-05-02", description: "Grocery Store", amount: 65.32 }
          ]
        }
      };
      
      // Track successful connection
      trackSuccessfulConnection("edge-function");
      
      return mockResponse;
    } catch (error) {
      retries++;
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      trackFailedConnection(errorMessage, "edge-function");
      
      if (retries >= MAX_RETRIES) {
        showFallbackMessage("Using fallback processing after multiple failed attempts");
        return handleFallbackProcessing(fileContent);
      }
      
      // Wait before retry
      await sleep(1000 * retries);
    }
  }
  
  // Should never reach here but TypeScript needs a return
  return { success: false, error: "Failed to process" };
};
