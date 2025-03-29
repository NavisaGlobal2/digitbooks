
import { format } from "date-fns";
import { CheckCircle, Download, ExternalLink, MoreVertical, Receipt } from "lucide-react";
import { useState } from "react";
import { Invoice } from "@/types/invoice";
import { formatNaira } from "@/utils/invoice/formatters";
import { downloadInvoice, downloadReceipt, shareInvoice, captureInvoiceAsImage } from "@/utils/invoice/documentActions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import InvoiceStatusBadge from "./InvoiceStatusBadge";
import MarkAsPaidDialog from "./MarkAsPaidDialog";
import { toast } from "sonner";

interface InvoiceTableProps {
  invoices: Invoice[];
  onMarkAsPaid: (invoiceId: string, payments: any[]) => void;
}

const InvoiceTable = ({ invoices, onMarkAsPaid }: InvoiceTableProps) => {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [isPaidDialogOpen, setIsPaidDialogOpen] = useState(false);
  
  const selectedInvoice = invoices.find(invoice => invoice.id === selectedInvoiceId);

  const handleMarkAsPaid = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    setIsPaidDialogOpen(true);
  };

  const handleDownloadInvoice = async (invoice: Invoice) => {
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
                      <DropdownMenuItem onClick={() => handleDownloadInvoice(invoice)} className="cursor-pointer">
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
                      <DropdownMenuItem onClick={() => handleShareInvoice(invoice)} className="cursor-pointer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Share
                      </DropdownMenuItem>
                      {(invoice.status === 'pending' || invoice.status === 'partially-paid') && (
                        <DropdownMenuItem onClick={() => handleMarkAsPaid(invoice.id)} className="cursor-pointer">
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
        <MarkAsPaidDialog
          open={isPaidDialogOpen}
          onOpenChange={setIsPaidDialogOpen}
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
