
/**
 * @deprecated This file has been refactored into smaller files.
 * Please import from the new structure:
 * - Types: from 'src/components/expenses/upload/parsers/types.ts'
 * - Helpers: from 'src/components/expenses/upload/parsers/helpers.ts'
 * - CSV parsing: from 'src/components/expenses/upload/parsers/csvParser.ts'
 * - Excel parsing: from 'src/components/expenses/upload/parsers/excelParser.ts'
 * - PDF parsing: from 'src/components/expenses/upload/parsers/pdfParser.ts'
 * - Edge function: from 'src/components/expenses/upload/parsers/edgeFunctionParser.ts'
 * 
 * Import everything from: 'src/components/expenses/upload/parsers/index.ts'
 */

// Re-export everything from the new structure to maintain backward compatibility
export * from "./parsers";
