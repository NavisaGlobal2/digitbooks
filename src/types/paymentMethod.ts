
export interface PaymentMethod {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}
