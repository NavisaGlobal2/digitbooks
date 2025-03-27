
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
      return await processCSV(file)
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      return await processExcel(file)
    } else if (fileName.endsWith('.pdf')) {
      throw new Error('PDF parsing is not supported by the server function. Please use CSV or Excel format.')
    } else {
      throw new Error('Unsupported file format. Please upload CSV or Excel files.')
    }
  } catch (error) {
    console.error(`Error parsing file ${file.name}:`, error)
    throw new Error(`Failed to process file: ${error.message}`)
  }
}

