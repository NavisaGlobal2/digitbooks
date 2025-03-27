
import { toast } from "sonner";

export interface ExpenseFormData {
  description: string;
  amount: string;
  date: string;
  category: string;
  paymentMethod: string;
}

export const useExpenseValidation = () => {
  const validateForm = (formData: ExpenseFormData): boolean => {
    const { description, amount, date, category, paymentMethod } = formData;
    
    if (!description) {
      toast.error("Please enter an expense name");
      return false;
    }
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return false;
    }
    
    if (!date) {
      toast.error("Please select a date");
      return false;
    }
    
    if (!category) {
      toast.error("Please select a category");
      return false;
    }
    
    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return false;
    }
    
    return true;
  };

  return {
    validateForm
  };
};
