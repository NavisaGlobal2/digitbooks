
import { useState } from "react";

export const useServerProcessing = () => {
  const [isWaitingForServer, setIsWaitingForServer] = useState(false);
  
  const createProcessingOptions = (options?: any, preferredAIProvider: string, fileType?: string) => {
    const isPdf = fileType === 'pdf';
    
    // Create a standardized options object
    const processingOptions: Record<string, any> = {
      // Use passed provider or default
      preferredProvider: options?.preferredProvider || preferredAIProvider
    };
    
    // Handle Vision API option for PDFs
    if (isPdf) {
      // Use the explicit useVision option if provided, otherwise default to true
      const useVision = options?.useVision !== undefined ? options.useVision : true;
      processingOptions.useVision = useVision;
      console.log(`Setting useVision flag to: ${useVision}`);
    }
    
    // Add any additional options
    if (options) {
      if (options.forceRealData) processingOptions.forceRealData = true;
      if (options.extractRealData) processingOptions.extractRealData = true;
      if (options.noDummyData) processingOptions.noDummyData = true;
    }
    
    return processingOptions;
  };

  return {
    isWaitingForServer,
    setIsWaitingForServer,
    createProcessingOptions
  };
};
