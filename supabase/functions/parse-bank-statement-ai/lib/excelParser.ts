
import { read, utils } from "https://cdn.jsdelivr.net/npm/xlsx/+esm";

export async function parseExcelDirectly(file: File): Promise<any[]> {
  try {
    // Read the Excel file as an array buffer
    const buffer = await file.arrayBuffer();
    
    // Parse the Excel file
    const workbook = read(buffer, { type: "array" });
    console.log("Excel workbook parsed successfully");
    
    // Get the first sheet
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    if (!worksheet) {
      console.log("No worksheet found in Excel file");
      return [];
    }
    
    // Convert the sheet to JSON
    const rawData = utils.sheet_to_json(worksheet, { raw: false, defval: null });
    console.log(`Excel sheet converted to JSON, found ${rawData.length} rows`);
    
    if (rawData.length === 0) {
      console.log("No table data found in Excel binary");
      return [];
    }
    
    // Transform the data into our transaction format
    const transactions = rawData.map((row: any, index: number) => {
      // Extract column names (lowercased for case-insensitive matching)
      const columns = Object.keys(row).map(key => key.toLowerCase());
      
      // Try to identify date, description and amount columns
      const dateKey = findColumnByPattern(row, ['date', 'transaction date', 'trans date', 'trans_date', 'txn date', 'txn_date']);
      const descriptionKey = findColumnByPattern(row, ['description', 'narrative', 'details', 'transaction', 'particulars', 'remarks', 'note', 'desc']);
      const amountKey = findColumnByPattern(row, ['amount', 'value', 'debit', 'credit', 'transaction amount', 'sum', 'total']);
      const typeKey = findColumnByPattern(row, ['type', 'transaction type', 'txn_type', 'debit/credit', 'dc']);
      
      // Preserve the original values
      const originalDate = dateKey ? row[dateKey] : null;
      const originalDescription = descriptionKey ? row[descriptionKey] : null;
      const originalAmount = amountKey ? row[amountKey] : null;
      const originalType = typeKey ? row[typeKey] : null;
      
      // Create a standardized transaction object with all original data preserved
      const transaction = {
        id: `excel-row-${index}`,
        date: formatDateToIsoString(originalDate), // Convert to ISO format for consistency
        description: originalDescription || null, // Use null instead of "Row X" fallback
        amount: parseAmount(originalAmount),
        type: determineTransactionType(originalType, originalAmount),
        
        // Preserve original values
        originalDate: originalDate,
        originalAmount: originalAmount,
        originalDescription: originalDescription,
        originalType: originalType,
        
        // Include all columns from the Excel file
        preservedColumns: { ...row }
      };
      
      return transaction;
    });
    
    console.log(`Processed ${transactions.length} transactions from Excel file with all original data preserved`);
    return transactions;
  } catch (error) {
    console.error("Error parsing Excel file:", error);
    throw new Error(`Failed to parse Excel file: ${error.message}`);
  }
}

/**
 * Find a column that matches one of the patterns
 */
function findColumnByPattern(row: any, patterns: string[]): string | null {
  const keys = Object.keys(row);
  
  for (const pattern of patterns) {
    // First try exact match
    const exactMatch = keys.find(key => key.toLowerCase() === pattern.toLowerCase());
    if (exactMatch) return exactMatch;
    
    // Then try contains match
    const containsMatch = keys.find(key => key.toLowerCase().includes(pattern.toLowerCase()));
    if (containsMatch) return containsMatch;
  }
  
  return null;
}

/**
 * Try to format a date string to ISO format
 * Will preserve the original date and return a standardized version
 */
function formatDateToIsoString(dateStr: string | null): string {
  if (!dateStr) return new Date().toISOString();
  
  try {
    // Try to detect common date formats
    let date;
    
    // Check if it's already an ISO date
    if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      date = new Date(dateStr);
    }
    // Check for DD/MM/YYYY format
    else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
      const parts = dateStr.split('/');
      date = new Date(`${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`);
    }
    // Check for MM/DD/YYYY format
    else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
      date = new Date(dateStr);
    }
    // Try generic parsing as last resort
    else {
      date = new Date(dateStr);
    }
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.log(`Invalid date format: ${dateStr}, using current date`);
      return new Date().toISOString();
    }
    
    return date.toISOString();
  } catch (error) {
    console.log(`Error parsing date: ${dateStr}`, error);
    return new Date().toISOString();
  }
}

/**
 * Parse amount string or number to a numeric value
 */
function parseAmount(amountStr: string | number | null): number {
  if (amountStr === null || amountStr === undefined) return 0;
  
  // If it's already a number, return it
  if (typeof amountStr === 'number') return amountStr;
  
  try {
    // Remove currency symbols, commas, and other non-numeric characters
    // But keep minus sign and decimal point
    const cleanedStr = amountStr.toString()
      .replace(/[^0-9.-]/g, '')
      .trim();
    
    if (!cleanedStr) return 0;
    
    return parseFloat(cleanedStr);
  } catch (error) {
    console.log(`Error parsing amount: ${amountStr}`, error);
    return 0;
  }
}

/**
 * Determine transaction type (debit/credit) based on type column or amount
 */
function determineTransactionType(typeStr: string | null, amountStr: string | number | null): "debit" | "credit" | "unknown" {
  if (!typeStr && !amountStr) return "unknown";
  
  // If we have a type string, try to determine from it
  if (typeStr) {
    const lowerType = typeStr.toLowerCase();
    
    if (lowerType.includes('debit') || lowerType.includes('dr') || 
        lowerType.includes('expense') || lowerType.includes('payment') || 
        lowerType.includes('withdrawal')) {
      return "debit";
    }
    
    if (lowerType.includes('credit') || lowerType.includes('cr') || 
        lowerType.includes('deposit') || lowerType.includes('income') || 
        lowerType.includes('receive')) {
      return "credit";
    }
  }
  
  // If we couldn't determine from type, try from amount
  const amount = parseAmount(amountStr);
  
  if (amount < 0) return "debit";
  if (amount > 0) return "credit";
  
  return "unknown";
}
