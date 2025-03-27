
import { corsHeaders } from "./cors.ts";

// Extract text from various file types
export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.name.split('.').pop()?.toLowerCase();
  
  if (fileType === 'pdf') {
    return `[THIS IS A PDF FILE: ${file.name}]\n\nPlease extract financial transactions from this PDF bank statement.`;
  } else if (fileType === 'csv') {
    return await file.text();
  } else if (fileType === 'xlsx' || fileType === 'xls') {
    return `[THIS IS AN EXCEL FILE: ${file.name}]\n\nPlease extract financial transactions from this Excel bank statement.`;
  } else {
    throw new Error(`Unsupported file type: ${fileType}`);
  }
}

// Validate the received file
export function validateFile(file: File | null): void {
  if (!file) {
    throw new Error("No file uploaded");
  }
  
  // Check file type
  const fileExt = file.name.split('.').pop()?.toLowerCase();
  if (!['csv', 'xlsx', 'xls', 'pdf'].includes(fileExt || '')) {
    throw new Error("Unsupported file format. Please upload CSV, Excel, or PDF files only.");
  }
  
  // Check file size
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File is too large. Maximum file size is 10MB.");
  }
}
