
import * as XLSX from 'https://deno.land/x/xlsx@v0.4.3/mod.ts'
import { Transaction } from '../types.ts'
import { detectAndParseTransactions } from './transactionDetector.ts'

// Process Excel file
export async function processExcel(file: File): Promise<Transaction[]> {
  const arrayBuffer = await file.arrayBuffer()
  const workbook = await XLSX.readFile(new Uint8Array(arrayBuffer))
  
  // Get the first sheet
  const worksheet = workbook.Sheets[workbook.SheetNames[0]]
  if (!worksheet) {
    throw new Error('No worksheet found in Excel file')
  }
  
  // Convert to rows
  const jsonData = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1 })
  
  // Try to detect columns by header or position
  return detectAndParseTransactions(jsonData)
}
