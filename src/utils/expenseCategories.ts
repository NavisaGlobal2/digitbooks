
import { ExpenseCategory } from "@/types/expense";

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: "office", label: "Office Supplies" },
  { value: "travel", label: "Travel" },
  { value: "meals", label: "Meals & Entertainment" },
  { value: "utilities", label: "Utilities" },
  { value: "rent", label: "Rent" },
  { value: "software", label: "Software" },
  { value: "hardware", label: "Hardware" },
  { value: "marketing", label: "Marketing" },
  { value: "salaries", label: "Salaries" },
  { value: "taxes", label: "Taxes" },
  { value: "other", label: "Other" }
];

export const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "bank transfer", label: "Bank Transfer" },
  { value: "other", label: "Other" }
];

export const getCategoryLabel = (category: ExpenseCategory): string => {
  const categoryMap: Record<ExpenseCategory, string> = {
    office: "Office Supplies",
    travel: "Travel",
    meals: "Meals & Entertainment",
    utilities: "Utilities",
    rent: "Rent",
    software: "Software",
    hardware: "Hardware",
    marketing: "Marketing",
    salaries: "Salaries",
    taxes: "Taxes",
    other: "Other"
  };
  
  return categoryMap[category] || category;
};
