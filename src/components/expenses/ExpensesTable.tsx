
import { format } from "date-fns";
import { MoreVertical, Download, FileEdit, Trash2, FileText, Eye } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Expense } from "@/types/expense";
import { formatNaira } from "@/utils/invoice";
import { getCategoryLabel } from "@/utils/expenseCategories";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { useExpenses } from "@/contexts/ExpenseContext";
import { toast } from "sonner";

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
  
  const downloadReceipt = (receiptUrl: string, description: string) => {
    try {
      // Create an anchor element
      const a = document.createElement('a');
      a.href = receiptUrl;
      // Set the download attribute to ensure it's treated as a download
      a.download = `receipt-${description.replace(/\s+/g, '-').toLowerCase()}.png`;
      // Append to body, click, and remove
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast.success("Receipt download started");
    } catch (error) {
      console.error("Failed to download receipt:", error);
      toast.error("Failed to download receipt");
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
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                  No expenses match the selected filters
                </TableCell>
              </TableRow>
            ) : (
              filteredExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="whitespace-nowrap">{format(new Date(expense.date), "dd/MM/yyyy")}</TableCell>
                  <TableCell className="font-medium max-w-[180px] sm:max-w-none truncate">
                    <div className="flex items-center gap-2">
                      {expense.fromStatement && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <FileText className="h-4 w-4 text-green-500 flex-shrink-0" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>From bank statement</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      {expense.receiptUrl && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-5 w-5 p-0"
                                onClick={() => handleViewReceipt(expense.receiptUrl!)}
                              >
                                <Eye className="h-3 w-3 text-blue-500" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View receipt</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      <span className="truncate">{expense.description}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{getCategoryLabel(expense.category)}</TableCell>
                  <TableCell className="hidden md:table-cell">{expense.vendor}</TableCell>
                  <TableCell className="hidden lg:table-cell capitalize">{expense.paymentMethod}</TableCell>
                  <TableCell className="text-right font-medium">{formatNaira(expense.amount)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {expense.receiptUrl && (
                          <>
                            <DropdownMenuItem 
                              className="cursor-pointer"
                              onClick={() => handleViewReceipt(expense.receiptUrl!)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Receipt
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                              className="cursor-pointer"
                              onClick={() => downloadReceipt(expense.receiptUrl!, expense.description)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download Receipt
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                              className="cursor-pointer text-red-500 focus:text-red-500"
                              onClick={() => handleDeleteReceipt(expense)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Receipt
                            </DropdownMenuItem>
                          </>
                        )}
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Receipt Viewer Dialog */}
      <Dialog open={!!selectedReceiptUrl} onOpenChange={() => setSelectedReceiptUrl(null)}>
        <DialogContent className="sm:max-w-md">
          <div className="w-full p-1">
            <img 
              src={selectedReceiptUrl || ''} 
              alt="Receipt" 
              className="w-full h-auto max-h-[70vh] object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExpensesTable;
