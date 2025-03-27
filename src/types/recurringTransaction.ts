
export type TransactionFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
export type TransactionType = 'expense' | 'revenue';
export type TransactionStatus = 'active' | 'paused' | 'completed';

export interface RecurringTransaction {
  id: string;
  description: string;
  amount: number;
  frequency: TransactionFrequency;
  start_date: string;
  end_date?: string;
  category_id?: string;
  transaction_type: TransactionType;
  bank_account_id?: string;
  next_due_date?: string;
  status?: TransactionStatus;
  created_at: string;
  updated_at: string;
}
