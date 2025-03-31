
/**
 * Extracts technical details from an error object for debugging
 * @param error - The error object
 * @returns A string with technical error details
 */
export const getTechnicalErrorDetails = (error: unknown): string => {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}\n${error.stack || ''}`;
  }
  
  return String(error);
};
