
// This file is maintained for backward compatibility
// It re-exports the refactored budget context from the new structure

import { BudgetProvider, BudgetContext } from './budget/BudgetProvider';
import { useBudget } from './budget/useBudget';
export type { Budget, BudgetCategory } from './budget/types';

export { BudgetProvider, BudgetContext, useBudget };
