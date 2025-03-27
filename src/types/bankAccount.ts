
export type AccountType = 'checking' | 'savings' | 'credit' | 'investment' | 'other';

export interface BankAccount {
  id: string;
  name: string;
  account_number?: string;
  bank_name?: string;
  account_type?: AccountType | string;
  balance?: number;
  currency?: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}
