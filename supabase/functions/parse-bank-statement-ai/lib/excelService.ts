
/**
 * Check if a file is an Excel file based on extension
 */
export function isExcelFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return name.endsWith('.xlsx') || name.endsWith('.xls');
}
