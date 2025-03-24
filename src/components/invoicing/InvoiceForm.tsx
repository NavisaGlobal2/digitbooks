import { useState, useRef } from "react";
import { toast } from "sonner";
import { useInvoices } from "@/contexts/InvoiceContext";
import TemplateSelection from "./TemplateSelection";
import LogoUpload from "./LogoUpload";
import BusinessDetails from "./BusinessDetails";
import InvoiceItems from "./InvoiceItems";
import AdditionalInfo from "./AdditionalInfo";
import BankDetails from "./BankDetails";
import ActionButtons from "./ActionButtons";
import InvoicePreview from "./InvoicePreview";
import { InvoiceStatus } from "@/types/invoice";
import { calculateSubtotal, calculateTax, calculateTotal } from "@/utils/invoice";

const InvoiceForm = () => {
  const { addInvoice } = useInvoices();
  const [invoiceItems, setInvoiceItems] = useState([{ description: 'Website design service', quantity: 1, price: 50000, tax: 7.5 }]);
  const [selectedTemplate, setSelectedTemplate] = useState("default");
  const [invoiceDate, setInvoiceDate] = useState<Date | undefined>(new Date());
  const [dueDate, setDueDate] = useState<Date | undefined>(
    new Date(new Date().setDate(new Date().getDate() + 14))
  );
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [additionalInfo, setAdditionalInfo] = useState("Payment can be made directly to the bank account provided.");
  const [isAccountVerified, setIsAccountVerified] = useState(false);
  const [clientName, setClientName] = useState("Tech Solutions");
  
  // Bank details
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAddress, setBankAddress] = useState("");
  const [swiftCode, setSwiftCode] = useState("");
  
  const addInvoiceItem = () => {
    setInvoiceItems([...invoiceItems, { description: '', quantity: 1, price: 0, tax: 7.5 }]);
  };

  const handleSaveInvoice = () => {
    // Validate required fields
    if (!clientName.trim()) {
      toast.error("Please enter a client name");
      return;
    }

    if (!invoiceDate || !dueDate) {
      toast.error("Please set both invoice date and due date");
      return;
    }

    if (invoiceItems.some(item => !item.description.trim() || item.quantity <= 0 || item.price <= 0)) {
      toast.error("Please complete all invoice items with valid quantities and prices");
      return;
    }

    if (!accountName || !accountNumber || !bankName) {
      toast.error("Please complete the bank details");
      return;
    }

    // Create and save the invoice
    addInvoice({
      clientName,
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
        bankName,
        swiftCode
      }
    });

    toast.success("Invoice created successfully!");
    
    // Dispatch event to notify that an invoice was created
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

  // We'll remove these functions as they're now handled in the ActionButtons component
  const handleGenerateInvoice = () => {
    toast.success("Invoice generated successfully");
  };

  const handleShareInvoice = () => {
    toast.success("Invoice sharing link copied to clipboard");
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Invoice Form - Made narrower */}
      <div className="w-full lg:w-2/5 space-y-6 lg:overflow-y-auto lg:max-h-[calc(100vh-140px)] pr-4">
        {/* Business Details */}
        <BusinessDetails 
          invoiceDate={invoiceDate}
          setInvoiceDate={setInvoiceDate}
          dueDate={dueDate}
          setDueDate={setDueDate}
          clientName={clientName}
          setClientName={setClientName}
        />

        {/* Template Selection */}
        <TemplateSelection 
          selectedTemplate={selectedTemplate} 
          setSelectedTemplate={setSelectedTemplate} 
        />

        {/* Logo Upload */}
        <LogoUpload 
          logoPreview={logoPreview} 
          setLogoPreview={setLogoPreview} 
        />

        {/* Itemized Products/Services */}
        <InvoiceItems 
          invoiceItems={invoiceItems}
          setInvoiceItems={setInvoiceItems}
          addInvoiceItem={addInvoiceItem}
        />

        {/* Additional Info */}
        <AdditionalInfo 
          additionalInfo={additionalInfo}
          setAdditionalInfo={setAdditionalInfo}
        />

        {/* Bank Details */}
        <BankDetails 
          accountName={accountName}
          setAccountName={setAccountName}
          accountNumber={accountNumber}
          setAccountNumber={setAccountNumber}
          bankName={bankName}
          setBankName={setBankName}
          bankAddress={bankAddress}
          setBankAddress={setBankAddress}
          swiftCode={swiftCode}
          setSwiftCode={setSwiftCode}
          isVerified={isAccountVerified}
          setIsVerified={setIsAccountVerified}
        />

        {/* Save Button and Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleSaveInvoice}
            className="w-full py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors"
          >
            Save Invoice
          </button>
          
          <ActionButtons 
            handleGenerateInvoice={handleGenerateInvoice}
            handleShareInvoice={handleShareInvoice}
            isAccountVerified={isAccountVerified}
            logoPreview={logoPreview}
            invoiceItems={invoiceItems}
            invoiceDate={invoiceDate}
            dueDate={dueDate}
            additionalInfo={additionalInfo}
            bankName={bankName}
            accountNumber={accountNumber}
            swiftCode={swiftCode}
            accountName={accountName}
          />
        </div>
      </div>

      {/* Invoice Preview - Made larger and sticky */}
      <div className="w-full lg:w-3/5 lg:sticky lg:top-24 lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto">
        <InvoicePreview 
          logoPreview={logoPreview}
          invoiceItems={invoiceItems}
          invoiceDate={invoiceDate}
          dueDate={dueDate}
          additionalInfo={additionalInfo}
          bankName={bankName}
          accountNumber={accountNumber}
          swiftCode={swiftCode}
          accountName={accountName}
          calculateSubtotal={calculateSubtotal}
          calculateTax={calculateTax}
          calculateTotal={calculateTotal}
          clientName={clientName}
        />
      </div>
    </div>
  );
};

export default InvoiceForm;
