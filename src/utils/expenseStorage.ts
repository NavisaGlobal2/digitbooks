
import { Expense } from '@/types/expense';
import { toast } from 'sonner';

// Track toast displayed status to avoid duplicates
let storageWarningShown = false;

// Reset the warning flag after some time
const resetWarningFlag = () => {
  setTimeout(() => {
    storageWarningShown = false;
  }, 5000); // Reset after 5 seconds
};

export const safelyStoreExpenses = (expenses: Expense[]): boolean => {
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
    
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      try {
        const limitedExpenses = expenses.slice(0, 50).map(expense => ({
          id: expense.id,
          description: expense.description,
          amount: expense.amount,
          date: expense.date instanceof Date ? expense.date.toISOString() : String(expense.date),
          category: expense.category,
          status: expense.status,
          paymentMethod: expense.paymentMethod,
          vendor: expense.vendor,
          receiptUrl: expense.receiptUrl,
          hasReceipt: !!expense.receiptUrl
        }));
        
        localStorage.setItem('expenses', JSON.stringify(limitedExpenses));
        
        // Only show toast if we haven't shown it recently
        if (!storageWarningShown) {
          toast.warning("Some expense data couldn't be stored locally due to size limits");
          storageWarningShown = true;
          resetWarningFlag();
        }
        
        return true;
      } catch (fallbackError) {
        console.error("Failed to store limited expenses:", fallbackError);
        
        // Only show toast if we haven't shown it recently
        if (!storageWarningShown) {
          toast.error("Failed to save your expenses. Please export them if needed.");
          storageWarningShown = true;
          resetWarningFlag();
        }
        
        return false;
      }
    }
    
    // Only show toast if we haven't shown it recently
    if (!storageWarningShown) {
      toast.error("Failed to save your expenses. Please export them if needed.");
      storageWarningShown = true;
      resetWarningFlag();
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
    
    // Only show toast if we haven't shown it recently
    if (!storageWarningShown) {
      toast.error("Failed to load your saved expenses");
      storageWarningShown = true;
      resetWarningFlag();
    }
    
    return null;
  }
};
