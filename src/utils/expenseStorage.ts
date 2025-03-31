
import { Expense } from '@/types/expense';

export const safelyStoreExpenses = (expenses: Expense[]): boolean => {
  // Skip local storage for large datasets
  if (expenses.length > 100) {
    console.log(`Skipping local storage for large dataset (${expenses.length} expenses)`);
    return true;
  }
  
  try {
    const storableExpenses = expenses.map(expense => {
      const expenseCopy = {...expense};
      
      if (expenseCopy.receiptUrl) {
        expenseCopy.hasReceipt = true;
      }
      
      return {
        ...expenseCopy,
        date: expense.date instanceof Date ? expense.date.toISOString() : String(expense.date)
      };
    });
    
    localStorage.setItem('expenses', JSON.stringify(storableExpenses));
    return true;
  } catch (error) {
    console.error("Failed to store expenses in localStorage:", error);
    
    // Don't show toast errors for localStorage issues
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn("localStorage quota exceeded - skipping local storage");
      return true; // Return true to avoid triggering error flows
    }
    return false;
  }
};

export const loadExpensesFromLocalStorage = () => {
  try {
    const storedExpenses = localStorage.getItem('expenses');
    if (storedExpenses) {
      const parsedExpenses = JSON.parse(storedExpenses);
      
      const processedExpenses = parsedExpenses.map((expense: any) => ({
        ...expense,
        date: new Date(expense.date),
        receiptUrl: expense.receiptUrl || null
      }));
      
      console.log("Loaded expenses from localStorage:", processedExpenses.length);
      return processedExpenses;
    }
    return null;
  } catch (localError) {
    console.error("Failed to parse stored expenses:", localError);
    return null;
  }
};
