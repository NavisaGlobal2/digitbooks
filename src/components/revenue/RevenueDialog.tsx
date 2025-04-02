
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
  children?: React.ReactNode;
  title?: string;
}

const REVENUE_SOURCES: { value: RevenueSource; label: string }[] = [
  { value: "sales", label: "Sales" },
  { value: "services", label: "Services" },
  { value: "investments", label: "Investments" },
];

const PAYMENT_STATUSES: { value: PaymentStatus; label: string }[] = [
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "overdue", label: "Overdue" },
];

export const RevenueDialog = ({ open, onOpenChange, children, title = "Add New Revenue" }: RevenueDialogProps) => {
  const { addRevenue } = useRevenue();
  const [source, setSource] = useState<RevenueSource>("sales");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("pending");

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
      payment_status: paymentStatus,
      payment_method: "bank transfer"
    });

    toast.success("Revenue added successfully");
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setSource("sales");
    setDescription("");
    setAmount("");
    setDate(new Date().toISOString().split('T')[0]);
    setPaymentStatus("pending");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        {children || (
          <form onSubmit={handleSubmit} className="space-y-3 py-2">
            <div className="space-y-1">
              <Label htmlFor="source">Revenue Line</Label>
              <Select value={source} onValueChange={(value) => setSource(value as RevenueSource)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select revenue line" />
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

            <div className="space-y-1">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description"
                className="h-9"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="0"
                step="0.01"
                className="h-9"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-9"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="status">Payment Status</Label>
              <Select value={paymentStatus} onValueChange={(value) => setPaymentStatus(value as PaymentStatus)}>
                <SelectTrigger className="h-9">
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

            <div className="flex justify-end gap-3 pt-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} 
                className="h-8 px-3 py-0">
                Cancel
              </Button>
              <Button type="submit" className="bg-green-500 hover:bg-green-600 text-white h-8 px-3 py-0">
                Add Revenue
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
