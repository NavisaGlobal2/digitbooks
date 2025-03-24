
import { useState } from "react";
import { toast } from "sonner";
import { useExpenses } from "@/contexts/ExpenseContext";
import { ExpenseCategory } from "@/types/expense";

export const useExpenseForm = (onSuccess: () => void) => {
  const { addExpense } = useExpenses();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [category, setCategory] = useState<ExpenseCategory>("other");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "bank transfer" | "other">("card");
  const [vendor, setVendor] = useState("");
  const [notes, setNotes] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

  const validateForm = () => {
    if (!description.trim()) {
      toast.error("Please enter a description");
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
    
    if (!vendor.trim()) {
      toast.error("Please enter a vendor");
      return false;
    }
    
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    addExpense({
      description,
      amount: Number(amount),
      date: date as Date,
      category,
      status: "pending",
      paymentMethod,
      vendor,
      notes: notes || undefined,
      receiptUrl: receiptPreview || undefined
    });
    
    toast.success("Expense added successfully");
    onSuccess(); // Close the form
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
    handleSubmit
  };
};
