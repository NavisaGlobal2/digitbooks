
export interface TaxRate {
  id: string;
  user_id: string;
  name: string;
  rate: number;
  description?: string;
  is_default?: boolean;
  created_at: string;
  updated_at: string;
}
