
import { parse as parseCSV } from "https://deno.land/std@0.170.0/encoding/csv.ts";
import { sanitizeTextForAPI } from "./utils.ts";

export interface BankStatementData {
  account_holder?: string;
  account_number?: string;
  currency?: string;
  transactions: Transaction[];
}

export interface Transaction {
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  balance?: number;
}

/**
 * Process CSV content to extract a formatted text representation
 * suitable for AI processing
 * @param content Raw CSV content
 * @returns Formatted text content
 */
export async function processCSVContent(content: string): Promise<string> {
  if (!content || typeof content !== 'string') {
    throw new Error("Invalid CSV content provided");
  }
  
  try {
    // Sanitize the content for better processing
    const sanitizedContent = sanitizeTextForAPI(content);
    
    // Parse the CSV
    let rows: string[][] = [];
    try {
      rows = await parseCSV(sanitizedContent, {
        skipFirstRow: false,
        // Allow unclosed quotes - this fixes the common CSV parsing error
        lazyQuotes: true, 
        // Ignore any problematic quotes
        flexible: true
      });
    } catch (parseError) {
      console.error("Error parsing CSV with standard parser:", parseError);
      
      // Fallback: manual parsing for common problematic CSV formats
      rows = manuallyParseCSV(sanitizedContent);
      
      if (rows.length === 0) {
        throw new Error(`Failed to parse CSV content: ${parseError.message}`);
      }
    }
    
    // Format as readable text
    let formattedText = "CSV BANK STATEMENT:\n\n";
    
    // Check if we have data
    if (rows.length === 0) {
      return formattedText + "No data found in CSV.";
    }
    
    // Look for account information in the header rows
    const accountInfo = extractAccountInfo(rows);
    if (accountInfo) {
      formattedText += `Account Holder: ${accountInfo.account_holder || 'Unknown'}\n`;
      formattedText += `Account Number: ${accountInfo.account_number || 'Unknown'}\n`;
      formattedText += `Currency: ${accountInfo.currency || 'Unknown'}\n\n`;
    }
    
    // Try to determine if there's a header row and which row it might be
    const headerRowIndex = findHeaderRowIndex(rows);
    
    if (headerRowIndex >= 0) {
      // Add header row
      formattedText += rows[headerRowIndex].join("\t") + "\n";
      formattedText += "-".repeat(40) + "\n";
      
      // Add data rows (all rows after the header)
      for (let i = headerRowIndex + 1; i < rows.length; i++) {
        if (rows[i].length > 0 && !isEmptyRow(rows[i])) {
          formattedText += rows[i].join("\t") + "\n";
        }
      }
    } else {
      // If no header row found, just add all rows
      for (let i = 0; i < rows.length; i++) {
        if (!isEmptyRow(rows[i])) {
          formattedText += rows[i].join("\t") + "\n";
        }
      }
    }
    
    return formattedText;
  } catch (error) {
    console.error("Error processing CSV content:", error);
    throw new Error(`Failed to process CSV content: ${error.message}`);
  }
}

/**
 * Extract account information from CSV rows
 */
function extractAccountInfo(rows: string[][]): { 
  account_holder?: string; 
  account_number?: string;
  currency?: string;
} {
  const result: { 
    account_holder?: string; 
    account_number?: string;
    currency?: string;
  } = {};
  
  // Look through first few rows for account info
  const searchRows = Math.min(rows.length, 15);
  
  for (let i = 0; i < searchRows; i++) {
    const rowText = rows[i].join(" ").toLowerCase();
    
    // Look for account holder
    if (!result.account_holder) {
      if (rowText.includes("account holder") || rowText.includes("name")) {
        const holderPattern = /(?:account holder|name)[^a-zA-Z]+([\w\s\.,]+)/i;
        const match = rowText.match(holderPattern);
        if (match && match[1]) {
          result.account_holder = match[1].trim();
        }
      }
    }
    
    // Look for account number
    if (!result.account_number) {
      if (rowText.includes("account") && (rowText.includes("number") || rowText.includes("no"))) {
        const accountPattern = /(?:account\s*(?:number|no|#)[^\d]*([\d\-\*]+))/i;
        const match = rowText.match(accountPattern);
        if (match && match[1]) {
          result.account_number = match[1].trim();
        }
      }
    }
    
    // Look for currency
    if (!result.currency) {
      const currencySymbols = ["$", "€", "£", "¥", "₦", "₹", "₽", "₩", "₱"];
      for (const symbol of currencySymbols) {
        if (rowText.includes(symbol)) {
          switch (symbol) {
            case "$": result.currency = "USD"; break;
            case "€": result.currency = "EUR"; break;
            case "£": result.currency = "GBP"; break;
            case "¥": result.currency = "JPY"; break;
            case "₦": result.currency = "NGN"; break;
            case "₹": result.currency = "INR"; break;
            case "₽": result.currency = "RUB"; break;
            case "₩": result.currency = "KRW"; break;
            case "₱": result.currency = "PHP"; break;
          }
          break;
        }
      }
      
      // Check for currency codes
      const currencyCodes = ["USD", "EUR", "GBP", "JPY", "NGN", "INR", "RUB"];
      for (const code of currencyCodes) {
        if (rowText.includes(code.toLowerCase())) {
          result.currency = code;
          break;
        }
      }
    }
  }
  
  return result;
}

/**
 * Find the likely header row index in a CSV
 */
function findHeaderRowIndex(rows: string[][]): number {
  // Common header terms for bank statements
  const headerTerms = [
    "date", "time", "description", "transaction", "details", "amount", 
    "credit", "debit", "balance", "reference", "memo"
  ];
  
  // Check each row for header terms
  for (let i = 0; i < Math.min(10, rows.length); i++) {
    const row = rows[i].join(" ").toLowerCase();
    let matchCount = 0;
    
    for (const term of headerTerms) {
      if (row.includes(term)) {
        matchCount++;
      }
    }
    
    // If at least 2 header terms are found, consider it the header row
    if (matchCount >= 2) {
      return i;
    }
  }
  
  // Default to first row if no header found
  return 0;
}

/**
 * Check if a row is empty
 */
function isEmptyRow(row: string[]): boolean {
  return row.every(cell => cell.trim() === '');
}

/**
 * Manual CSV parser for problematic files
 */
function manuallyParseCSV(content: string): string[][] {
  const rows: string[][] = [];
  const lines = content.split(/\r?\n/);
  
  for (const line of lines) {
    if (!line.trim()) continue;
    
    const cells: string[] = [];
    let currentCell = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        // Toggle quotes state - this handles the issue with unescaped quotes
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        // End of cell
        cells.push(currentCell);
        currentCell = '';
      } else {
        // Add character to current cell
        currentCell += char;
      }
    }
    
    // Add the last cell
    cells.push(currentCell);
    rows.push(cells);
  }
  
  return rows;
}

/**
 * Check if the file is a CSV file based on its mime type or extension
 * @param file File object to check
 * @returns boolean
 */
export function isCSVFile(file: File): boolean {
  if (!file) {
    return false;
  }
  
  // Check by mime type
  if (file.type === 'text/csv') {
    return true;
  }
  
  // Check by extension
  const name = file.name || '';
  return name.toLowerCase().endsWith('.csv');
}
