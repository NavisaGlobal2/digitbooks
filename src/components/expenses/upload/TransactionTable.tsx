
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EXPENSE_CATEGORIES } from "@/utils/expenseCategories";
import { ExpenseCategory } from "@/types/expense";
import { ParsedTransaction } from "./parsers/types";
import { formatCurrency } from "@/utils/invoice/formatters";
import { Sparkles } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TransactionTableProps {
  transactions: ParsedTransaction[];
  onSelectTransaction: (id: string, checked: boolean) => void;
  onSetCategory: (id: string, category: ExpenseCategory) => void;
}

const TransactionTable = ({
  transactions,
  onSelectTransaction,
  onSetCategory
}: TransactionTableProps) => {
  // Log for debugging
  console.log(`TransactionTable rendering: ${transactions.length} transactions, ${transactions.filter(t => t.selected).length} selected`);
  
  return (
    <div className="flex-1 overflow-auto p-0 max-h-[calc(90vh-210px)]">
      <Table>
        <TableHeader className="sticky top-0 bg-white shadow-sm">
          <TableRow>
            <TableHead className="w-10"></TableHead>
            <TableHead className="w-32">Date</TableHead>
            <TableHead className="w-36">Amount</TableHead>
            <TableHead className="w-24">Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="w-40">Category</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id} className={!transaction.selected ? "opacity-70" : ""}>
              <TableCell>
                <Checkbox
                  id={`transaction-${transaction.id}`}
                  checked={transaction.selected}
                  onCheckedChange={(checked) => {
                    // Ensure we're passing a boolean value
                    onSelectTransaction(
                      transaction.id, 
                      checked === true || checked === "indeterminate"
                    );
                  }}
                  disabled={transaction.type === 'credit'} // Can't select credit transactions
                  className="cursor-pointer"
                  aria-label={`Select transaction ${transaction.description}`}
                />
              </TableCell>
              <TableCell className="font-mono text-xs">
                {format(new Date(transaction.date), "yyyy-MM-dd")}
              </TableCell>
              <TableCell className="font-medium">
                {formatCurrency(transaction.amount)}
              </TableCell>
              <TableCell>
                <Badge variant={transaction.type === 'debit' ? "destructive" : "default"} className="capitalize">
                  {transaction.type}
                </Badge>
              </TableCell>
              <TableCell className="max-w-xs truncate" title={transaction.description}>
                {transaction.description}
              </TableCell>
              <TableCell>
                {transaction.type === 'debit' ? (
                  <div className="flex items-center gap-1">
                    <Select
                      value={transaction.category}
                      onValueChange={(value) => 
                        onSetCategory(transaction.id, value as ExpenseCategory)
                      }
                      disabled={!transaction.selected}
                    >
                      <SelectTrigger className={`w-full ${!transaction.category && transaction.selected ? "border-red-300" : ""}`}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {EXPENSE_CATEGORIES.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {transaction.categorySuggestion && transaction.categorySuggestion.confidence > 0.5 && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="cursor-help">
                              <Sparkles 
                                className={`h-4 w-4 ml-1 ${transaction.category ? 'text-gray-400' : 'text-yellow-500 animate-pulse'}`} 
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p className="text-sm">
                              Suggested: <span className="font-medium">{EXPENSE_CATEGORIES.find(c => c.value === transaction.categorySuggestion?.category)?.label}</span>
                              <br />
                              <span className="text-xs opacity-70">Confidence: {Math.round(transaction.categorySuggestion.confidence * 100)}%</span>
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-gray-500 italic">N/A</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TransactionTable;
