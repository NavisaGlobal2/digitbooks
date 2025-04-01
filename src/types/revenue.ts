
export type RevenueSource = 
  | 'sales' 
  | 'services' 
  | 'investments' 
  | 'grants' 
  | 'donations' 
  | 'royalties' 
  | 'rental' 
  | 'consulting' 
  | 'affiliate' 
  | 'other';

export type PaymentStatus = 'paid' | 'pending' | 'overdue' | 'cancelled';

export type PaymentMethod = 'cash' | 'card' | 'bank transfer' | 'crypto' | 'other';

export interface Revenue {
  id: string;
  user_id?: string;
  revenue_number?: string;
  description: string;
  amount: number;
  date: Date;
  source: RevenueSource;
  notes?: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  client_name?: string;
  created_at?: Date;
}
