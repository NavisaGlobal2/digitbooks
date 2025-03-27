
import { Transaction, TransactionType } from '../../types.ts';
import { parseAmount, parseDate } from '../helpers.ts';

// Function to parse the actual transactions from data rows
export function parseTransactionsFromRows(
  rows: any[],
  headerRowIndex: number,
  dateIndex: number,
  descIndex: number,
  amountIndex: number,
  creditIndex: number,
  debitIndex: number
): Transaction[] {
  const transactions: Transaction[] = [];
  
  console.log(`Starting row parsing with ${rows.length - (headerRowIndex + 1)} data rows`);
  
  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;
    
    let dateValue = row[dateIndex];
    let description = String(row[descIndex] || '');
    
    // Skip rows with missing essential data
    if (!dateValue || !description) {
      console.log(`Skipping row ${i} - missing date or description`);
      continue;
    }
    
    // Skip rows with placeholder data patterns (common in Nigerian bank statements)
    const lowerDesc = description.toLowerCase();
    if (lowerDesc.includes('opening balance') || 
        lowerDesc.includes('closing balance') || 
        lowerDesc.includes('b/fwd') || 
        lowerDesc.includes('brought forward') ||
        lowerDesc.includes('c/fwd')) {
      console.log(`Skipping row ${i} - balance row: ${description}`);
      continue;
    }
    
    // Parse date
    let parsedDate = parseDate(dateValue);
    
    // Skip if date is invalid
    if (!parsedDate || isNaN(parsedDate.getTime())) {
      console.log(`Skipping row ${i} - invalid date: ${dateValue}`);
      continue;
    }
    
    // Format date as ISO string (YYYY-MM-DD)
    const formattedDate = parsedDate.toISOString().split('T')[0];
    
    // Parse amount and determine transaction type
    let amount: number = 0;
    let type: TransactionType = 'unknown';
    
    // Check for Nigerian bank-specific patterns in description
    const hasDebitMarker = lowerDesc.includes(' dr') || lowerDesc.includes('(dr)') || lowerDesc.endsWith('dr');
    const hasCreditMarker = lowerDesc.includes(' cr') || lowerDesc.includes('(cr)') || lowerDesc.endsWith('cr');
    
    // First check for dedicated debit/credit columns
    if (debitIndex !== -1 && row[debitIndex] && parseAmount(row[debitIndex]) > 0) {
      amount = parseAmount(row[debitIndex]);
      type = 'debit';
      console.log(`Row ${i} - Found debit amount ${amount} in dedicated column`);
    } else if (creditIndex !== -1 && row[creditIndex] && parseAmount(row[creditIndex]) > 0) {
      amount = parseAmount(row[creditIndex]);
      type = 'credit';
      console.log(`Row ${i} - Found credit amount ${amount} in dedicated column`);
    } else if (amountIndex !== -1) {
      // Single amount column - check for DR/CR markers in description first
      const rawAmount = String(row[amountIndex]);
      amount = parseAmount(rawAmount);
      
      if (amount > 0) {
        // First check description for DR/CR indicators
        if (hasDebitMarker) {
          type = 'debit';
          console.log(`Row ${i} - Detected debit from description marker: ${description}`);
        } else if (hasCreditMarker) {
          type = 'credit';
          console.log(`Row ${i} - Detected credit from description marker: ${description}`);
        } else {
          // Check amount string formatting for clues
          const amountStr = rawAmount.toLowerCase();
          if (amountStr.includes('dr') || amountStr.includes('-') || amountStr.startsWith('-')) {
            type = 'debit';
            console.log(`Row ${i} - Detected debit from amount formatting: ${rawAmount}`);
          } else if (amountStr.includes('cr') || amountStr.includes('+')) {
            type = 'credit';
            console.log(`Row ${i} - Detected credit from amount formatting: ${rawAmount}`);
          } else {
            // Look for DR/CR indicators in surrounding columns
            let typeFound = false;
            for (let j = 0; j < row.length; j++) {
              if (j !== amountIndex && j !== dateIndex && j !== descIndex) {
                const cellValue = String(row[j] || '').toLowerCase();
                if (cellValue === 'dr' || cellValue === 'debit') {
                  type = 'debit';
                  typeFound = true;
                  console.log(`Row ${i} - Found debit indicator in column ${j}`);
                  break;
                } else if (cellValue === 'cr' || cellValue === 'credit') {
                  type = 'credit';
                  typeFound = true;
                  console.log(`Row ${i} - Found credit indicator in column ${j}`);
                  break;
                }
              }
            }
            
            if (!typeFound) {
              // Some Nigerian bank statements have a pattern where debits reduce the balance
              // Try to use this as a heuristic if we have a balance column
              let balanceIndex = -1;
              const headers = rows[headerRowIndex].map((h: any) => String(h || '').toLowerCase());
              for (let j = 0; j < headers.length; j++) {
                if (headers[j].includes('balance')) {
                  balanceIndex = j;
                  break;
                }
              }
              
              if (balanceIndex !== -1 && i > headerRowIndex + 1) {
                // Compare with previous row's balance
                const prevBalance = parseAmount(String(rows[i-1][balanceIndex] || 0));
                const currBalance = parseAmount(String(row[balanceIndex] || 0));
                
                if (!isNaN(prevBalance) && !isNaN(currBalance)) {
                  if (currBalance < prevBalance) {
                    type = 'debit';
                    console.log(`Row ${i} - Detected debit by balance reduction`);
                  } else if (currBalance > prevBalance) {
                    type = 'credit';
                    console.log(`Row ${i} - Detected credit by balance increase`);
                  }
                }
              }
              
              if (type === 'unknown') {
                // As a last resort, assume debit for statements (conservative approach)
                type = 'debit';
                console.log(`Row ${i} - Defaulting to debit as conservative approach`);
              }
            }
          }
        }
      }
    }
    
    // Skip if there's no valid amount
    if (amount === 0) {
      console.log(`Skipping row ${i} - zero amount`);
      continue;
    }
    
    // Log the transaction we're about to add for debugging
    console.log(`Adding ${type} transaction: ${formattedDate} | ${description} | ${amount}`);
    
    transactions.push({
      date: formattedDate,
      description,
      amount,
      type
    });
  }
  
  console.log(`Detected ${transactions.length} transactions (${transactions.filter(t => t.type === 'debit').length} debits, ${transactions.filter(t => t.type === 'credit').length} credits)`);
  
  return transactions;
}
