
export type CategoryType = 'expense' | 'revenue' | 'both';

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: CategoryType;
  description?: string;
  color?: string;
  icon?: string;
  created_at: string;
  updated_at: string;
}
