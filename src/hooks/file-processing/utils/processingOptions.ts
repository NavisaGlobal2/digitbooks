
/**
 * Utility functions for creating and managing processing options
 */

/**
 * Creates standardized processing options for file processing
 */
export const createProcessingOptions = (preferredAIProvider: string, fileType?: string, options?: any) => {
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
