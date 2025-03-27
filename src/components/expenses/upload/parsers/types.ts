
import { ExpenseCategory } from "@/types/expense";

export type ParsedTransaction = {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  category?: ExpenseCategory;
  selected: boolean;
};
