
import { parse as csvParse } from 'https://deno.land/std@0.177.0/encoding/csv.ts'
import { Transaction } from '../types.ts'
import { detectAndParseTransactions } from './transactionDetector.ts'

// Process CSV file
export async function processCSV(file: File): Promise<Transaction[]> {
  const text = await file.text()
  const rows = await csvParse(text, { skipFirstRow: true })
  
  // Try to detect columns by header or position
  return detectAndParseTransactions(rows)
}
