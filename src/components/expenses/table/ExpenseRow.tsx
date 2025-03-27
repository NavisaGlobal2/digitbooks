
import { format } from "date-fns";
import { TableCell, TableRow } from "@/components/ui/table";
import { Expense } from "@/types/expense";
import { formatNaira } from "@/utils/invoice";
import { getCategoryLabel } from "@/utils/expenseCategories";
import ExpenseDescription from "./ExpenseDescription";
import ExpenseActionsMenu from "./ExpenseActionsMenu";

interface ExpenseRowProps {
  expense: Expense;
  onDeleteExpense: (id: string) => void;
  onViewReceipt: (receiptUrl: string) => void;
  onDeleteReceipt: (expense: Expense) => void;
}

const ExpenseRow = ({ 
  expense, 
  onDeleteExpense, 
  onViewReceipt, 
  onDeleteReceipt 
}: ExpenseRowProps) => {
  return (
    <TableRow key={expense.id}>
      <TableCell className="whitespace-nowrap">
        {format(new Date(expense.date), "dd/MM/yyyy")}
      </TableCell>
      
      <TableCell className="font-medium max-w-[180px] sm:max-w-none truncate">
        <ExpenseDescription 
          description={expense.description}
          fromStatement={expense.fromStatement}
          receiptUrl={expense.receiptUrl}
          onViewReceipt={onViewReceipt}
        />
      </TableCell>
      
      <TableCell className="hidden sm:table-cell">
        {getCategoryLabel(expense.category)}
      </TableCell>
      
      <TableCell className="hidden md:table-cell">
        {expense.vendor}
      </TableCell>
      
      <TableCell className="hidden lg:table-cell capitalize">
        {expense.paymentMethod}
      </TableCell>
      
      <TableCell className="text-right font-medium">
        {formatNaira(expense.amount)}
      </TableCell>
      
      <TableCell>
        <ExpenseActionsMenu 
          expense={expense}
          onDeleteExpense={onDeleteExpense}
          onViewReceipt={onViewReceipt}
          onDeleteReceipt={onDeleteReceipt}
        />
      </TableCell>
    </TableRow>
  );
};

export default ExpenseRow;
