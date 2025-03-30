
import { parse as parseCSV } from "https://deno.land/std@0.170.0/encoding/csv.ts";

/**
 * Enhanced fallback CSV and structured document parser when AI processing fails
 */
export async function fallbackCSVProcessing(csvText: string): Promise<any[]> {
  console.log("Using enhanced fallback parser");
  
  try {
    // Try to parse the CSV content with multiple approaches
    let rows: string[][] = [];
    
    try {
      // First attempt - standard CSV parsing
      rows = await parseCSV(csvText, {
        skipFirstRow: true,
        separator: ',',
        columns: false
      });
      console.log("Successfully parsed with standard CSV parser");
    } catch (csvError) {
      console.error("Error parsing CSV with standard parser:", csvError);
      
      // Second attempt - try alternative separators
      const potentialSeparators = [',', ';', '\t', '|'];
      
      for (const separator of potentialSeparators) {
        try {
          rows = await parseCSV(csvText, {
            skipFirstRow: true,
            separator,
            columns: false
          });
          
          if (rows.length > 0) {
            console.log(`Successfully parsed with separator: '${separator}'`);
            break;
          }
        } catch (error) {
          // Continue to next separator
        }
      }
      
      // Third attempt - try manual line splitting
      if (rows.length === 0) {
        rows = csvText
          .split(/\r?\n/)
          .filter(line => line.trim().length > 0)
          .map(line => {
            // Try different separators for each line
            for (const separator of potentialSeparators) {
              const cells = line.split(separator);
              if (cells.length > 2) {
                return cells.map(cell => cell.trim());
              }
            }
            // Fallback to simple comma splitting
            return line.split(',').map(cell => cell.trim());
          })
          .filter(row => row.length > 1);
        
        console.log(`Parsed ${rows.length} rows using manual line splitting`);
      }
    }
    
    if (rows.length === 0) {
      throw new Error("No data found in document");
    }
    
    console.log(`Parsed ${rows.length} rows from document`);
    
    // Try to identify header row if not the first row
    let headerRowIndex = 0;
    const headerKeywords = ['date', 'description', 'amount', 'transaction', 'debit', 'credit', 'balance'];
    
    for (let i = 0; i < Math.min(10, rows.length); i++) {
      const rowText = rows[i].join(' ').toLowerCase();
      const keywordMatches = headerKeywords.filter(keyword => rowText.includes(keyword)).length;
      
      if (keywordMatches >= 2) {
        headerRowIndex = i;
        break;
      }
    }
    
    // Use row at headerRowIndex as column headers
    const headers = rows[headerRowIndex].map(header => header.toLowerCase().trim());
    console.log("Identified headers:", headers);
    
    // Find column indices for critical fields
    let dateColIndex = findColumnIndex(headers, ['date', 'time', 'when', 'transaction date']);
    let descColIndex = findColumnIndex(headers, ['desc', 'narr', 'part', 'ref', 'detail', 'transaction', 'narrative']);
    let amountColIndex = findColumnIndex(headers, ['amount', 'value', 'sum']);
    let debitColIndex = findColumnIndex(headers, ['debit', 'withdrawal', 'expense', 'out']);
    let creditColIndex = findColumnIndex(headers, ['credit', 'deposit', 'income', 'in']);
    let balanceColIndex = findColumnIndex(headers, ['balance', 'bal']);
    
    // Fallbacks if we couldn't identify columns by name
    if (dateColIndex === -1) dateColIndex = 0;
    if (descColIndex === -1) descColIndex = dateColIndex + 1;
    if (amountColIndex === -1 && debitColIndex === -1 && creditColIndex === -1) {
      // Look for numeric columns as possible amounts
      for (let i = 0; i < headers.length; i++) {
        if (i !== dateColIndex && i !== descColIndex) {
          // Check if this column often contains numeric values
          const testRows = rows.slice(headerRowIndex + 1, Math.min(headerRowIndex + 11, rows.length));
          const numericCount = testRows.filter(row => {
            if (row[i]) {
              const cleaned = row[i].replace(/[^\d.-]/g, "");
              return !isNaN(parseFloat(cleaned)) && cleaned.length > 0;
            }
            return false;
          }).length;
          
          if (numericCount > testRows.length / 2) {
            amountColIndex = i;
            break;
          }
        }
      }
      
      if (amountColIndex === -1) {
        amountColIndex = Math.min(2, rows[0].length - 1);
      }
    }
    
    console.log(`Identified columns: Date(${dateColIndex}), Description(${descColIndex}), Amount(${amountColIndex}), Debit(${debitColIndex}), Credit(${creditColIndex}), Balance(${balanceColIndex})`);
    
    // Process transactions, skipping the header row
    const transactions = rows.slice(headerRowIndex + 1) 
      .filter(row => row.length >= Math.max(dateColIndex, descColIndex, amountColIndex, debitColIndex, creditColIndex, balanceColIndex) + 1)
      .filter(row => {
        // Skip rows that are likely not transactions (e.g., summary rows)
        const rowText = row.join(' ').toLowerCase();
        const nonTransactionKeywords = ['total', 'balance c/f', 'subtotal', 'closing balance', 'opening balance'];
        return !nonTransactionKeywords.some(keyword => rowText.includes(keyword));
      })
      .map(row => {
        // Process date - try to normalize to YYYY-MM-DD
        let dateStr = row[dateColIndex] || '';
        let formattedDate = parseDate(dateStr);
        
        // Process description
        const description = row[descColIndex] || "Unknown";
        
        // Process amount and determine transaction type
        let amount = 0;
        let type = "debit";
        let balance = null;
        
        if (debitColIndex !== -1 && creditColIndex !== -1) {
          // Separate columns for debit and credit
          const debitStr = row[debitColIndex] || '';
          const creditStr = row[creditColIndex] || '';
          
          const debitVal = parseFloat(debitStr.replace(/[^\d.-]/g, ""));
          const creditVal = parseFloat(creditStr.replace(/[^\d.-]/g, ""));
          
          if (!isNaN(debitVal) && debitVal > 0) {
            amount = debitVal;
            type = "debit";
          } else if (!isNaN(creditVal) && creditVal > 0) {
            amount = creditVal;
            type = "credit";
          }
        } else {
          // Single amount column
          const amountStr = row[amountColIndex] || '0';
          amount = parseFloat(amountStr.replace(/[^\d.-]/g, ""));
          
          if (isNaN(amount)) amount = 0;
          
          // Determine type based on sign or description
          if (amountStr.includes('-') || amount < 0) {
            type = "debit";
            amount = Math.abs(amount);
          } else {
            // Try to determine type based on transaction description
            const debitKeywords = ['payment', 'purchase', 'withdrawal', 'fee', 'charge', 'debit', 'sent'];
            const creditKeywords = ['deposit', 'credit', 'interest', 'refund', 'received'];
            
            const isLikelyDebit = debitKeywords.some(keyword => description.toLowerCase().includes(keyword));
            const isLikelyCredit = creditKeywords.some(keyword => description.toLowerCase().includes(keyword));
            
            if (isLikelyDebit && !isLikelyCredit) {
              type = "debit";
            } else if (isLikelyCredit && !isLikelyDebit) {
              type = "credit";
            } else {
              // If can't determine, default to credit for positive amounts
              type = "credit";
            }
          }
        }
        
        // Extract balance if available
        if (balanceColIndex !== -1) {
          const balanceStr = row[balanceColIndex] || '0';
          balance = parseFloat(balanceStr.replace(/[^\d.-]/g, ""));
          if (isNaN(balance)) balance = null;
        }
        
        return {
          date: formattedDate,
          description,
          amount,
          type,
          balance
        };
      })
      .filter(tx => !isNaN(tx.amount) && tx.amount > 0);
    
    console.log(`Extracted ${transactions.length} transactions with enhanced fallback parser`);
    return transactions;
    
  } catch (error) {
    console.error("Fallback CSV processing failed:", error);
    throw new Error(`Fallback CSV processing failed: ${error.message}`);
  }
}

/**
 * Find the index of a column based on a list of possible keywords
 */
function findColumnIndex(headers: string[], keywords: string[]): number {
  for (const keyword of keywords) {
    const index = headers.findIndex(h => h.includes(keyword));
    if (index !== -1) return index;
  }
  return -1;
}

/**
 * Parse date from various formats to YYYY-MM-DD
 */
function parseDate(dateStr: string): string {
  // Remove non-date characters
  dateStr = dateStr.replace(/[^\d\/\-\.]/g, '');
  
  // Check if it's already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  
  const currentYear = new Date().getFullYear();
  const dateParts = dateStr.split(/[\/\-\.]/);
  
  if (dateParts.length === 3) {
    // Check if year is first or last
    if (dateParts[0].length === 4) {
      // YYYY-MM-DD
      return `${dateParts[0]}-${dateParts[1].padStart(2, '0')}-${dateParts[2].padStart(2, '0')}`;
    } else if (dateParts[2].length === 4) {
      // DD/MM/YYYY or MM/DD/YYYY
      // Heuristic: if first part > 12, assume it's day
      if (parseInt(dateParts[0]) > 12) {
        // DD/MM/YYYY
        return `${dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`;
      } else {
        // MM/DD/YYYY (US format)
        return `${dateParts[2]}-${dateParts[0].padStart(2, '0')}-${dateParts[1].padStart(2, '0')}`;
      }
    } else {
      // Two-digit year, e.g., DD/MM/YY
      let year = parseInt(dateParts[2]);
      // Handle 2-digit years based on a sliding window
      if (year < 100) {
        year = year > 50 ? 1900 + year : 2000 + year;
      }
      
      // Determine if it's DD/MM/YY or MM/DD/YY
      if (parseInt(dateParts[0]) > 12) {
        // DD/MM/YY
        return `${year}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`;
      } else if (parseInt(dateParts[1]) > 12) {
        // MM/DD/YY 
        return `${year}-${dateParts[0].padStart(2, '0')}-${dateParts[1].padStart(2, '0')}`;
      } else {
        // Can't tell for sure, default to DD/MM/YY (international format)
        return `${year}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`;
      }
    }
  }
  
  // If we couldn't parse it, return the original string or fallback to today
  try {
    // Try to let JavaScript figure it out
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } catch (e) {
    // Ignore parsing errors
  }
  
  // Return current date as a last resort
  const today = new Date();
  return today.toISOString().split('T')[0];
}
