
import { RevenueSource } from "@/types/revenue";

export interface ParsedTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "debit" | "credit" | "unknown";
  selected: boolean;
  source?: RevenueSource;
  sourceSuggestion?: {
    source: RevenueSource;
    confidence: number;
  };
  originalDate?: string;
  originalAmount?: string | number;
  preservedColumns?: Record<string, string | number>;
}

export interface CSVParseResult {
  transactions: ParsedTransaction[];
  fileName: string;
  headers: string[];
  rawData: any[];
}
