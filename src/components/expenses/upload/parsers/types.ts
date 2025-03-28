
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
}

export interface CSVParseResult {
  transactions: ParsedTransaction[];
  headers: string[];
  rawData: any[][];
}
