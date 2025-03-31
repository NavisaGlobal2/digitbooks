
/**
 * Re-export the expense context from the modular structure
 * for backwards compatibility
 */
 
import { ExpenseProvider, ExpenseContext } from './expense/ExpenseProvider';
import { useExpenses } from './expense/useExpenses';
import type { ExpenseContextType } from './expense/types';

export { ExpenseContext, ExpenseProvider, useExpenses };
export type { ExpenseContextType };
