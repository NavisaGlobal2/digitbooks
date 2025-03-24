
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExpenseCategory } from "@/types/expense";
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from "@/utils/expenseCategories";

interface ExpenseCategoryFieldsProps {
  category: ExpenseCategory;
  setCategory: (value: ExpenseCategory) => void;
  paymentMethod: "cash" | "card" | "bank transfer" | "other";
  setPaymentMethod: (value: "cash" | "card" | "bank transfer" | "other") => void;
}

const ExpenseCategoryFields = ({
  category,
  setCategory,
  paymentMethod,
  setPaymentMethod
}: ExpenseCategoryFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="category">Category</Label>
        <Select
          value={category}
          onValueChange={(value) => setCategory(value as ExpenseCategory)}
        >
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
      </div>
      
      <div>
        <Label htmlFor="paymentMethod">Payment Method</Label>
        <Select
          value={paymentMethod}
          onValueChange={(value) => setPaymentMethod(value as "cash" | "card" | "bank transfer" | "other")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select payment method" />
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
    </div>
  );
};

export default ExpenseCategoryFields;
