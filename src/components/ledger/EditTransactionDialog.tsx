
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLedger } from "@/contexts/LedgerContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface EditTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: string | null;
}

export const EditTransactionDialog = ({
  open,
  onOpenChange,
  transactionId,
}: EditTransactionDialogProps) => {
  const { transactions, updateTransaction } = useLedger();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState<"credit" | "debit">("debit");

  const categories = [
    "Housing",
    "Food",
    "Transportation",
    "Utilities",
    "Insurance",
    "Healthcare",
    "Entertainment",
    "Personal",
    "Education",
    "Savings",
    "Income",
    "Other",
  ];

  useEffect(() => {
    if (open && transactionId) {
      const transaction = transactions.find((t) => t.id === transactionId);
      if (transaction) {
        setDate(new Date(transaction.date).toISOString().split("T")[0]);
        setDescription(transaction.description);
        setAmount(transaction.amount.toString());
        setCategory(transaction.category);
        setType(transaction.type);
      }
    }
  }, [open, transactionId, transactions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!date) {
        toast.error("Please select a date");
        return;
      }

      if (!description.trim()) {
        toast.error("Please enter a description");
        return;
      }

      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }

      if (!category) {
        toast.error("Please select a category");
        return;
      }

      if (!transactionId) {
        toast.error("Transaction ID is missing");
        return;
      }

      await updateTransaction(transactionId, {
        date: new Date(date),
        description: description.trim(),
        amount: parseFloat(amount),
        category,
        type,
      });

      toast.success("Transaction updated successfully");
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update transaction:", error);
      toast.error("Failed to update transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setDate("");
    setDescription("");
    setAmount("");
    setCategory("");
    setType("debit");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter transaction description"
              className="resize-none min-h-[80px]"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="0.01"
              step="0.01"
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory} disabled={isSubmitting}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={type}
                onValueChange={(value) => setType(value as "credit" | "debit")}
                disabled={isSubmitting}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit">Credit</SelectItem>
                  <SelectItem value="debit">Debit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Transaction"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
