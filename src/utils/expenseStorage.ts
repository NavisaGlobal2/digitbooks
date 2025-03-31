
import { Expense } from '@/types/expense';
import { toast } from 'sonner';

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
        toast.warning("Some expense data couldn't be stored locally due to size limits");
        return true;
      } catch (fallbackError) {
        console.error("Failed to store limited expenses:", fallbackError);
        toast.error("Failed to save your expenses. Please export them if needed.");
        return false;
      }
    }
    toast.error("Failed to save your expenses. Please export them if needed.");
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
    toast.error("Failed to load your saved expenses");
    return null;
  }
};
