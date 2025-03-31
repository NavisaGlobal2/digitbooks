
import { useEffect } from "react";
import { Invoice, PaymentRecord } from "@/types/invoice";
import { Table, TableBody } from "@/components/ui/table";
import { PaymentDialog } from "./payment/PaymentDialog";
import InvoiceTableHeader from "./table/InvoiceTableHeader";
import InvoiceRow from "./table/InvoiceRow";
import { useInvoiceActions } from "./table/useInvoiceActions";

interface InvoiceTableProps {
  invoices: Invoice[];
  onMarkAsPaid: (invoiceId: string, payments: PaymentRecord[]) => Promise<void>;
  isProcessingPayment?: boolean;
}

const InvoiceTable = ({ invoices, onMarkAsPaid, isProcessingPayment = false }: InvoiceTableProps) => {
  const {
    selectedInvoiceId,
    isPaidDialogOpen,
    setIsPaidDialogOpen,
    handleMarkAsPaid,
    handlePaidDialogClose,
    handleDownloadInvoice,
    handleShareInvoice
  } = useInvoiceActions(onMarkAsPaid, isProcessingPayment);
  
  // Close dialog when isProcessingPayment changes
  useEffect(() => {
    if (isProcessingPayment) {
      return;
    }
    
    // Wait a bit before allowing to select a new invoice
    const timer = setTimeout(() => {
      if (!isPaidDialogOpen) {
        handlePaidDialogClose();
      }
    }, 200);
    
    return () => clearTimeout(timer);
  }, [isProcessingPayment, isPaidDialogOpen]);
  
  const selectedInvoice = invoices.find(invoice => invoice.id === selectedInvoiceId);

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <InvoiceTableHeader />
          <TableBody>
            {invoices.map((invoice) => (
              <InvoiceRow 
                key={invoice.id}
                invoice={invoice}
                onDownload={handleDownloadInvoice}
                onShare={handleShareInvoice}
                onMarkAsPaid={handleMarkAsPaid}
                isProcessingPayment={isProcessingPayment}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedInvoice && (
        <PaymentDialog
          open={isPaidDialogOpen}
          onOpenChange={(open) => {
            setIsPaidDialogOpen(open);
            if (!open) handlePaidDialogClose();
          }}
          invoiceId={selectedInvoice.id}
          invoiceAmount={selectedInvoice.amount}
          onMarkAsPaid={onMarkAsPaid}
          existingPayments={selectedInvoice.payments || []}
        />
      )}
    </>
  );
};

export default InvoiceTable;
