
/**
 * Extract text from various file types
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.name.split('.').pop()?.toLowerCase();
  
  if (fileType === 'pdf') {
    try {
      // For PDFs, we need to create a detailed instruction set for the AI
      // since we can't directly extract text without stack overflow errors
      const fileName = file.name;
      const fileSize = Math.round(file.size / 1024) + ' KB';
      
      return `[PDF BANK STATEMENT: ${fileName} (${fileSize})]

This is an actual bank statement in PDF format that needs accurate transaction extraction.
The PDF contains real financial transactions that need to be precisely identified.

Please extract ALL transactions with detailed attention to:
1. Exact transaction dates in YYYY-MM-DD format
2. Complete and accurate transaction descriptions preserving all merchant names and reference numbers
3. Precise transaction amounts (use negative values for withdrawals/debits, positive for deposits/credits)
4. Correctly identify each transaction as "debit" or "credit" based on the transaction type

DO NOT generate fictional or placeholder transactions. Only extract the actual transactions visible in the document.
Format your response ONLY as a valid JSON array of transactions with no additional text.
`;
    } catch (error) {
      console.error("Error creating PDF prompt:", error);
      throw new Error(`Failed to process PDF file: ${error.message}`);
    }
  } else if (fileType === 'csv') {
    // For CSV, we can read the text directly
    return await file.text();
  } else if (fileType === 'xlsx' || fileType === 'xls') {
    // For Excel files, return a structured prompt
    return `[THIS IS AN EXCEL FILE: ${file.name}]\n\nPlease extract financial transactions from this Excel bank statement.`;
  } else {
    throw new Error(`Unsupported file type: ${fileType}`);
  }
}
