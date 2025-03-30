
/**
 * Excel service for handling Excel file operations
 * Using SheetJS from CDN instead of the problematic excel library
 */
export class ExcelService {
  /**
   * Extract text from Excel file
   * @param file Excel file
   * @returns Promise with extracted text
   */
  static async extractTextFromExcel(file: File): Promise<string> {
    try {
      // Load XLSX library from CDN (this is safer than the deno.land/x/excel module)
      const XLSX = await import('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm');
      
      // Convert file to ArrayBuffer
      const buffer = await file.arrayBuffer();
      
      // Parse workbook
      const workbook = XLSX.read(buffer, { type: 'array' });
      
      // Get sheet names
      const sheetNames = workbook.SheetNames;
      
      if (sheetNames.length === 0) {
        throw new Error("No sheets found in Excel file");
      }
      
      // Extract text from each sheet
      let result = `EXCEL DOCUMENT: ${file.name}\n\n`;
      
      for (const sheetName of sheetNames) {
        const sheet = workbook.Sheets[sheetName];
        
        // Convert sheet to JSON
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        
        // Skip empty sheets
        if (jsonData.length === 0) continue;
        
        // Add sheet name
        result += `Sheet: ${sheetName}\n`;
        
        // Look for account information in first few rows
        const accountInfo = this.extractAccountInfo(jsonData);
        if (accountInfo.account_holder) {
          result += `${accountInfo.account_holder}\n`;
        }
        if (accountInfo.account_number) {
          result += `Account ${accountInfo.account_number}\n`;
        }
        
        // Format rows
        for (const row of jsonData) {
          if (Array.isArray(row) && row.length > 0) {
            result += row.join('\t') + '\n';
          }
        }
        
        result += '\n';
      }
      
      return result;
    } catch (error) {
      console.error("Error extracting text from Excel file:", error);
      
      // Fallback: Return a simplified description of the file
      return `EXCEL DOCUMENT: ${file.name}\n\nCould not parse Excel file: ${error.message}\nPlease try converting to CSV format.`;
    }
  }
  
  /**
   * Extract account information from the Excel data
   */
  static extractAccountInfo(data: any[][]): { 
    account_holder?: string;
    account_number?: string;
  } {
    const result: { account_holder?: string; account_number?: string } = {};
    
    // Search only in the first several rows
    const rowsToCheck = Math.min(10, data.length);
    
    for (let i = 0; i < rowsToCheck; i++) {
      const row = data[i];
      if (!row || !Array.isArray(row)) continue;
      
      const rowText = row.join(' ').toLowerCase();
      
      // Check for account holder
      if (!result.account_holder && (rowText.includes('account') || rowText.includes('name'))) {
        for (const cell of row) {
          if (cell && typeof cell === 'string' && cell.length > 3 && 
              !cell.toLowerCase().includes('account') && 
              !cell.toLowerCase().includes('name')) {
            result.account_holder = cell;
            break;
          }
        }
      }
      
      // Check for account number
      if (!result.account_number && rowText.includes('account')) {
        const numberMatch = rowText.match(/account[^0-9]*([0-9-]+)/i);
        if (numberMatch && numberMatch[1]) {
          result.account_number = numberMatch[1];
        } else {
          // Try to find a cell that looks like an account number
          for (const cell of row) {
            if (cell && typeof cell === 'string' && 
                /^[0-9-]{5,}$/.test(cell.replace(/\s/g, ''))) {
              result.account_number = cell;
              break;
            }
          }
        }
      }
    }
    
    return result;
  }
}
