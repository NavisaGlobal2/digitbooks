
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
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface TransactionBulkActionsProps {
  selectAll: boolean;
  onSelectAllChange: (checked: boolean) => void;
  onCategoryForAllChange: (category: ExpenseCategory) => void;
  suggestedCount?: number;
  onApplySuggestions?: () => void;
}

const TransactionBulkActions = ({
  selectAll,
  onSelectAllChange,
  onCategoryForAllChange,
  suggestedCount = 0,
  onApplySuggestions
}: TransactionBulkActionsProps) => {
  return (
    <div className="px-4 py-2 border-b flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Checkbox 
            id="select-all-transactions" 
            checked={selectAll}
            onCheckedChange={onSelectAllChange}
          />
          <label 
            htmlFor="select-all-transactions"
            className="text-sm cursor-pointer select-none"
          >
            Select all debit transactions
          </label>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {suggestedCount > 0 && onApplySuggestions && (
          <Button 
            size="sm" 
            variant="outline" 
            className="text-xs border-yellow-500 text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700"
            onClick={onApplySuggestions}
          >
            <Sparkles className="h-3.5 w-3.5 mr-1" /> 
            Apply {suggestedCount} suggestions
          </Button>
        )}
        
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm whitespace-nowrap">Set category for all:</span>
          <Select onValueChange={(value) => onCategoryForAllChange(value as ExpenseCategory)}>
            <SelectTrigger className="h-8 w-40">
              <SelectValue placeholder="Select" />
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
