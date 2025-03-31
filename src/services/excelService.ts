
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
  },

  /**
   * Export data to an Excel file
   * @param data The data to export (array of arrays, first row is headers)
   * @param fileName The name to give the downloaded file
   */
  exportToExcel: (data: any[][], fileName: string = 'exported-data.xlsx') => {
    try {
      // Create a new workbook
      const workbook = XLSX.utils.book_new();
      
      // Convert the data to a worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(data);
      
      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      
      // Generate the Excel file and trigger download
      XLSX.writeFile(workbook, fileName);
      
      toast.success(`Successfully exported to ${fileName}`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Failed to export data to Excel');
    }
  }
};

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
