
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBudget, Budget, BudgetCategory } from "@/contexts/BudgetContext";
import { toast } from "sonner";

interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget: Budget;
  unallocatedAmount: number;
}

export const AddCategoryDialog = ({ 
  open, 
  onOpenChange, 
  budget, 
  unallocatedAmount 
}: AddCategoryDialogProps) => {
  const { updateBudget } = useBudget();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Please enter a category name");
      return;
    }
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    const amountValue = parseFloat(amount);
    
    if (amountValue > unallocatedAmount) {
      toast.error(`Amount exceeds unallocated budget (${unallocatedAmount.toFixed(2)})`);
      return;
    }
    
    const newCategory: BudgetCategory = {
      id: Math.random().toString(36).substring(2, 11),
      name: name.trim(),
      amount: amountValue,
      spent: 0
    };
    
    const updatedCategories = [...budget.categories, newCategory];
    
    updateBudget(budget.id, {
      categories: updatedCategories
    });
    
    toast.success("Category added successfully");
    resetForm();
    onOpenChange(false);
  };
  
  const resetForm = () => {
    setName("");
    setAmount("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Budget Category</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Groceries, Utilities, Entertainment"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (${unallocatedAmount.toFixed(2)} available)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="0.01"
              step="0.01"
              max={unallocatedAmount}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Add Category
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
