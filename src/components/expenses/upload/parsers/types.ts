
export interface ParsedTransaction {
  id: string;
  date: string | Date;
  description: string;
  amount: number;
  type: "debit" | "credit" | "unknown";
  selected: boolean;
  category?: string;
  source?: string;
  
  // Original format preservation
  originalDate?: string | Date;
  originalAmount?: string | number;
  preservedColumns?: Record<string, any>;
  
  // Allow additional properties 
  [key: string]: any;
}

export interface TransactionParsingOptions {
  context?: string;
  fileType?: string;
  preserveOriginalFormat?: boolean;
  useAIFormatting?: boolean;
}

export interface TransactionProcessResult {
  transactions: ParsedTransaction[];
  originalFormat?: boolean;
  formatInfo?: {
    dateFormat?: string;
    decimalSeparator?: string;
    thousandsSeparator?: string;
  };
  metadata?: Record<string, any>;
}
