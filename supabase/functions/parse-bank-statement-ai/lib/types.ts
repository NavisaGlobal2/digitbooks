
// Define the Transaction interface for the AI service
export interface Transaction {
  // Required fields
  id?: string;
  date?: string | Date;
  description?: string;
  amount?: number | string;
  type?: "debit" | "credit" | "unknown";
  
  // Optional fields
  category?: string;
  selected?: boolean;
  source?: string;
  
  // For preserving original data
  originalDate?: string | Date;
  originalAmount?: number | string;
  
  // Any additional properties from original data
  [key: string]: any;
}
