
export interface ParsedTransaction {
  id: string;
  date: string;  // ISO string format for consistency across all parsers
  description: string;
  amount: number;
  type: "debit" | "credit" | "unknown";  // Added "unknown" as a valid type
  selected: boolean;
  category?: string;
  source?: string;
  categorySuggestion?: CategorySuggestion;
  batchId?: string;
  originalDate?: string | Date; // For preserving original date format if needed
  originalAmount?: string | number; // For preserving original amount format
  preservedColumns?: Record<string, any>; // For preserving additional columns from Excel
  [key: string]: any; // Allow for additional properties that might be returned from the parser
}

export interface CategorySuggestion {
  category: string;
  confidence: number;
}
