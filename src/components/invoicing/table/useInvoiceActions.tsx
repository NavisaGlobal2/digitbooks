
import { useState } from "react";
import { Invoice, PaymentRecord } from "@/types/invoice";
import { downloadInvoice, downloadReceipt, shareInvoice } from "@/utils/invoice/documentActions";
import { toast } from "sonner";

export const useInvoiceActions = (
  onMarkAsPaid: (invoiceId: string, payments: PaymentRecord[]) => Promise<void>,
  isProcessingPayment: boolean
) => {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [isPaidDialogOpen, setIsPaidDialogOpen] = useState(false);

  const handleMarkAsPaid = (invoiceId: string) => {
    if (isProcessingPayment) return;
    
    setSelectedInvoiceId(invoiceId);
    // Add a small delay to avoid UI glitches
    setTimeout(() => {
      setIsPaidDialogOpen(true);
    }, 50);
  };

  const handlePaidDialogClose = () => {
    // Wait a bit before clearing the selected invoice
    setTimeout(() => {
      setSelectedInvoiceId(null);
    }, 200);
  };

  const handleDownloadInvoice = async (invoice: Invoice) => {
    try {
      if (invoice.status === 'paid' || invoice.status === 'partially-paid') {
        await downloadReceipt(invoice);
        return;
      }

      await downloadInvoice({
        logoPreview: invoice.logoUrl || null,
        invoiceItems: invoice.items,
        invoiceDate: invoice.issuedDate,
        dueDate: invoice.dueDate,
        additionalInfo: invoice.additionalInfo || "",
        bankName: invoice.bankDetails.bankName,
        accountNumber: invoice.bankDetails.accountNumber,
        accountName: invoice.bankDetails.accountName,
        clientName: invoice.clientName,
        clientAddress: invoice.clientAddress,
        invoiceNumber: invoice.invoiceNumber,
        selectedTemplate: "default" // Adding the default template
      });
    } catch (error) {
      console.error("Error downloading invoice:", error);
      toast.error("Failed to download invoice");
    }
  };
  
  const handleShareInvoice = async (invoice: Invoice) => {
    try {
      if (invoice.status === 'paid' || invoice.status === 'partially-paid') {
        toast.error("Sharing paid invoices as receipts is not yet supported");
        return;
      }

      await shareInvoice({
        logoPreview: invoice.logoUrl || null,
        invoiceItems: invoice.items,
        invoiceDate: invoice.issuedDate,
        dueDate: invoice.dueDate,
        additionalInfo: invoice.additionalInfo || "",
        bankName: invoice.bankDetails.bankName,
        accountNumber: invoice.bankDetails.accountNumber,
        accountName: invoice.bankDetails.accountName,
        clientName: invoice.clientName,
        clientAddress: invoice.clientAddress,
        invoiceNumber: invoice.invoiceNumber,
        selectedTemplate: "default" // Adding the default template
      });
    } catch (error) {
      console.error("Error sharing invoice:", error);
      toast.error("Failed to share invoice");
    }
  };

  return {
    selectedInvoiceId,
    isPaidDialogOpen,
    setIsPaidDialogOpen,
    handleMarkAsPaid,
    handlePaidDialogClose,
    handleDownloadInvoice,
    handleShareInvoice
  };
};
