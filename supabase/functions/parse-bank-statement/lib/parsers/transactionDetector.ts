
import { Transaction, TransactionType } from '../types.ts'
import { parseAmount } from './helpers.ts'

// Detect and parse transactions from row data
export function detectAndParseTransactions(rows: any[]): Transaction[] {
  if (rows.length < 2) {
    throw new Error('File contains insufficient data')
  }
  
  // Get headers (first row) and check if they exist
  const headers = rows[0]
  
  // Try to determine column indices
  let dateIndex = -1
  let descIndex = -1
  let amountIndex = -1
  
  // Common header names for each column
  const dateHeaders = ['date', 'transaction date', 'posted date', 'posting date']
  const descHeaders = ['description', 'desc', 'narrative', 'details', 'transaction description', 'particulars']
  const amountHeaders = ['amount', 'transaction amount', 'sum', 'value', 'debit/credit']
  
  // Find column indices from headers
  headers.forEach((header: string, index: number) => {
    const headerLower = String(header).toLowerCase()
    
    if (dateHeaders.some(h => headerLower.includes(h))) {
      dateIndex = index
    }
    
    if (descHeaders.some(h => headerLower.includes(h))) {
      descIndex = index
    }
    
    if (amountHeaders.some(h => headerLower.includes(h))) {
      amountIndex = index
    }
  })
  
  // If we couldn't find proper headers, make an educated guess
  if (dateIndex === -1 || descIndex === -1 || amountIndex === -1) {
    // Try positional guessing as fallback
    const sampleRow = rows[1]
    for (let i = 0; i < sampleRow.length; i++) {
      const value = String(sampleRow[i])
      // Check if this looks like a date
      if (dateIndex === -1 && /\d{1,4}[-/\.]\d{1,2}[-/\.]\d{1,4}/.test(value)) {
        dateIndex = i
      }
      // Check if this looks like a description (longer text)
      else if (descIndex === -1 && value.length > 10 && isNaN(Number(value))) {
        descIndex = i
      }
      // Check if this looks like an amount (number)
      else if (amountIndex === -1 && !isNaN(Number(value.replace(/[,$€£]/g, '')))) {
        amountIndex = i
      }
    }
  }
  
  // If we still can't determine columns, throw an error
  if (dateIndex === -1 || descIndex === -1 || amountIndex === -1) {
    throw new Error('Could not identify required columns (date, description, amount) in the file')
  }
  
  // Parse transactions from rows, skipping header
  const transactions: Transaction[] = []
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    if (!row || row.length === 0) continue
    
    let dateValue = row[dateIndex]
    let description = String(row[descIndex] || '')
    let amount = parseAmount(row[amountIndex])
    
    // Skip rows with missing essential data
    if (!dateValue || !description || amount === 0) continue
    
    // Parse date - try different formats
    let parsedDate: Date | null = null
    
    if (typeof dateValue === 'string') {
      // Try parsing date string
      const dateParts = dateValue.split(/[-/.]/g)
      if (dateParts.length === 3) {
        // Try different date formats (MM/DD/YYYY, DD/MM/YYYY, YYYY/MM/DD)
        const possibleDates = [
          new Date(`${dateParts[2]}-${dateParts[0]}-${dateParts[1]}`), // MM/DD/YYYY
          new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`), // DD/MM/YYYY
          new Date(`${dateParts[0]}-${dateParts[1]}-${dateParts[2]}`)  // YYYY/MM/DD
        ]
        
        // Use the first valid date
        parsedDate = possibleDates.find(d => !isNaN(d.getTime())) || null
      } else {
        parsedDate = new Date(dateValue)
      }
    } else if (typeof dateValue === 'number') {
      // Excel dates are stored as numbers (days since 1900-01-01)
      const excelEpoch = new Date(1900, 0, 1)
      parsedDate = new Date(excelEpoch.getTime() + (dateValue - 1) * 24 * 60 * 60 * 1000)
    }
    
    // Skip if date is invalid
    if (!parsedDate || isNaN(parsedDate.getTime())) continue
    
    // Format date as ISO string (YYYY-MM-DD)
    const formattedDate = parsedDate.toISOString().split('T')[0]
    
    // Determine transaction type based on amount (negative = debit, positive = credit)
    const type: TransactionType = amount < 0 ? 'debit' : amount > 0 ? 'credit' : 'unknown'
    
    // Use absolute value for the amount
    amount = Math.abs(amount)
    
    transactions.push({
      date: formattedDate,
      description,
      amount,
      type
    })
  }
  
  return transactions
}
