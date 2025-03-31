
import { ExpenseCategory } from "@/types/expense";

export type ParsedTransactionType = 'debit' | 'credit';

export interface CategorySuggestion {
  category: ExpenseCategory;
  confidence: number;
}

export interface ParsedTransaction {
  id: string;
  date: string | Date;
  description: string;
  amount: number;
  type: ParsedTransactionType;
  category?: ExpenseCategory;
  selected?: boolean;
  categorySuggestion?: CategorySuggestion;
  batchId?: string; // Added to fix type errors
}

export interface CSVParseResult {
  transactions: ParsedTransaction[];
  headers: string[];
  rawData: any[][];
}
