
export interface ParsedTransaction {
  id: string;
  date: string;  // ISO string format for consistency across all parsers
  description: string;
  amount: number;
  type: "debit" | "credit";
  selected: boolean;
  category?: string;
  source?: string;
  categorySuggestion?: CategorySuggestion;
  batchId?: string;
  originalDate?: string | Date; // For preserving original date format if needed
}

export interface CategorySuggestion {
  category: string;
  confidence: number;
}
