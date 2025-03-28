
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { TransactionFrequency } from "@/types/recurringTransaction";
import BillPaymentDialogContent from "./payment/BillPaymentDialogContent";

interface BillPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  billId: string;
  billTitle: string;
  amount: number;
  frequency: TransactionFrequency;
  onPaymentSuccess: () => void;
}

const BillPaymentDialog = ({ 
  open, 
  onOpenChange, 
  billId, 
  billTitle, 
  amount, 
  frequency,
  onPaymentSuccess 
}: BillPaymentDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <BillPaymentDialogContent
          billId={billId}
          billTitle={billTitle}
          amount={amount}
          frequency={frequency}
          onPaymentSuccess={onPaymentSuccess}
          onOpenChange={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  );
};

export default BillPaymentDialog;
