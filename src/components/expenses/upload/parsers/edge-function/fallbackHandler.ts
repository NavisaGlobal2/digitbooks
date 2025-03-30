
import { ParsedTransaction } from "../types";
import Papa from 'papaparse';

/**
 * Handle CSV fallback when server parsing fails
 */
export const handleCSVFallback = async (
  file: File,
  onSuccess: (transactions: ParsedTransaction[]) => void,
  onError: (errorMessage: string) => boolean,
  originalError?: any
): Promise<boolean> => {
  console.log("Attempting CSV fallback parsing due to server error:", originalError);
  
  if (!file.name.toLowerCase().endsWith('.csv')) {
    console.log("Fallback only works for CSV files");
    return false;
  }
  
  try {
    // Read the file content as text
    const fileContent = await file.text();
    
    // Parse CSV with PapaParse
    const parseResult = await new Promise<Papa.ParseResult<any>>((resolve, reject) => {
      Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        complete: resolve,
        error: reject
      });
    });
    
    if (!parseResult.data || parseResult.data.length === 0) {
      return onError("No data found in CSV file");
    }
    
    console.log(`Successfully parsed ${parseResult.data.length} rows from CSV`);
    
    // Map the CSV data to transactions
    const transactions: ParsedTransaction[] = parseResult.data
      .filter(row => {
        // Find amount and date columns
        const hasAmount = Object.keys(row).some(key => 
          key.toLowerCase().includes('amount') || 
          key.toLowerCase().includes('debit') ||
          key.toLowerCase().includes('credit')
        );
        
        const hasDate = Object.keys(row).some(key => 
          key.toLowerCase().includes('date') ||
          key.toLowerCase().includes('time')
        );
        
        return hasAmount && hasDate;
      })
      .map((row, index) => {
        // Try to determine columns for date, description and amount
        const dateKey = Object.keys(row).find(key => 
          key.toLowerCase().includes('date') || 
          key.toLowerCase().includes('time')
        ) || Object.keys(row)[0];
        
        const descriptionKey = Object.keys(row).find(key => 
          key.toLowerCase().includes('desc') || 
          key.toLowerCase().includes('narr') ||
          key.toLowerCase().includes('part') ||
          key.toLowerCase().includes('details') ||
          key.toLowerCase().includes('trans')
        ) || Object.keys(row)[1];
        
        const amountKey = Object.keys(row).find(key => 
          key.toLowerCase().includes('amount') || 
          key.toLowerCase().includes('debit') || 
          key.toLowerCase().includes('credit')
        ) || Object.keys(row)[2];
        
        // Clean up the amount value
        let amountValue = row[amountKey] || '0';
        if (typeof amountValue === 'string') {
          amountValue = amountValue
            .replace(/[^\d.-]/g, '') // Remove non-numeric chars except decimals and negative
            .replace(/^(-?)\./, '$10.') // Replace leading decimal with 0
            .trim();
        }
        
        const amount = parseFloat(amountValue) || 0;
        
        return {
          id: `csv-${index}-${Date.now()}`,
          date: row[dateKey] || new Date().toISOString().split('T')[0],
          description: row[descriptionKey] || `Transaction ${index + 1}`,
          amount: Math.abs(amount), // Store as absolute value
          type: amount < 0 ? 'debit' : 'credit',
          selected: true, // Pre-select all transactions
          source: null
        };
      });
    
    if (transactions.length === 0) {
      return onError("Could not identify transaction data in the CSV");
    }
    
    // Call success handler with transactions
    onSuccess(transactions);
    return true;
    
  } catch (error: any) {
    console.error("CSV fallback parsing error:", error);
    return onError(`CSV fallback parsing failed: ${error.message}`);
  }
};
