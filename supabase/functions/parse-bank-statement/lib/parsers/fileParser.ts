
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
        return await processCSV(file)
      } catch (csvError) {
        console.error('CSV processing error:', csvError)
        throw new Error(`Failed to process CSV file: ${csvError.message}. Please check if your file is properly formatted and contains date, description, and amount columns.`)
      }
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      try {
        return await processExcel(file)
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
