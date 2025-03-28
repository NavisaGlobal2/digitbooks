
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { formatNaira } from "@/utils/invoice/formatters";
import PaymentMethodForm from "./PaymentMethodForm";
import { useBillPayment } from "./useBillPayment";
import { TransactionFrequency } from "@/types/recurringTransaction";

interface BillPaymentDialogContentProps {
  billId: string;
  billTitle: string;
  amount: number;
  frequency: TransactionFrequency;
  onPaymentSuccess: () => void;
  onOpenChange: (open: boolean) => void;
}

const BillPaymentDialogContent = ({
  billId,
  billTitle,
  amount,
  frequency,
  onPaymentSuccess,
  onOpenChange
}: BillPaymentDialogContentProps) => {
  const { isSubmitting, processBillPayment } = useBillPayment(
    billId,
    billTitle,
    amount,
    frequency,
    onPaymentSuccess,
    onOpenChange
  );

  return (
    <>
      <DialogHeader>
        <DialogTitle>Pay Bill: {billTitle}</DialogTitle>
        <DialogDescription>
          Record payment for this bill. Amount: {formatNaira(amount)}
        </DialogDescription>
      </DialogHeader>
      
      <PaymentMethodForm
        onSubmit={processBillPayment}
        isSubmitting={isSubmitting}
        onCancel={() => onOpenChange(false)}
      />
    </>
  );
};

export default BillPaymentDialogContent;
