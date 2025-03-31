
import { Expense, ExpenseStatus } from '@/types/expense';

export interface ExpenseContextType {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  addExpenses: (expenses: Omit<Expense, 'id'>[]) => void;
  updateExpenseStatus: (expenseId: string, status: ExpenseStatus) => void;
  deleteExpense: (expenseId: string) => void;
  getTotalExpenses: () => number;
  getExpensesByCategory: () => Record<string, number>;
  updateExpense: (expense: Expense) => void;
}
