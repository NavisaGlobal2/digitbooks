import * as XLSX from 'xlsx';
import { toast } from "sonner";

export interface SheetData {
  headers: string[];
  rows: any[][];
  sheetNames: string[];
  activeSheet: string;
  raw: any;
}

/**
 * Service for handling Excel file operations using SheetJS (XLSX)
 */
export const ExcelService = {
  /**
   * Read an Excel file and extract its contents
   * @param file The Excel file to read
   * @returns Promise with the extracted sheet data
   */
  readFile: async (file: File): Promise<SheetData> => {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        
        reader.onload = (e) => {
          try {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Get the first sheet by default
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // Convert sheet to JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
            
            // Identify headers (first row)
            const headers = jsonData.length > 0 ? 
              (jsonData[0] as any[]).map(cell => String(cell || '')) : [];
            
            // Get data rows (everything after first row)
            const rows = jsonData.slice(1) as any[][];
            
            resolve({
              headers,
              rows,
              sheetNames: workbook.SheetNames,
              activeSheet: firstSheetName,
              raw: workbook
            });
          } catch (err) {
            console.error('Error processing Excel file:', err);
            reject(new Error('Failed to process Excel file'));
          }
        };
        
        reader.onerror = () => {
          reject(new Error('Failed to read Excel file'));
        };
        
        reader.readAsArrayBuffer(file);
      } catch (error) {
        console.error('Exception in readFile:', error);
        reject(error);
      }
    });
  },

  /**
   * Get data from a specific sheet in the workbook
   * @param workbook The workbook object
   * @param sheetName The name of the sheet to extract
   * @returns The extracted sheet data
   */
  getSheetData: (workbook: XLSX.WorkBook, sheetName: string): SheetData => {
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert sheet to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
    
    // Identify headers (first row)
    const headers = jsonData.length > 0 ? 
      (jsonData[0] as any[]).map(cell => String(cell || '')) : [];
      
    // Get data rows (everything after first row)
    const rows = jsonData.slice(1) as any[][];
    
    return {
      headers,
      rows,
      sheetNames: workbook.SheetNames,
      activeSheet: sheetName,
      raw: workbook
    };
  },
  
  /**
   * Detect probable column types in sheet data
   * @param sheetData The sheet data to analyze
   * @returns An object mapping column indices to their detected types
   */
  detectColumnTypes: (sheetData: SheetData): Record<number, 'date' | 'number' | 'text'> => {
    const columnTypes: Record<number, 'date' | 'number' | 'text'> = {};
    const { headers, rows } = sheetData;
    
    if (!rows.length) return columnTypes;
    
    // Analyze each column
    for (let colIndex = 0; colIndex < headers.length; colIndex++) {
      let dateCount = 0;
      let numberCount = 0;
      let textCount = 0;
      
      // Sample up to 20 rows for performance
      const sampleSize = Math.min(rows.length, 20);
      
      for (let i = 0; i < sampleSize; i++) {
        const value = rows[i][colIndex];
        if (!value) continue;
        
        // Check if it looks like a date
        if (isDateLike(value)) {
          dateCount++;
        } 
        // Check if it's a number
        else if (!isNaN(parseFloat(String(value))) && isFinite(Number(value))) {
          numberCount++;
        } else {
          textCount++;
        }
      }
      
      // Determine most likely type
      if (dateCount > numberCount && dateCount > textCount) {
        columnTypes[colIndex] = 'date';
      } else if (numberCount > textCount) {
        columnTypes[colIndex] = 'number';
      } else {
        columnTypes[colIndex] = 'text';
      }
    }
    
    return columnTypes;
  },
  
  /**
   * Create a new Excel file with specified data
   * @param data 2D array of data to include in the sheet
   * @param sheetName Name for the sheet
   * @returns The created workbook
   */
  createWorkbook: (data: any[][], sheetName: string = 'Sheet1'): XLSX.WorkBook => {
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    return wb;
  },
  
  /**
   * Export data to an Excel file and download it
   * @param data The data to export
   * @param filename The name for the downloaded file
   */
  exportToExcel: (data: any[][], filename: string = 'export.xlsx'): void => {
    try {
      const wb = ExcelService.createWorkbook(data);
      XLSX.writeFile(wb, filename);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Failed to export data to Excel');
    }
  },

  /**
   * Extract text content from an Excel file
   * @param file The Excel file to extract text from
   * @returns Promise with the extracted text content
   */
  extractTextFromExcel: async (file: File): Promise<string> => {
    try {
      const sheetData = await ExcelService.readFile(file);
      let textContent = `[EXCEL FILE: ${file.name}]\n\n`;
      
      // Add sheet name and headers
      textContent += `Sheet: ${sheetData.activeSheet}\n`;
      textContent += sheetData.headers.join('\t') + '\n';
      
      // Add all rows
      for (const row of sheetData.rows) {
        textContent += row.join('\t') + '\n';
      }
      
      return textContent;
    } catch (error) {
      console.error('Error extracting text from Excel file:', error);
      throw new Error(`Failed to extract text from Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};

/**
 * Helper function to check if a value looks like a date
 */
function isDateLike(value: any): boolean {
  if (value instanceof Date) return true;
  
  // Check if it's a number that might be an Excel date
  if (typeof value === 'number' && value > 30000 && value < 50000) return true;
  
  if (typeof value === 'string') {
    // Check common date patterns
    const datePatterns = [
      /^\d{1,4}[-\/\.]\d{1,2}[-\/\.]\d{1,4}$/, // yyyy-mm-dd, dd/mm/yyyy
      /^\d{1,2}[-\/\s][A-Za-z]{3,}[-\/\s]\d{2,4}$/, // 01 Jan 2022
      /^[A-Za-z]{3,}[\s-\/]\d{1,2}[\s-\/]\d{2,4}$/, // Jan 01 2022
    ];
    
    for (const pattern of datePatterns) {
      if (pattern.test(value)) return true;
    }
    
    // Try with Date.parse as last resort
    const timestamp = Date.parse(value);
    if (!isNaN(timestamp)) return true;
  }
  
  return false;
}

/**
 * Check if a file is an Excel file based on extension and/or mime type
 * @param file The file to check
 * @returns boolean indicating if the file is an Excel file
 */
export const isExcelFile = (file: File): boolean => {
  const excelMimeTypes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  const excelExtensions = ['.xlsx', '.xls', '.xlsm', '.xlsb'];
  
  // Check mime type
  if (excelMimeTypes.includes(file.type)) {
    return true;
  }
  
  // Check file extension
  const fileName = file.name.toLowerCase();
  return excelExtensions.some(ext => fileName.endsWith(ext));
};
