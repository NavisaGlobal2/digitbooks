
import { useState } from "react";
import { ExpenseCategory } from "@/types/expense";
import { useExpenseValidation } from "./useExpenseValidation";
import { toast } from "sonner";
import { useExpenses } from "@/contexts/ExpenseContext";

export const useExpenseForm = (onComplete?: () => void, initialValues?: {
  description?: string;
  amount?: string;
  date?: string;
  category?: ExpenseCategory | "";
  paymentMethod?: string;
  vendor?: string;
  notes?: string;
}) => {
  // Form states with default values or provided initial values
  const [description, setDescription] = useState(initialValues?.description || "");
  const [amount, setAmount] = useState(initialValues?.amount || "");
  const [date, setDate] = useState<Date | undefined>(
    initialValues?.date ? new Date(initialValues.date) : new Date()
  );
  const [category, setCategory] = useState<ExpenseCategory | "">(initialValues?.category || "");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "bank transfer" | "other">(
    (initialValues?.paymentMethod as "cash" | "card" | "bank transfer" | "other") || "card"
  );
  const [vendor, setVendor] = useState(initialValues?.vendor || "");
  const [notes, setNotes] = useState(initialValues?.notes || "");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  
  const { validateForm } = useExpenseValidation();
  const { addExpense } = useExpenses();
  
  const clearForm = () => {
    setDescription("");
    setAmount("");
    setDate(new Date());
    setCategory("");
    setPaymentMethod("card");
    setVendor("");
    setNotes("");
    setReceiptFile(null);
    setReceiptPreview(null);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm({
      description,
      amount,
      date: date ? date.toISOString() : "",
      category,
      paymentMethod
    })) {
      return;
    }
    
    try {
      // Create base expense
      const newExpense = {
        description,
        amount: Number(amount),
        date: date || new Date(),
        category: category as ExpenseCategory,
        status: "pending" as const,
        paymentMethod: paymentMethod,
        vendor: vendor || "Unknown",
        notes: notes || undefined
      };
      
      // Process receipt if present
      if (receiptFile) {
        const reader = new FileReader();
        reader.readAsDataURL(receiptFile);
        
        reader.onload = () => {
          addExpense({
            ...newExpense,
            receiptUrl: reader.result as string
          });
          
          toast.success("Expense added successfully");
          clearForm();
          if (onComplete) onComplete();
        };
        
        reader.onerror = () => {
          toast.error("Failed to process receipt");
          // Add expense without receipt
          addExpense(newExpense);
          clearForm();
          if (onComplete) onComplete();
        };
      } else {
        // Add expense without receipt
        addExpense(newExpense);
        toast.success("Expense added successfully");
        clearForm();
        if (onComplete) onComplete();
      }
    } catch (error) {
      console.error("Error saving expense:", error);
      toast.error("Failed to save expense");
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
    vendor,
    setVendor,
    notes,
    setNotes,
    receiptFile,
    setReceiptFile,
    receiptPreview,
    setReceiptPreview,
    clearForm,
    handleSubmit
  };
};
