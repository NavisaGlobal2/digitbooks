
import { Transaction } from '../types.ts'
import { processCSV } from './csvParser.ts'
import { processExcel } from './excelParser.ts'
import { validateFile } from '../validation.ts'

// Parse the file based on its type
export async function parseFile(file: File): Promise<Transaction[]> {
  try {
    // Run validation again as a safeguard
    const validationError = validateFile(file)
    if (validationError) {
      throw new Error(validationError)
    }
    
    const fileName = file.name.toLowerCase()
    
    console.log(`Processing file: ${fileName}, size: ${file.size} bytes, type: ${file.type}`)
    
    if (fileName.endsWith('.csv')) {
      try {
        console.log('Processing CSV file...')
        const transactions = await processCSV(file)
        console.log(`Successfully extracted ${transactions.length} transactions from CSV`)
        console.log(`Transaction types breakdown: ${transactions.filter(t => t.type === 'debit').length} debits, ${transactions.filter(t => t.type === 'credit').length} credits`)
        return transactions
      } catch (csvError) {
        console.error('CSV processing error:', csvError)
        throw new Error(`Failed to process CSV file: ${csvError.message}. Please check if your file is properly formatted and contains date, description, and amount columns.`)
      }
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      try {
        console.log('Processing Excel file...')
        const transactions = await processExcel(file)
        console.log(`Successfully extracted ${transactions.length} transactions from Excel`)
        console.log(`Transaction types breakdown: ${transactions.filter(t => t.type === 'debit').length} debits, ${transactions.filter(t => t.type === 'credit').length} credits`)
        return transactions
      } catch (excelError) {
        console.error('Excel processing error:', excelError)
        throw new Error(`Failed to process Excel file: ${excelError.message}. Please check if your file is properly formatted and contains date, description, and amount columns.`)
      }
    } else if (fileName.endsWith('.pdf')) {
      throw new Error('PDF parsing is not supported by the server function. Please use CSV or Excel format.')
    } else {
      throw new Error('Unsupported file format. Please upload CSV or Excel files.')
    }
  } catch (error) {
    console.error(`Error parsing file ${file.name}:`, error)
    
    // Provide more helpful error messages
    let errorMessage = error.message;
    
    if (errorMessage.includes('columns')) {
      errorMessage += ' Please ensure your file contains columns for transaction date, description/narrative, and transaction amount.';
    } else if (errorMessage.includes('format')) {
      errorMessage += ' Supported file formats are CSV (.csv) and Excel (.xlsx, .xls).';
    }
    
    throw new Error(`Failed to process file: ${errorMessage}`)
  }
}
