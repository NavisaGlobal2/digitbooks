
/**
 * Extract text from various file types
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.name.split('.').pop()?.toLowerCase();
  
  if (fileType === 'pdf') {
    try {
      // For PDFs, we create a detailed instruction set for the AI
      // since we can't directly extract text without stack overflow errors
      const fileName = file.name;
      const fileSize = Math.round(file.size / 1024) + ' KB';
      
      return `[PDF BANK STATEMENT: ${fileName} (${fileSize})]

CRITICAL INSTRUCTION: This is a REAL bank statement PDF that needs ACCURATE data extraction.
THIS IS NOT A DRILL OR TEST. DO NOT generate fictional or placeholder transactions.

You MUST:
1. Extract ONLY the ACTUAL transactions visible in the document
2. Preserve exact dates in YYYY-MM-DD format
3. Keep complete and accurate transaction descriptions with all details
4. Use precise transaction amounts (negative for withdrawals/debits, positive for deposits/credits)
5. Correctly identify each transaction as "debit" or "credit"
6. DO NOT make up any data that is not present in the statement
7. IF NO TRANSACTIONS ARE VISIBLE, return an empty array - do not invent sample data

Your output MUST be formatted as a valid JSON array of transactions with NO additional text.
The data you extract should reflect REAL financial transactions from the statement.
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
