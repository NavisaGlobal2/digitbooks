
import { Transaction } from '../types.ts'
import { processCSV } from './csvParser.ts'
import { processExcel } from './excelParser.ts'

// Parse the file based on its type
export async function parseFile(file: File): Promise<Transaction[]> {
  const fileName = file.name.toLowerCase()
  
  if (fileName.endsWith('.csv')) {
    return await processCSV(file)
  } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    return await processExcel(file)
  } else {
    throw new Error('Unsupported file format. Please upload CSV or Excel files.')
  }
}
