
// Re-export edge function parser from the new module
export { 
  parseViaEdgeFunction, 
  getConnectionStats 
} from './edge-function';

// Export the PDF to image processor functionality
export { 
  processPdfAsImages,
  extractStructuredDataFromPdf
} from './edge-function/pdfToImageProcessor';

// Export the OCR.space processor
export {
  processPdfWithOcrSpace
} from './edge-function/ocrSpaceProcessor';
