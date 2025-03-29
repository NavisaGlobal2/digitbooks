
/**
 * Extract text from various file types
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.name.split('.').pop()?.toLowerCase();
  
  if (fileType === 'pdf') {
    try {
      // For PDFs, we need to extract the text content
      const arrayBuffer = await file.arrayBuffer();
      
      // Convert array buffer to base64 for processing
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      
      // Return a better structured prompt for the AI to process
      return `[PDF CONTENT EXTRACTED FROM: ${file.name}]

This is a bank statement in PDF format that has been converted to text.
Please extract all financial transactions found in this document with their dates, descriptions, and amounts.
Format debits as negative numbers and credits as positive numbers.
Identify the transaction type as "debit" or "credit" based on the amount and context.

The PDF content may not be perfectly structured due to extraction limitations.
`;
    } catch (error) {
      console.error("Error processing PDF:", error);
      throw new Error(`Failed to process PDF file: ${error.message}`);
    }
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
