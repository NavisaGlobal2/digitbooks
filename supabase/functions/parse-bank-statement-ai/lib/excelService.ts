
/**
 * Check if a file is an Excel file based on extension or content type
 */
export function isExcelFile(file: File): boolean {
  const name = file.name.toLowerCase();
  const contentType = file.type.toLowerCase();
  
  // Check file extension
  const isExcelByExtension = name.endsWith('.xlsx') || 
                             name.endsWith('.xls') || 
                             name.endsWith('.xlsm') || 
                             name.endsWith('.xlsb');
  
  // Check MIME type
  const isExcelByType = contentType.includes('spreadsheet') || 
                        contentType.includes('excel') ||
                        contentType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                        contentType === 'application/vnd.ms-excel';
                        
  return isExcelByExtension || isExcelByType;
}

/**
 * Check if the Excel file has a specific structure that can be directly parsed
 */
export function getPossibleExcelSheetNames(): string[] {
  // Common sheet names used in bank statements
  return [
    'Sheet1', 'Sheet 1', 'Transactions', 'Statement', 
    'Bank Statement', 'Account Statement', 'Data',
    'Transactions Data', 'Account', 'Records',
    'Main', 'Activity'
  ];
}

/**
 * Get column mappings for common bank statement formats
 */
export function getCommonColumnMappings(): Record<string, string[]> {
  return {
    date: ['date', 'transaction date', 'posting date', 'value date', 'transaction_date', 'trans_date', 'txn date'],
    description: ['description', 'narration', 'narrative', 'details', 'transaction details', 'particulars'],
    amount: ['amount', 'transaction amount', 'debit', 'credit', 'value', 'amount (naira)'],
    balance: ['balance', 'running balance', 'closing balance', 'bal']
  };
}
