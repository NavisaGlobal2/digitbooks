import { format } from "date-fns";
import { CheckCircle, Download, ExternalLink, MoreVertical, Receipt } from "lucide-react";
import { useState, useEffect } from "react";
import { Invoice } from "@/types/invoice";
import { formatNaira } from "@/utils/invoice/formatters";
import { downloadInvoice, downloadReceipt, shareInvoice } from "@/utils/invoice/documentActions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import InvoiceStatusBadge from "./InvoiceStatusBadge";
import { PaymentDialog } from "./payment/PaymentDialog";
import { toast } from "sonner";

interface PaymentRecord {
  id: string;
  amount: number;
  date: string;
  method: string;
  reference?: string;
  notes?: string;
}

interface InvoiceTableProps {
  invoices: Invoice[];
  onMarkAsPaid: (invoiceId: string, payments: PaymentRecord[]) => Promise<void>;
  isProcessingPayment?: boolean;
}

const InvoiceTable = ({ invoices, onMarkAsPaid, isProcessingPayment = false }: InvoiceTableProps) => {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [isPaidDialogOpen, setIsPaidDialogOpen] = useState(false);
  
  useEffect(() => {
    if (isProcessingPayment) {
      return;
    }
    
    const timer = setTimeout(() => {
      if (!isPaidDialogOpen) {
        setSelectedInvoiceId(null);
      }
    }, 200);
    
    return () => clearTimeout(timer);
  }, [isProcessingPayment, isPaidDialogOpen]);
  
  const selectedInvoice = invoices.find(invoice => invoice.id === selectedInvoiceId);

  const handleMarkAsPaid = (invoiceId: string) => {
    if (isProcessingPayment) return;
    
    setSelectedInvoiceId(invoiceId);
    setTimeout(() => {
      setIsPaidDialogOpen(true);
    }, 50);
  };

  const handlePaidDialogClose = () => {
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
        selectedTemplate: "default"
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
        selectedTemplate: "default"
      });
    } catch (error) {
      console.error("Error sharing invoice:", error);
      toast.error("Failed to share invoice");
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Issued date</TableHead>
              <TableHead>Due date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                <TableCell>{invoice.clientName}</TableCell>
                <TableCell>{format(new Date(invoice.issuedDate), "dd/MM/yyyy")}</TableCell>
                <TableCell>{format(new Date(invoice.dueDate), "dd/MM/yyyy")}</TableCell>
                <TableCell className="text-right">{formatNaira(invoice.amount)}</TableCell>
                <TableCell>
                  <InvoiceStatusBadge status={invoice.status} />
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => handleDownloadInvoice(invoice)} 
                        className="cursor-pointer"
                        disabled={isProcessingPayment}
                      >
                        {invoice.status === 'paid' || invoice.status === 'partially-paid' ? (
                          <>
                            <Receipt className="h-4 w-4 mr-2" />
                            Download Receipt
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Download Invoice
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleShareInvoice(invoice)} 
                        className="cursor-pointer"
                        disabled={isProcessingPayment}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Share
                      </DropdownMenuItem>
                      {(invoice.status === 'pending' || invoice.status === 'partially-paid') && (
                        <DropdownMenuItem 
                          onClick={() => handleMarkAsPaid(invoice.id)} 
                          className="cursor-pointer"
                          disabled={isProcessingPayment}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {invoice.status === 'partially-paid' ? 'Update Payment' : 'Mark as Paid'}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
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
