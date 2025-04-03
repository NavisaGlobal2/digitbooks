
import { useLedger } from "@/contexts/LedgerContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { formatNaira } from "@/utils/invoice";
import { useState } from "react";

interface TransactionListProps {
  onEditTransaction: (id: string) => void;
}

const TransactionList = ({ onEditTransaction }: TransactionListProps) => {
  const { transactions, deleteTransaction } = useLedger();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteTransaction = async (id: string) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      try {
        setDeletingId(id);
        await deleteTransaction(id);
        toast.success("Transaction deleted successfully");
      } catch (error) {
        console.error("Error deleting transaction:", error);
        toast.error("Failed to delete transaction");
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No transactions found
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  {format(new Date(transaction.date), "MMM d, yyyy")}
                </TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell>{transaction.category}</TableCell>
                <TableCell>{formatNaira(transaction.amount)}</TableCell>
                <TableCell>
                  <Badge
                    variant={transaction.type === "credit" ? "success" : "destructive"}
                  >
                    {transaction.type === "credit" ? "Credit" : "Debit"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditTransaction(transaction.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTransaction(transaction.id)}
                      disabled={deletingId === transaction.id}
                    >
                      {deletingId === transaction.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TransactionList;
