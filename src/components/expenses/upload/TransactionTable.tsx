
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
  // Calculate some stats for debugging
  const debitCount = transactions.filter(t => t.type === 'debit').length;
  const creditCount = transactions.filter(t => t.type === 'credit').length;
  const selectedCount = transactions.filter(t => t.selected).length;
  
  console.log(`TransactionTable received ${transactions.length} transactions (${debitCount} debits, ${creditCount} credits, ${selectedCount} selected)`);
  
  const handleCheckboxChange = (id: string, checked: boolean) => {
    console.log(`[TransactionTable] Checkbox change: Transaction ID=${id}, Checked=${checked}`);
    onSelectTransaction(id, checked);
  };
  
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
          {transactions.map((transaction) => {
            // Add ID verification for debugging
            if (!transaction.id) {
              console.error("Transaction without ID found:", transaction);
              return null;
            }
            
            return (
              <TableRow key={transaction.id} className={!transaction.selected ? "opacity-70" : ""}>
                <TableCell>
                  <Checkbox
                    id={`chk-${transaction.id}`}
                    checked={transaction.selected}
                    onCheckedChange={(checked) => {
                      // Convert checked to boolean
                      const isChecked = checked === true;
                      console.log(`Checkbox for transaction ${transaction.id} changed to ${isChecked}`);
                      handleCheckboxChange(transaction.id, isChecked);
                    }}
                    disabled={transaction.type === 'credit'} // Can't select credit transactions
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
                    <Select
                      value={transaction.category || ""}
                      onValueChange={(value) => {
                        console.log(`Selected category ${value} for transaction ${transaction.id}`);
                        onSetCategory(transaction.id, value as ExpenseCategory);
                      }}
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
                  ) : (
                    <span className="text-sm text-gray-500 italic">N/A</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default TransactionTable;
