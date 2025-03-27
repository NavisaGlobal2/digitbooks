
export interface TaxRate {
  id: string;
  name: string;
  rate: number;
  description?: string;
  is_default?: boolean;
  created_at: string;
  updated_at: string;
}
