
import { parse as parseCSV } from "https://deno.land/std@0.170.0/encoding/csv.ts";

/**
 * Basic fallback CSV parser when AI processing fails
 */
export async function fallbackCSVProcessing(csvText: string): Promise<any[]> {
  console.log("Using fallback CSV parser");
  
  try {
    // Try to parse the CSV content
    let rows: string[][] = [];
    
    try {
      rows = await parseCSV(csvText, {
        skipFirstRow: true,
        separator: ',',
        columns: false
      });
    } catch (csvError) {
      console.error("Error parsing CSV with standard parser:", csvError);
      
      // Try alternative approach - split by newlines and commas
      rows = csvText
        .split('\n')
        .map(line => line.split(',').map(cell => cell.trim()))
        .filter(row => row.length > 1);
    }
    
    if (rows.length === 0) {
      throw new Error("No data found in CSV");
    }
    
    console.log(`Parsed ${rows.length} rows from CSV`);
    
    // Try to identify columns for date, description, and amount
    const potentialHeaders = rows[0].map(header => header.toLowerCase());
    
    // Find column indices
    let dateColIndex = potentialHeaders.findIndex(h => 
      h.includes('date') || h.includes('time') || h.includes('when')
    );
    
    let descColIndex = potentialHeaders.findIndex(h => 
      h.includes('desc') || h.includes('narr') || h.includes('part') || 
      h.includes('ref') || h.includes('detail')
    );
    
    let amountColIndex = potentialHeaders.findIndex(h => 
      h.includes('amount') || h.includes('value') || h.includes('sum')
    );
    
    let debitColIndex = potentialHeaders.findIndex(h => h.includes('debit'));
    let creditColIndex = potentialHeaders.findIndex(h => h.includes('credit'));
    
    // Fallbacks if we couldn't identify columns by name
    if (dateColIndex === -1) dateColIndex = 0;
    if (descColIndex === -1) descColIndex = dateColIndex + 1;
    if (amountColIndex === -1 && debitColIndex === -1 && creditColIndex === -1) {
      amountColIndex = Math.min(2, rows[0].length - 1);
    }
    
    console.log(`Identified columns: Date(${dateColIndex}), Description(${descColIndex}), Amount(${amountColIndex})`);
    
    // Process transactions
    const transactions = rows.slice(1) // Skip header
      .filter(row => row.length >= Math.max(dateColIndex, descColIndex, amountColIndex) + 1) 
      .map(row => {
        // Process date - try to normalize to YYYY-MM-DD
        let dateStr = row[dateColIndex];
        let formattedDate = dateStr;
        
        // Try to detect and format date
        const dateParts = dateStr.split(/[\/\-\.]/);
        if (dateParts.length === 3) {
          // Check if year is first or last
          if (dateParts[0].length === 4) {
            // YYYY-MM-DD
            formattedDate = `${dateParts[0]}-${dateParts[1].padStart(2, '0')}-${dateParts[2].padStart(2, '0')}`;
          } else {
            // Assume MM/DD/YYYY or DD/MM/YYYY (less reliable)
            const year = dateParts[2].length === 2 ? `20${dateParts[2]}` : dateParts[2];
            
            // Heuristic: if first part > 12, assume it's day
            if (parseInt(dateParts[0]) > 12) {
              // DD/MM/YYYY
              formattedDate = `${year}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`;
            } else {
              // MM/DD/YYYY
              formattedDate = `${year}-${dateParts[0].padStart(2, '0')}-${dateParts[1].padStart(2, '0')}`;
            }
          }
        }
        
        // Process description
        const description = row[descColIndex] || "Unknown";
        
        // Process amount and determine transaction type
        let amount = 0;
        let type = "debit";
        
        if (debitColIndex !== -1 && creditColIndex !== -1) {
          // Separate columns for debit and credit
          const debitVal = parseFloat(row[debitColIndex].replace(/[^\d.-]/g, ""));
          const creditVal = parseFloat(row[creditColIndex].replace(/[^\d.-]/g, ""));
          
          if (!isNaN(debitVal) && debitVal > 0) {
            amount = debitVal;
            type = "debit";
          } else if (!isNaN(creditVal) && creditVal > 0) {
            amount = creditVal;
            type = "credit";
          }
        } else {
          // Single amount column
          const amountStr = row[amountColIndex].replace(/[^\d.-]/g, "");
          amount = parseFloat(amountStr);
          
          if (isNaN(amount)) amount = 0;
          
          // Negative amount usually means debit/expense
          if (row[amountColIndex].includes('-') || amount < 0) {
            type = "debit";
            amount = Math.abs(amount);
          } else {
            type = "credit";
          }
        }
        
        return {
          date: formattedDate,
          description,
          amount,
          type
        };
      })
      .filter(tx => !isNaN(tx.amount) && tx.amount > 0);
    
    console.log(`Extracted ${transactions.length} transactions with fallback parser`);
    return transactions;
    
  } catch (error) {
    console.error("Fallback CSV processing failed:", error);
    throw new Error(`Fallback CSV processing failed: ${error.message}`);
  }
}
