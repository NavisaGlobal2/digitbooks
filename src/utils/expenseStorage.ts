
import { Expense } from '@/types/expense';
import { toast } from 'sonner';

// This is a no-op function that doesn't actually store anything in localStorage
export const safelyStoreExpenses = (expenses: Expense[]): boolean => {
  // Intentionally not storing anything to localStorage
  return true;
};

// This function will always return null, preventing loading from localStorage
export const loadExpensesFromLocalStorage = () => {
  return null;
};
