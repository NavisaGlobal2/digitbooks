
import { ExpenseProvider, ExpenseContext } from './expense/ExpenseProvider';
import { useExpenses } from './expense/useExpenses';
import type { ExpenseContextType } from './expense/types';

// Reexport everything for backwards compatibility
export { ExpenseContext, ExpenseProvider, useExpenses };
export type { ExpenseContextType };
