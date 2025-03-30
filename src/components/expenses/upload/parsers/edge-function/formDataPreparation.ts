
/**
 * Prepare form data for the edge function request
 */
export const prepareFormData = (file: File, options: any = {}) => {
  // Create the form data object
  const formData = new FormData();
  formData.append('file', file);
  
  // Add all options as form data fields
  Object.entries(options).forEach(([key, value]) => {
    formData.append(key, String(value));
  });
  
  // Add standard fields
  formData.append('useAI', String(options.preferredProvider !== 'none'));
  formData.append('preferredProvider', options.preferredProvider || 'anthropic');
  formData.append('useVision', String(options.useVision || false));
  formData.append('forceRealData', String(options.forceRealData || false));
  formData.append('context', options.context || 'expense');
  formData.append('extractRealData', String(options.extractRealData || false));
  formData.append('noDummyData', String(options.noDummyData || false));
  
  // Determine if this is a PDF file
  const isPdf = file.name.toLowerCase().endsWith('.pdf');
  
  // Track PDF processing attempts
  const pdfAttemptCount = isPdf ? 1 : 0;
  
  return { formData, isPdf, pdfAttemptCount };
};
