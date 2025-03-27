
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from "@/utils/formatting";
import { ExpenseCategory } from "@/types/expense";
import { CategorySelect } from "./tagging/CategorySelect";
import { ParsedTransaction } from "./parsers";
import { useEffect } from "react";

interface TransactionTableProps {
  transactions: ParsedTransaction[];
  onSelectTransaction: (id: string, selected: boolean) => void;
  onSetCategory: (id: string, category: ExpenseCategory) => void;
}

const TransactionTable = ({
  transactions,
  onSelectTransaction,
  onSetCategory,
}: TransactionTableProps) => {
  // Log transaction data for debugging
  useEffect(() => {
    console.log(`TransactionTable received ${transactions.length} transactions (${transactions.filter(t => t.type === 'debit').length} debits, ${transactions.filter(t => t.type === 'credit').length} credits, ${transactions.filter(t => t.selected).length} selected)`);
  }, [transactions]);

  return (
    <div className="max-h-[50vh] overflow-auto px-4 py-2 border-y">
      <Table>
        <TableHeader className="sticky top-0 bg-white z-10">
          <TableRow>
            <TableHead className="w-10"></TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-[180px]">Category</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => {
            // Skip rendering if transaction has no ID
            if (!transaction.id) {
              console.error("Transaction without ID detected:", transaction);
              return null;
            }

            const isDebit = transaction.type === "debit";
            const isSelected = !!transaction.selected;

            return (
              <TableRow 
                key={transaction.id}
                className={isDebit ? "" : "bg-gray-50 text-gray-500"}
              >
                <TableCell>
                  {isDebit ? (
                    <Checkbox 
                      id={`tx-${transaction.id}`}
                      checked={isSelected}
                      onCheckedChange={(checked) => {
                        console.log(`Checkbox for ${transaction.id} changed to:`, checked);
                        onSelectTransaction(transaction.id, !!checked);
                      }}
                      disabled={!isDebit}
                    />
                  ) : null}
                </TableCell>
                <TableCell>
                  {new Date(transaction.date).toLocaleDateString()}
                </TableCell>
                <TableCell className="font-medium max-w-[300px] truncate">
                  {transaction.description}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(transaction.amount)}
                </TableCell>
                <TableCell>
                  {isDebit && isSelected ? (
                    <CategorySelect
                      id={transaction.id}
                      value={transaction.category}
                      onChange={(category) => onSetCategory(transaction.id, category)}
                    />
                  ) : null}
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
