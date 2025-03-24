
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBudget } from "@/contexts/BudgetContext";
import { toast } from "sonner";

interface CreateBudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateBudgetDialog = ({ open, onOpenChange }: CreateBudgetDialogProps) => {
  const { addBudget } = useBudget();
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
  );
  const [totalBudget, setTotalBudget] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Please enter a budget name");
      return;
    }
    
    if (!totalBudget || isNaN(Number(totalBudget)) || Number(totalBudget) <= 0) {
      toast.error("Please enter a valid budget amount");
      return;
    }

    addBudget({
      name,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      totalBudget: Number(totalBudget),
      categories: []
    });

    toast.success("Budget created successfully");
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setName("");
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate(
      new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
    );
    setTotalBudget("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Budget</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Budget Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter budget name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalBudget">Total Budget Amount</Label>
            <Input
              id="totalBudget"
              type="number"
              value={totalBudget}
              onChange={(e) => setTotalBudget(e.target.value)}
              placeholder="Enter total budget amount"
              min="0"
              step="0.01"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-green-500 hover:bg-green-600 text-white">
              Create Budget
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
