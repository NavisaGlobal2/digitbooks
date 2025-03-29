
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PaymentRecord } from "@/types/invoice";
import { PaymentRecordComponent } from "./PaymentRecord";
import { PaymentSummary } from "./PaymentSummary";
import { usePaymentDialog } from "./usePaymentDialog";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string;
  invoiceAmount: number;
  onMarkAsPaid: (invoiceId: string, payments: PaymentRecord[]) => void;
  existingPayments?: PaymentRecord[];
}

export const PaymentDialog = ({ 
  open, 
  onOpenChange, 
  invoiceId, 
  invoiceAmount, 
  onMarkAsPaid,
  existingPayments = []
}: PaymentDialogProps) => {
  const {
    payments,
    totalPaid,
    isSubmitting,
    handleAddPayment,
    handleRemovePayment,
    handlePaymentChange,
    handleFileUpload,
    handleSubmit,
    resetState
  } = usePaymentDialog({
    invoiceId,
    invoiceAmount,
    existingPayments,
    onMarkAsPaid,
    onOpenChange
  });

  // Reset state when dialog opens or closes
  useEffect(() => {
    if (!open) {
      // Use setTimeout to ensure dialog closing animation completes before state reset
      setTimeout(resetState, 300);
    }
  }, [open, resetState]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {existingPayments?.length ? 'Update Payment Records' : 'Mark Invoice as Paid'}
          </DialogTitle>
          <DialogDescription>
            {existingPayments?.length 
              ? 'Update payment details for this invoice. Add additional payments as needed.'
              : 'Record payment details for this invoice. Add multiple payments if the invoice was paid in installments.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {payments.map((payment, index) => (
            <PaymentRecordComponent
              key={payment.id}
              payment={payment}
              index={index}
              isRemovable={payments.length > 1}
              onChange={handlePaymentChange}
              onRemove={handleRemovePayment}
              onFileUpload={handleFileUpload}
            />
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
          
          <PaymentSummary totalPaid={totalPaid} invoiceAmount={invoiceAmount} />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || totalPaid === 0}
          >
            {isSubmitting ? "Saving..." : "Save Payment Records"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
