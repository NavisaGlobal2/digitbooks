
import { Invoice, InvoiceStatus, PaymentRecord } from '@/types/invoice';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

export const useInvoiceOperations = (invoices: Invoice[], setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>) => {
  const { user } = useAuth();

  const getNextInvoiceNumber = () => {
    const year = new Date().getFullYear().toString().slice(-2);
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const prefix = `INV-${year}${month}-`;
    
    const existingNumbers = invoices
      .map(inv => inv.invoiceNumber)
      .filter(num => num.startsWith(prefix))
      .map(num => parseInt(num.replace(prefix, ''), 10));
    
    const nextNumber = existingNumbers.length > 0
      ? Math.max(...existingNumbers) + 1
      : 1;
    
    return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
  };

  const addInvoice = async (invoiceData: Omit<Invoice, 'id' | 'invoiceNumber'>) => {
    if (!user?.id) {
      toast.error("You must be logged in to create an invoice");
      return;
    }

    try {
      const invoiceNumber = getNextInvoiceNumber();
      
      // Prepare invoice data for database storage - convert types to match database schema
      const dbInvoiceData = {
        user_id: user.id,
        client_name: invoiceData.clientName,
        invoice_number: invoiceNumber,
        issued_date: invoiceData.issuedDate.toISOString(),
        due_date: invoiceData.dueDate.toISOString(),
        amount: invoiceData.amount,
        status: invoiceData.status,
        items: invoiceData.items || [], // Convert to JSON for database
        logo_url: invoiceData.logoUrl || null,
        additional_info: invoiceData.additionalInfo || null,
        bank_details: invoiceData.bankDetails || {} // Convert to JSON for database
      };
      
      const { data, error } = await supabase
        .from('invoices')
        .insert(dbInvoiceData)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Format the returned data to match our Invoice type
      const parsedItems = Array.isArray(data.items) ? data.items : [];
      const parsedBankDetails = typeof data.bank_details === 'object' ? data.bank_details : {
        accountName: '',
        accountNumber: '',
        bankName: ''
      };

      const newInvoice: Invoice = {
        id: data.id,
        clientName: data.client_name,
        clientEmail: invoiceData.clientEmail, // Keep from original data since DB doesn't have it
        clientAddress: invoiceData.clientAddress, // Keep from original data since DB doesn't have it
        invoiceNumber: data.invoice_number,
        issuedDate: new Date(data.issued_date),
        dueDate: new Date(data.due_date),
        amount: data.amount,
        status: data.status as InvoiceStatus,
        items: parsedItems as any, // Type assertion to match expected Invoice.items type
        logoUrl: data.logo_url || undefined,
        additionalInfo: data.additional_info || undefined,
        bankDetails: parsedBankDetails as any, // Type assertion for bankDetails
        paidDate: undefined // The DB doesn't have this field
      };
      
      // Update local state
      setInvoices(prev => [newInvoice, ...prev]);
      
      // Success notification
      toast.success("Invoice created successfully");
      
    } catch (error) {
      console.error("Failed to save invoice:", error);
      toast.error("Failed to create invoice");
    }
  };

  const updateInvoiceStatus = async (invoiceId: string, status: InvoiceStatus) => {
    try {
      // Update in database
      const { error } = await supabase
        .from('invoices')
        .update({ status })
        .eq('id', invoiceId)
        .eq('user_id', user?.id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setInvoices(prev => 
        prev.map(invoice => 
          invoice.id === invoiceId 
            ? { ...invoice, status } 
            : invoice
        )
      );
      
      toast.success("Invoice status updated");
    } catch (error) {
      console.error("Failed to update invoice status:", error);
      toast.error("Failed to update invoice status");
    }
  };

  const markInvoiceAsPaid = async (invoiceId: string, payments: PaymentRecord[]) => {
    try {
      const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
      const invoice = invoices.find(inv => inv.id === invoiceId);
      
      if (!invoice) {
        throw new Error("Invoice not found");
      }
      
      const status = totalPaid >= invoice.amount ? 'paid' : 'partially-paid';
      
      // Update in database - don't try to update paid_date as it doesn't exist
      const { error } = await supabase
        .from('invoices')
        .update({ status })
        .eq('id', invoiceId)
        .eq('user_id', user?.id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setInvoices(prev => 
        prev.map(invoice => {
          if (invoice.id === invoiceId) {
            return { 
              ...invoice, 
              status,
              payments,
              paidDate: status === 'paid' ? new Date() : undefined
            };
          }
          return invoice;
        })
      );
      
      toast.success("Payment recorded successfully");
    } catch (error) {
      console.error("Failed to mark invoice as paid:", error);
      toast.error("Failed to record payment");
    }
  };

  return {
    getNextInvoiceNumber,
    addInvoice,
    updateInvoiceStatus,
    markInvoiceAsPaid
  };
};
