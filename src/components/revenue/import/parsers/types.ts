
import { RevenueSource } from "@/types/revenue";

export type ParsedTransactionType = 'debit' | 'credit';

export interface SourceSuggestion {
  source: RevenueSource;
  confidence: number;
}

export interface ParsedTransaction {
  id: string;
  date: string | Date;
  description: string;
  amount: number;
  type: ParsedTransactionType;
  source?: RevenueSource;
  selected?: boolean;
  sourceSuggestion?: SourceSuggestion;
}

export interface CSVParseResult {
  transactions: ParsedTransaction[];
  headers: string[];
  rawData: any[][];
}
