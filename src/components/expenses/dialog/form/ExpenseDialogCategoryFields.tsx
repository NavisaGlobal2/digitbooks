
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from "@/utils/expenseCategories";
import { ExpenseCategory } from "@/types/expense";

interface ExpenseDialogCategoryFieldsProps {
  category: ExpenseCategory | "";
  setCategory: (value: ExpenseCategory | "") => void;
  paymentMethod: string;
  setPaymentMethod: (value: string) => void;
}

const ExpenseDialogCategoryFields = ({
  category,
  setCategory,
  paymentMethod,
  setPaymentMethod,
}: ExpenseDialogCategoryFieldsProps) => {
  return (
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
      
      <div className="mt-4">
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
    </div>
  );
};

export default ExpenseDialogCategoryFields;
