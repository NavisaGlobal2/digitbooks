
import { useState, useEffect } from "react";
import { useLedger } from "@/contexts/LedgerContext";
import { toast } from "sonner";
import { Transaction } from "@/types/ledger";

interface TransactionFormData {
  date: string;
  description: string;
  amount: string;
  category: string;
  type: "credit" | "debit";
}

interface UseTransactionFormProps {
  transactionId?: string | null;
  onClose: () => void;
}

export const useTransactionForm = ({ transactionId, onClose }: UseTransactionFormProps) => {
  const { transactions, addTransaction, updateTransaction } = useLedger();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<TransactionFormData>({
    date: new Date().toISOString().split("T")[0],
    description: "",
    amount: "",
    category: "",
    type: "debit",
  });

  // Categories array (shared between both forms)
  const categories = [
    "Housing",
    "Food",
    "Transportation",
    "Utilities",
    "Insurance",
    "Healthcare",
    "Entertainment",
    "Personal",
    "Education",
    "Savings",
    "Income",
    "Other",
  ];

  // Load existing transaction data if editing
  useEffect(() => {
    if (transactionId) {
      const transaction = transactions.find((t) => t.id === transactionId);
      if (transaction) {
        setFormData({
          date: new Date(transaction.date).toISOString().split("T")[0],
          description: transaction.description,
          amount: transaction.amount.toString(),
          category: transaction.category,
          type: transaction.type,
        });
      }
    }
  }, [transactionId, transactions]);

  // Handle form field changes
  const handleChange = (field: keyof TransactionFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Form validation
  const validateForm = (): boolean => {
    if (!formData.date) {
      toast.error("Please select a date");
      return false;
    }

    if (!formData.description.trim()) {
      toast.error("Please enter a description");
      return false;
    }

    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return false;
    }

    if (!formData.category) {
      toast.error("Please select a category");
      return false;
    }

    return true;
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const transactionData = {
        date: new Date(formData.date),
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        category: formData.category,
        type: formData.type,
      };

      if (transactionId) {
        // Update existing transaction
        await updateTransaction(transactionId, transactionData);
        toast.success("Transaction updated successfully");
      } else {
        // Add new transaction
        await addTransaction(transactionData);
        toast.success("Transaction added successfully");
      }

      resetForm();
      onClose();
    } catch (error) {
      console.error(`Failed to ${transactionId ? "update" : "add"} transaction:`, error);
      toast.error(`Failed to ${transactionId ? "update" : "add"} transaction`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split("T")[0],
      description: "",
      amount: "",
      category: "",
      type: "debit",
    });
  };

  return {
    formData,
    isSubmitting,
    categories,
    handleChange,
    handleSubmit,
    resetForm,
  };
};
