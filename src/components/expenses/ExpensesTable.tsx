
import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Expense } from "@/types/expense";
import { useExpenses } from "@/contexts/ExpenseContext";
import { toast } from "sonner";
import ExpenseRow from "./table/ExpenseRow";
import EmptyExpensesRow from "./table/EmptyExpensesRow";
import ReceiptViewerDialog from "./table/ReceiptViewerDialog";

interface ExpensesTableProps {
  expenses: Expense[];
  onDeleteExpense: (id: string) => void;
  filters?: {
    category?: string;
    dateRange?: {start: Date; end: Date};
    paymentMethod?: string;
  };
}

const ExpensesTable = ({ expenses, onDeleteExpense, filters }: ExpensesTableProps) => {
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState<string | null>(null);
  const { updateExpense } = useExpenses();
  
  // Filter expenses based on provided filters
  const filteredExpenses = expenses.filter(expense => {
    // Filter by category if specified
    if (filters?.category && filters.category !== 'all' && 
        expense.category !== filters.category) {
      return false;
    }
    
    // Filter by payment method if specified
    if (filters?.paymentMethod && filters.paymentMethod !== 'all' && 
        expense.paymentMethod !== filters.paymentMethod) {
      return false;
    }
    
    // Filter by date range if specified
    if (filters?.dateRange) {
      const expenseDate = new Date(expense.date);
      const { start, end } = filters.dateRange;
      
      if (expenseDate < start || expenseDate > end) {
        return false;
      }
    }
    
    return true;
  });
  
  const handleViewReceipt = (receiptUrl: string) => {
    setSelectedReceiptUrl(receiptUrl);
  };
  
  const handleDeleteReceipt = (expense: Expense) => {
    if (window.confirm("Are you sure you want to delete this receipt?")) {
      // Create a copy of the expense without the receipt
      const updatedExpense = {...expense};
      delete updatedExpense.receiptUrl;
      
      // Update the expense
      updateExpense(updatedExpense);
      toast.success("Receipt deleted successfully");
    }
  };

  return (
    <>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="hidden sm:table-cell">Category</TableHead>
              <TableHead className="hidden md:table-cell">Vendor</TableHead>
              <TableHead className="hidden lg:table-cell">Payment Method</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExpenses.length === 0 ? (
              <EmptyExpensesRow />
            ) : (
              filteredExpenses.map((expense) => (
                <ExpenseRow
                  key={expense.id}
                  expense={expense}
                  onDeleteExpense={onDeleteExpense}
                  onViewReceipt={handleViewReceipt}
                  onDeleteReceipt={handleDeleteReceipt}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <ReceiptViewerDialog 
        receiptUrl={selectedReceiptUrl}
        onClose={() => setSelectedReceiptUrl(null)}
      />
    </>
  );
};

export default ExpensesTable;
