
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

export interface Revenue {
  id: string;
  description: string;
  amount: number;
  date: Date;
  source: RevenueSource;
  notes?: string;
  paymentMethod: 'cash' | 'card' | 'bank transfer' | 'crypto' | 'other';
  clientId?: string;
  clientName?: string;
  invoiceId?: string;
  isRecurring?: boolean;
  category?: string;
}
