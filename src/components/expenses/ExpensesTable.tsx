
import { format } from "date-fns";
import { MoreVertical, Download, FileEdit, Trash2, FileText } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Expense } from "@/types/expense";
import { formatNaira } from "@/utils/invoice";
import { getCategoryLabel } from "@/utils/expenseCategories";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ExpensesTableProps {
  expenses: Expense[];
  onDeleteExpense: (id: string) => void;
}

const ExpensesTable = ({ expenses, onDeleteExpense }: ExpensesTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Vendor</TableHead>
            <TableHead>Payment Method</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell>{format(new Date(expense.date), "dd/MM/yyyy")}</TableCell>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {expense.fromStatement && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <FileText className="h-4 w-4 text-green-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>From bank statement</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {expense.description}
                </div>
              </TableCell>
              <TableCell>{getCategoryLabel(expense.category)}</TableCell>
              <TableCell>{expense.vendor}</TableCell>
              <TableCell className="capitalize">{expense.paymentMethod}</TableCell>
              <TableCell className="text-right">{formatNaira(expense.amount)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {expense.receiptUrl && (
                      <DropdownMenuItem className="cursor-pointer">
                        <Download className="h-4 w-4 mr-2" />
                        View Receipt
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem className="cursor-pointer">
                      <FileEdit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="cursor-pointer text-red-500 focus:text-red-500"
                      onClick={() => onDeleteExpense(expense.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ExpensesTable;
