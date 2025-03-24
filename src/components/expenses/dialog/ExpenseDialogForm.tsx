
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from "@/utils/expenseCategories";
import { ExpenseCategory } from "@/types/expense";

interface ExpenseDialogFormProps {
  description: string;
  setDescription: (value: string) => void;
  amount: string;
  setAmount: (value: string) => void;
  date: string;
  setDate: (value: string) => void;
  category: ExpenseCategory | "";
  setCategory: (value: ExpenseCategory | "") => void;
  paymentMethod: string;
  setPaymentMethod: (value: string) => void;
  receiptFile: File | null;
  setReceiptFile: (file: File | null) => void;
}

const ExpenseDialogForm = ({
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
  setReceiptFile
}: ExpenseDialogFormProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0]);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <label htmlFor="expense-name" className="block text-sm font-medium mb-1">
          Expense name
        </label>
        <Input
          id="expense-name"
          placeholder="Input details"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="expense-date" className="block text-sm font-medium mb-1">
            Date
          </label>
          <Input
            id="expense-date"
            type="date"
            placeholder="Input details"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        
        <div>
          <label htmlFor="expense-amount" className="block text-sm font-medium mb-1">
            Amount
          </label>
          <Input
            id="expense-amount"
            placeholder="Input details"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            step="0.01"
            min="0"
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="expense-category" className="block text-sm font-medium mb-1">
          Category
        </label>
        <Select value={category} onValueChange={(value) => setCategory(value as ExpenseCategory)}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {EXPENSE_CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="mt-1">
          <Button variant="link" className="p-0 h-auto text-sm text-green-500">
            Manage categories
          </Button>
        </div>
      </div>
      
      <div>
        <label htmlFor="payment-method" className="block text-sm font-medium mb-1">
          Payment method
        </label>
        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
          <SelectTrigger>
            <SelectValue placeholder="Select method" />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_METHODS.map((method) => (
              <SelectItem key={method.value} value={method.value}>
                {method.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">
          Upload receipt (optional)
        </label>
        <div className="border rounded-md p-6 text-center">
          <div className="flex flex-col items-center justify-center">
            <div className="mb-2 text-gray-400 border rounded-full p-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 22H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 18V2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18 8L12 2L6 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-sm text-gray-500">Drag & drop receipt</p>
            <p className="text-sm text-gray-400">or</p>
            <label className="cursor-pointer">
              <span className="text-sm text-green-500">Browse files</span>
              <input
                type="file"
                className="hidden"
                accept="image/*,.pdf"
                onChange={handleFileChange}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseDialogForm;
