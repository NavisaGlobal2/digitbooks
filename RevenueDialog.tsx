import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRevenue } from "@/contexts/RevenueContext";
import { RevenueSource, PaymentStatus } from "@/types/revenue";
import { toast } from "sonner";

interface RevenueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const REVENUE_SOURCES: { value: RevenueSource; label: string }[] = [
  { value: "client", label: "Client" },
  { value: "product", label: "Product" },
  { value: "service", label: "Service" },
];

const PAYMENT_STATUSES: { value: PaymentStatus; label: string }[] = [
  { value: "paid", label: "Paid" },
  { value: "unpaid", label: "Unpaid" },
  { value: "overdue", label: "Overdue" },
];

export const RevenueDialog = ({ open, onOpenChange }: RevenueDialogProps) => {
  const { addRevenue } = useRevenue();
  const [source, setSource] = useState<RevenueSource>("client");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<PaymentStatus>("unpaid");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      toast.error("Please enter a description");
      return;
    }
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    addRevenue({
      source,
      description,
      amount: Number(amount),
      date: new Date(date),
      status
    });

    toast.success("Revenue added successfully");
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setSource("client");
    setDescription("");
    setAmount("");
    setDate(new Date().toISOString().split('T')[0]);
    setStatus("unpaid");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Revenue</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="source">Revenue Source</Label>
            <Select value={source} onValueChange={(value) => setSource(value as RevenueSource)}>
              <SelectTrigger>
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                {REVENUE_SOURCES.map((source) => (
                  <SelectItem key={source.value} value={source.value}>
                    {source.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
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
              min="0"
              step="0.01"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Payment Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as PaymentStatus)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-green-500 hover:bg-green-600 text-white">
              Add Revenue
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};