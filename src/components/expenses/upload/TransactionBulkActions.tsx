
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EXPENSE_CATEGORIES } from "@/utils/expenseCategories";
import { ExpenseCategory } from "@/types/expense";

interface TransactionBulkActionsProps {
  selectAll: boolean;
  onSelectAllChange: (checked: boolean) => void;
  onCategoryForAllChange: (category: ExpenseCategory) => void;
  selectedCount: number;
}

const TransactionBulkActions = ({
  selectAll,
  onSelectAllChange,
  onCategoryForAllChange,
  selectedCount
}: TransactionBulkActionsProps) => {
  return (
    <div className="p-4 space-y-2 border-b">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="select-all" 
            checked={selectAll} 
            onCheckedChange={(checked) => {
              const isChecked = checked === true;
              console.log(`Select all checkbox changed to: ${isChecked}`);
              onSelectAllChange(isChecked);
            }}
          />
          <label htmlFor="select-all" className="text-sm font-medium">
            Select all debit transactions
          </label>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            Set category for {selectedCount} selected:
          </span>
          <Select 
            onValueChange={(value) => {
              console.log(`Bulk setting category ${value} for ${selectedCount} selected transactions`);
              onCategoryForAllChange(value as ExpenseCategory);
            }}
            disabled={selectedCount === 0}
          >
            <SelectTrigger className="w-40 h-8">
              <SelectValue placeholder="Choose category" />
            </SelectTrigger>
            <SelectContent>
              {EXPENSE_CATEGORIES.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default TransactionBulkActions;
