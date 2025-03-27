
export type ExpenseCategory = 
  | 'office' 
  | 'travel' 
  | 'meals' 
  | 'utilities' 
  | 'rent' 
  | 'software' 
  | 'hardware' 
  | 'marketing' 
  | 'salaries' 
  | 'taxes' 
  | 'other';

export type ExpenseStatus = 'pending' | 'approved' | 'rejected';

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: Date;
  category: ExpenseCategory;
  status: ExpenseStatus;
  receiptUrl?: string;
  hasReceipt?: boolean;
  notes?: string;
  paymentMethod: 'cash' | 'card' | 'bank transfer' | 'other';
  vendor: string;
  fromStatement?: boolean;
  batchId?: string;  // This field is now properly typed
}
