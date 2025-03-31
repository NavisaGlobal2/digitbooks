
import { Transaction } from '../types.ts'
import { parseExcelBinary } from './excel/binaryParser.ts'
import { cleanupExtractedData, detectColumnsWithoutHeaders, extractTransactionsWithoutHeaders } from './excel/dataExtractor.ts'
import { detectAndParseTransactions } from './transactionDetector.ts'

// Process Excel file
export async function processExcel(file: File, options: { preserveOriginalData?: boolean } = {}): Promise<Transaction[]> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    
    // Parse the Excel file as a binary file and convert it to CSV-like data structure
    const data = await parseExcelBinary(arrayBuffer)
    
    console.log(`Extracted ${data.length} rows from Excel file`);
    
    // If we have very few rows, it may not be a valid Excel file
    if (data.length < 2) {
      throw new Error('The Excel file does not contain enough data. Please check your file format.');
    }
    
    // Try to detect columns by header or position using the same detector as for CSV
    return detectAndParseTransactions(data)
  } catch (error) {
    console.error('Error processing Excel file:', error)
    throw new Error(`Failed to process Excel file: ${error.message}`)
  }
}
