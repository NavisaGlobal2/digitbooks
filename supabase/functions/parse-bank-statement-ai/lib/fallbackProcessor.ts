
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
    
    for (let i = 0; i < Math.min(5, rows.length); i++) {
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
    let dateColIndex = headers.findIndex(h => 
      h.includes('date') || h.includes('time') || h.includes('when')
    );
    
    let descColIndex = headers.findIndex(h => 
      h.includes('desc') || h.includes('narr') || h.includes('part') || 
      h.includes('ref') || h.includes('detail')
    );
    
    let amountColIndex = headers.findIndex(h => 
      h.includes('amount') || h.includes('value') || h.includes('sum')
    );
    
    let debitColIndex = headers.findIndex(h => h.includes('debit'));
    let creditColIndex = headers.findIndex(h => h.includes('credit'));
    let balanceColIndex = headers.findIndex(h => h.includes('balance'));
    
    // Fallbacks if we couldn't identify columns by name
    if (dateColIndex === -1) dateColIndex = 0;
    if (descColIndex === -1) descColIndex = dateColIndex + 1;
    if (amountColIndex === -1 && debitColIndex === -1 && creditColIndex === -1) {
      // Look for numeric columns as possible amounts
      for (let i = 0; i < rows[0].length; i++) {
        if (i !== dateColIndex && i !== descColIndex) {
          // Check if this column often contains numeric values
          const testRows = rows.slice(headerRowIndex + 1, headerRowIndex + 6);
          const numericCount = testRows.filter(row => {
            if (row[i]) {
              const cleaned = row[i].replace(/[^\d.-]/g, "");
              return !isNaN(parseFloat(cleaned));
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
      .filter(row => row.length >= Math.max(dateColIndex, descColIndex, amountColIndex, debitColIndex, creditColIndex) + 1)
      .filter(row => {
        // Skip rows that are likely not transactions (e.g., summary rows)
        const rowText = row.join(' ').toLowerCase();
        const nonTransactionKeywords = ['total', 'balance c/f', 'subtotal', 'closing balance', 'opening balance'];
        return !nonTransactionKeywords.some(keyword => rowText.includes(keyword));
      })
      .map(row => {
        // Process date - try to normalize to YYYY-MM-DD
        let dateStr = row[dateColIndex] || '';
        let formattedDate = dateStr;
        
        // Try to detect and format date
        // Remove non-date characters
        dateStr = dateStr.replace(/[^\d\/\-\.]/g, '');
        
        const dateParts = dateStr.split(/[\/\-\.]/);
        if (dateParts.length === 3) {
          // Check if year is first or last
          if (dateParts[0].length === 4) {
            // YYYY-MM-DD
            formattedDate = `${dateParts[0]}-${dateParts[1].padStart(2, '0')}-${dateParts[2].padStart(2, '0')}`;
          } else if (dateParts[2].length === 4) {
            // MM/DD/YYYY or DD/MM/YYYY
            // Heuristic: if first part > 12, assume it's day
            if (parseInt(dateParts[0]) > 12) {
              // DD/MM/YYYY
              formattedDate = `${dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`;
            } else {
              // MM/DD/YYYY
              formattedDate = `${dateParts[2]}-${dateParts[0].padStart(2, '0')}-${dateParts[1].padStart(2, '0')}`;
            }
          } else {
            // Two-digit year, e.g., DD/MM/YY
            const year = parseInt(dateParts[2]) > 50 ? `19${dateParts[2]}` : `20${dateParts[2]}`;
            formattedDate = `${year}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`;
          }
        }
        
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
