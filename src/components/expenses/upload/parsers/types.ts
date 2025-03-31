
export interface ParsedTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "debit" | "credit";
  selected: boolean;
  category?: string;
  source?: string;
  categorySuggestion?: CategorySuggestion;
  batchId?: string;
}

export interface CategorySuggestion {
  category: string;
  confidence: number;
}
