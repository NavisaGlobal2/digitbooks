
import { useState } from "react";
import { toast } from "sonner";
import { useExpenses } from "@/contexts/ExpenseContext";
import { ExpenseCategory } from "@/types/expense";

export const useExpenseDialog = (onCloseDialog: () => void) => {
  const { addExpense } = useExpenses();
  
  // Form states
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<ExpenseCategory | "">("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  
  const clearForm = () => {
    setDescription("");
    setAmount("");
    setDate(new Date().toISOString().split('T')[0]);
    setCategory("");
    setPaymentMethod("");
    setReceiptFile(null);
  };
  
  const handleClose = () => {
    clearForm();
    onCloseDialog();
  };
  
  const validateForm = () => {
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
  
  const handleSave = () => {
    if (!validateForm()) return;
    
    if (receiptFile) {
      const reader = new FileReader();
      reader.readAsDataURL(receiptFile);
      reader.onload = () => {
        const receiptUrl = reader.result as string;
        
        addExpense({
          description,
          amount: Number(amount),
          date: new Date(date),
          category: category as ExpenseCategory,
          status: "pending",
          paymentMethod: paymentMethod as "cash" | "card" | "bank transfer" | "other",
          vendor: "Unknown",
          receiptUrl
        });
        
        toast.success("Expense added successfully");
        handleClose();
      };
    } else {
      addExpense({
        description,
        amount: Number(amount),
        date: new Date(date),
        category: category as ExpenseCategory,
        status: "pending",
        paymentMethod: paymentMethod as "cash" | "card" | "bank transfer" | "other",
        vendor: "Unknown"
      });
      
      toast.success("Expense added successfully");
      handleClose();
    }
  };

  return {
    description,
    setDescription,
    amount,
    setAmount,
    date,
    setDate,
    category,
    setCategory,
    paymentMethod,
    setPaymentMethod,
    receiptFile,
    setReceiptFile,
    handleClose,
    handleSave
  };
};
