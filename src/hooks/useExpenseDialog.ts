
import { useState } from 'react';
import { toast } from "sonner";
import { useExpenses } from "@/contexts/ExpenseContext";
import { ExpenseCategory } from "@/types/expense";
import { useExpenseForm } from "./useExpenseForm";
import { useExpenseValidation } from "./useExpenseValidation";
import { useFileProcessing } from "./useFileProcessing";

export const useExpenseDialog = (onCloseDialog: () => void) => {
  const { addExpense } = useExpenses();
  const { validateForm } = useExpenseValidation();
  const { processReceiptFile } = useFileProcessing();
  
  const {
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
    clearForm
  } = useExpenseForm();
  
  const handleClose = () => {
    clearForm();
    onCloseDialog();
  };
  
  const handleSave = async () => {
    if (!validateForm({ 
      description, 
      amount, 
      date: date ? date.toISOString() : "", 
      category, 
      paymentMethod 
    })) return;
    
    try {
      if (receiptFile) {
        const receiptUrl = await processReceiptFile(receiptFile);
        
        addExpense({
          description,
          amount: Number(amount),
          date: date || new Date(),
          category: category as ExpenseCategory,
          status: "pending",
          paymentMethod,
          vendor: vendor || "Unknown",
          notes: notes || undefined,
          receiptUrl
        });
      } else {
        addExpense({
          description,
          amount: Number(amount),
          date: date || new Date(),
          category: category as ExpenseCategory,
          status: "pending",
          paymentMethod,
          vendor: vendor || "Unknown",
          notes: notes || undefined
        });
      }
      
      toast.success("Expense added successfully");
      handleClose();
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
    handleClose,
    handleSave
  };
};
