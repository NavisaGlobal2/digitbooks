
import { useState } from "react";
import { CalendarIcon, Plus, Trash2, Upload } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { PaymentRecord } from "@/types/invoice";

interface MarkAsPaidDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string;
  invoiceAmount: number;
  onMarkAsPaid: (invoiceId: string, payments: PaymentRecord[]) => void;
}

const MarkAsPaidDialog = ({ open, onOpenChange, invoiceId, invoiceAmount, onMarkAsPaid }: MarkAsPaidDialogProps) => {
  const [payments, setPayments] = useState<(PaymentRecord & { id: string })[]>([
    { id: crypto.randomUUID(), amount: invoiceAmount, date: new Date(), method: "bank transfer", receiptUrl: null }
  ]);
  const [totalPaid, setTotalPaid] = useState(invoiceAmount);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddPayment = () => {
    const newPayment = {
      id: crypto.randomUUID(),
      amount: 0,
      date: new Date(),
      method: "bank transfer",
      receiptUrl: null
    };
    
    setPayments([...payments, newPayment]);
  };

  const handleRemovePayment = (id: string) => {
    const updatedPayments = payments.filter(payment => payment.id !== id);
    setPayments(updatedPayments);
    
    // Recalculate total
    const newTotal = updatedPayments.reduce((sum, payment) => sum + payment.amount, 0);
    setTotalPaid(newTotal);
  };

  const handlePaymentChange = (id: string, field: keyof PaymentRecord, value: any) => {
    const updatedPayments = payments.map(payment => {
      if (payment.id === id) {
        return { ...payment, [field]: value };
      }
      return payment;
    });
    
    setPayments(updatedPayments);
    
    // Recalculate total if amount changed
    if (field === 'amount') {
      const newTotal = updatedPayments.reduce((sum, payment) => sum + payment.amount, 0);
      setTotalPaid(newTotal);
    }
  };

  const handleFileUpload = async (id: string, file: File) => {
    // In a real application, we would upload the file to storage
    // For now, we'll just create a local URL
    const receiptUrl = URL.createObjectURL(file);
    
    handlePaymentChange(id, 'receiptUrl', receiptUrl);
    toast.success(`Receipt uploaded for payment`);
  };

  const handleSubmit = () => {
    if (totalPaid < invoiceAmount) {
      if (!confirm("Total payment amount is less than invoice amount. This will mark the invoice as partially paid. Continue?")) {
        return;
      }
    } else if (totalPaid > invoiceAmount) {
      if (!confirm("Total payment amount exceeds invoice amount. This may indicate an overpayment. Continue?")) {
        return;
      }
    }
    
    setIsSubmitting(true);
    
    // Remove the internal id property before sending to parent
    const paymentRecords: PaymentRecord[] = payments.map(({ id, ...rest }) => rest);
    
    try {
      onMarkAsPaid(invoiceId, paymentRecords);
      onOpenChange(false);
    } catch (error) {
      console.error("Error marking invoice as paid:", error);
      toast.error("Failed to mark invoice as paid");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Mark Invoice as Paid</DialogTitle>
          <DialogDescription>
            Record payment details for this invoice. Add multiple payments if the invoice was paid in installments.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {payments.map((payment, index) => (
            <div key={payment.id} className="space-y-4 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Payment {index + 1}</h4>
                {payments.length > 1 && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleRemovePayment(payment.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`amount-${payment.id}`}>Amount</Label>
                  <Input
                    id={`amount-${payment.id}`}
                    type="number"
                    value={payment.amount}
                    onChange={(e) => handlePaymentChange(payment.id, 'amount', parseFloat(e.target.value) || 0)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`method-${payment.id}`}>Payment Method</Label>
                  <select
                    id={`method-${payment.id}`}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={payment.method}
                    onChange={(e) => handlePaymentChange(payment.id, 'method', e.target.value)}
                  >
                    <option value="bank transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="check">Check</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label>Payment Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !payment.date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {payment.date ? format(payment.date, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={payment.date}
                        onSelect={(date) => handlePaymentChange(payment.id, 'date', date || new Date())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`reference-${payment.id}`}>Reference (Optional)</Label>
                  <Input
                    id={`reference-${payment.id}`}
                    placeholder="Transfer ref, payment ID, etc."
                    value={payment.reference || ""}
                    onChange={(e) => handlePaymentChange(payment.id, 'reference', e.target.value)}
                  />
                </div>
                
                <div className="col-span-2 space-y-2">
                  <Label>Receipt (Recommended)</Label>
                  <div className="flex items-center space-x-2">
                    <Label
                      htmlFor={`receipt-${payment.id}`}
                      className="flex h-10 flex-1 cursor-pointer items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {payment.receiptUrl ? "Change Receipt" : "Upload Receipt"}
                    </Label>
                    <Input
                      id={`receipt-${payment.id}`}
                      type="file"
                      className="hidden"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(payment.id, e.target.files[0]);
                        }
                      }}
                    />
                    {payment.receiptUrl && (
                      <Button variant="outline" size="icon" asChild>
                        <a href={payment.receiptUrl} target="_blank" rel="noopener noreferrer">
                          <span className="sr-only">View Receipt</span>
                          <span className="h-4 w-4">👁️</span>
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <Button 
            type="button" 
            variant="outline"
            className="w-full"
            onClick={handleAddPayment}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Another Payment
          </Button>
          
          <div className="rounded-lg border p-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Amount Paid:</span>
              <span className={cn(
                "font-bold",
                totalPaid < invoiceAmount ? "text-orange-600" : 
                totalPaid > invoiceAmount ? "text-blue-600" : "text-green-600"
              )}>
                ₦{totalPaid.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-muted-foreground">Invoice Amount:</span>
              <span className="text-sm">₦{invoiceAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-sm text-muted-foreground">Difference:</span>
              <span className={cn(
                "text-sm",
                totalPaid < invoiceAmount ? "text-orange-600" : 
                totalPaid > invoiceAmount ? "text-blue-600" : "text-green-600"
              )}>
                {totalPaid === invoiceAmount ? "None" : 
                 totalPaid < invoiceAmount ? `-₦${(invoiceAmount - totalPaid).toLocaleString()} (Partially Paid)` :
                 `+₦${(totalPaid - invoiceAmount).toLocaleString()} (Overpaid)`}
              </span>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || totalPaid === 0}
          >
            {isSubmitting ? "Saving..." : "Mark as Paid"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MarkAsPaidDialog;
