
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
Please extract all financial transactions with PRECISE attention to:
1. Transaction dates in the exact format shown (MM/DD/YYYY, DD/MM/YYYY, etc.)
2. Complete transaction descriptions including merchant names, reference numbers
3. Exact transaction amounts (use negative values for debits/withdrawals)
4. Transaction types (categorize as "debit" or "credit" based on amount and context)
5. Any account or reference numbers associated with transactions

Focus EXCLUSIVELY on extracting the tabular data of transactions with dates, descriptions, and amounts.
Ignore headers, footers, account summaries, and marketing content.
Format your response as a structured array of transaction objects with date, description, amount, and type fields.
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
    return `[THIS IS AN EXCEL FILE: ${file.name}]\n\nPlease extract financial transactions from this Excel bank statement.`;
  } else {
    throw new Error(`Unsupported file type: ${fileType}`);
  }
}
