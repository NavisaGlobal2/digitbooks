
import { ExpenseCategory } from "@/types/expense";

// Define interface for the API response
export interface ApiResponse {
  success: boolean;
  message?: string;
  statement_id?: string;
  transactions?: any[];
  batchId?: string;
}

// Define interface for the transaction data from Supabase
export interface TransactionData {
  id: string;
  date: string;
  description: string;
  amount: number | string;
  transaction_type?: string;
  category?: string | ExpenseCategory;
}
