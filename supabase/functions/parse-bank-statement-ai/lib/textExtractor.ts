
/**
 * Extract text from various file types
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.name.split('.').pop()?.toLowerCase();
  
  if (fileType === 'pdf') {
    // For PDFs, we need to convert them to text
    // This would use a PDF parsing library in a production setting
    // For now, we'll just note that it's a PDF and ask Claude to be smart about it
    return `[THIS IS A PDF FILE: ${file.name}]\n\nPlease extract financial transactions from this PDF bank statement.`;
  } else if (fileType === 'csv') {
    // For CSV, we can read the text directly
    return await file.text();
  } else if (fileType === 'xlsx' || fileType === 'xls') {
    // For Excel files, we would use a library to extract data
    // Again, for now we'll just note it's an Excel file
    return `[THIS IS AN EXCEL FILE: ${file.name}]\n\nPlease extract financial transactions from this Excel bank statement.`;
  } else {
    throw new Error(`Unsupported file type: ${fileType}`);
  }
}
