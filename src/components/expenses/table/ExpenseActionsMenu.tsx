
import { MoreVertical, FileEdit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Expense } from "@/types/expense";
import ReceiptActions from "./ReceiptActions";

interface ExpenseActionsMenuProps {
  expense: Expense;
  onDeleteExpense: (id: string) => void;
  onViewReceipt: (receiptUrl: string) => void;
  onDeleteReceipt: (expense: Expense) => void;
}

const ExpenseActionsMenu = ({ 
  expense, 
  onDeleteExpense, 
  onViewReceipt, 
  onDeleteReceipt 
}: ExpenseActionsMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <ReceiptActions 
          expense={expense} 
          onViewReceipt={onViewReceipt} 
          onDeleteReceipt={onDeleteReceipt} 
        />
        
        <DropdownMenuItem className="cursor-pointer">
          <FileEdit className="h-4 w-4 mr-2" />
          Edit Expense
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className="cursor-pointer text-red-500 focus:text-red-500"
          onClick={() => onDeleteExpense(expense.id)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Expense
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExpenseActionsMenu;
