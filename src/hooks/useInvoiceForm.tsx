import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useInvoices } from "@/contexts/InvoiceContext";
import { InvoiceItem, InvoiceStatus } from "@/types/invoice";
import { calculateTotal } from "@/utils/invoice";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

export const useInvoiceForm = () => {
  const { user } = useAuth();
  const { addInvoice } = useInvoices();
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([
    { description: 'Website design service', quantity: 1, price: 50000, tax: 7.5 }
  ]);
  const [selectedTemplate, setSelectedTemplate] = useState("default");
  const [invoiceDate, setInvoiceDate] = useState<Date | undefined>(new Date());
  const [dueDate, setDueDate] = useState<Date | undefined>(
    new Date(new Date().setDate(new Date().getDate() + 14))
  );
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [additionalInfo, setAdditionalInfo] = useState("Payment can be made directly to the bank account provided.");
  const [isAccountVerified, setIsAccountVerified] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  
  // Bank details
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  
  // Fetch business profile data on component mount
  useEffect(() => {
    const fetchBusinessProfile = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('logo_url, business_name')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching business profile:', error);
          return;
        }
        
        if (data && data.logo_url) {
          setLogoPreview(data.logo_url);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    
    fetchBusinessProfile();
  }, [user]);

  const addInvoiceItem = () => {
    setInvoiceItems([...invoiceItems, { description: '', quantity: 1, price: 0, tax: 7.5 }]);
  };

  const handleClientSelect = (name: string, email?: string, address?: string) => {
    setClientName(name);
    if (email) {
      setClientEmail(email);
    } else {
      setClientEmail("");
    }
    if (address) {
      setClientAddress(address);
    } else {
      setClientAddress("");
    }
  };

  const handleSaveInvoice = () => {
    const toastId = toast.loading("Creating invoice...");
    
    if (!clientName.trim()) {
      toast.error("Please select or enter a client name", { id: toastId });
      return;
    }

    if (!invoiceDate || !dueDate) {
      toast.error("Please set both invoice date and due date", { id: toastId });
      return;
    }

    if (invoiceItems.some(item => !item.description.trim() || item.quantity <= 0 || item.price <= 0)) {
      toast.error("Please complete all invoice items with valid quantities and prices", { id: toastId });
      return;
    }

    if (!accountName || !accountNumber || !bankName) {
      toast.error("Please complete the bank details", { id: toastId });
      return;
    }

    addInvoice({
      clientName,
      clientEmail,
      clientAddress,
      issuedDate: invoiceDate,
      dueDate: dueDate,
      amount: calculateTotal(invoiceItems),
      status: determineInvoiceStatus(dueDate),
      items: [...invoiceItems],
      logoUrl: logoPreview,
      additionalInfo,
      bankDetails: {
        accountName,
        accountNumber,
        bankName
      }
    });

    toast.success("Invoice created successfully!", { id: toastId });
    
    window.dispatchEvent(new CustomEvent('invoiceCreated'));
  };

  const determineInvoiceStatus = (dueDate?: Date): InvoiceStatus => {
    if (!dueDate) return 'pending';
    
    const today = new Date();
    if (dueDate < today) {
      return 'overdue';
    }
    return 'pending';
  };

  return {
    invoiceItems,
    setInvoiceItems,
    selectedTemplate,
    setSelectedTemplate,
    invoiceDate,
    setInvoiceDate,
    dueDate,
    setDueDate,
    logoPreview,
    setLogoPreview,
    additionalInfo,
    setAdditionalInfo,
    isAccountVerified,
    setIsAccountVerified,
    clientName,
    clientEmail,
    clientAddress,
    handleClientSelect,
    accountName,
    setAccountName,
    accountNumber,
    setAccountNumber,
    bankName,
    setBankName,
    addInvoiceItem,
    handleSaveInvoice
  };
};
