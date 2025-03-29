
/**
 * Extract text from various file types
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.name.split('.').pop()?.toLowerCase();
  
  if (fileType === 'pdf') {
    try {
      // For PDFs, we create a structured prompt for the AI
      // We don't actually extract text from PDF since this causes stack overflow
      // Instead, we create a prompt that instructs the AI how to handle the PDF
      
      return `[PDF BANK STATEMENT: ${file.name}]

This is a bank statement in PDF format that needs transaction extraction.
Please extract all financial transactions with careful attention to:

1. Transaction dates in YYYY-MM-DD format
2. Complete transaction descriptions including merchant names and references
3. Exact transaction amounts (negative values for withdrawals/debits, positive for deposits/credits)
4. Identify each transaction as "debit" or "credit" based on amount and context

Focus ONLY on extracting the actual transaction data with dates, descriptions, and amounts.
Ignore headers, footers, account summaries, and marketing content.
Format your response as a structured array of transaction objects with date, description, amount, and type fields.

Example of expected output format:
[
  {
    "date": "2023-04-15",
    "description": "PAYMENT TO MERCHANT NAME REF:123456",
    "amount": -45.99,
    "type": "debit"
  },
  {
    "date": "2023-04-17",
    "description": "DIRECT DEPOSIT EMPLOYER NAME",
    "amount": 1250.00,
    "type": "credit"
  }
]`;
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
