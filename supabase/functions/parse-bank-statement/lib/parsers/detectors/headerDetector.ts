
// Helper function to find the likely header row
export function findHeaderRow(rows: any[]): number {
  // Common header keywords to look for
  const headerKeywords = ['date', 'description', 'amount', 'transaction', 'debit', 'credit', 'balance'];
  
  // Check the first 8 rows (or fewer if file is smaller)
  const rowsToCheck = Math.min(8, rows.length);
  
  for (let i = 0; i < rowsToCheck; i++) {
    const row = rows[i];
    if (!row || !Array.isArray(row)) continue;
    
    const rowStr = row.map((cell: any) => String(cell || '').toLowerCase()).join(' ');
    
    // Count how many header keywords are found in this row
    let keywordMatches = 0;
    for (const keyword of headerKeywords) {
      if (rowStr.includes(keyword)) keywordMatches++;
    }
    
    // If at least 2 keywords match, this is likely a header row
    if (keywordMatches >= 2) {
      return i;
    }
  }
  
  // Fallback: assume first row is header
  return 0;
}

// Helper function to find column index by trying multiple possible headers
export function findColumnIndex(headers: string[], possibleNames: string[]): number {
  // First try exact matches
  for (const name of possibleNames) {
    const index = headers.findIndex(h => h === name);
    if (index !== -1) return index;
  }
  
  // Then try partial matches
  for (const name of possibleNames) {
    const index = headers.findIndex(h => h.includes(name));
    if (index !== -1) return index;
  }
  
  // Finally try if any header contains any of the names
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i];
    for (const name of possibleNames) {
      if (name.includes(header)) return i;
    }
  }
  
  return -1;
}
