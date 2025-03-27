
import { useState } from "react";
import { ExpenseCategory } from "@/types/expense";
import { useExpenseValidation } from "./useExpenseValidation";

export const useExpenseForm = (initialValues?: {
  description?: string;
  amount?: string;
  date?: string;
  category?: ExpenseCategory | "";
  paymentMethod?: string;
}) => {
  // Form states with default values or provided initial values
  const [description, setDescription] = useState(initialValues?.description || "");
  const [amount, setAmount] = useState(initialValues?.amount || "");
  const [date, setDate] = useState(initialValues?.date || new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<ExpenseCategory | "">(initialValues?.category || "");
  const [paymentMethod, setPaymentMethod] = useState<string>(initialValues?.paymentMethod || "");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  
  const clearForm = () => {
    setDescription("");
    setAmount("");
    setDate(new Date().toISOString().split('T')[0]);
    setCategory("");
    setPaymentMethod("");
    setReceiptFile(null);
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
    clearForm
  };
};
