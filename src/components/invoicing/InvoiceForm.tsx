
import { useState, useRef } from "react";
import { toast } from "sonner";
import TemplateSelection from "./TemplateSelection";
import LogoUpload from "./LogoUpload";
import BusinessDetails from "./BusinessDetails";
import InvoiceItems from "./InvoiceItems";
import AdditionalInfo from "./AdditionalInfo";
import BankDetails from "./BankDetails";
import ActionButtons from "./ActionButtons";
import InvoicePreview from "./InvoicePreview";

const InvoiceForm = () => {
  const [invoiceItems, setInvoiceItems] = useState([{ description: 'Website design service', quantity: 1, price: 3000, tax: 2 }]);
  const [selectedTemplate, setSelectedTemplate] = useState("default");
  const [invoiceDate, setInvoiceDate] = useState<Date | undefined>(new Date());
  const [dueDate, setDueDate] = useState<Date | undefined>(
    new Date(new Date().setDate(new Date().getDate() + 14))
  );
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [additionalInfo, setAdditionalInfo] = useState("End of month");
  
  // Bank details
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAddress, setBankAddress] = useState("");
  const [swiftCode, setSwiftCode] = useState("");
  
  const addInvoiceItem = () => {
    setInvoiceItems([...invoiceItems, { description: '', quantity: 1, price: 0, tax: 0 }]);
  };
  
  const calculateSubtotal = () => {
    return invoiceItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };
  
  const calculateTax = () => {
    return invoiceItems.reduce((sum, item) => sum + (item.quantity * item.price * item.tax / 100), 0);
  };
  
  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

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

        {/* Business Details */}
        <BusinessDetails 
          invoiceDate={invoiceDate}
          setInvoiceDate={setInvoiceDate}
          dueDate={dueDate}
          setDueDate={setDueDate}
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
        />

        {/* Action Buttons */}
        <ActionButtons 
          handleGenerateInvoice={handleGenerateInvoice}
          handleShareInvoice={handleShareInvoice}
        />
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
          calculateSubtotal={calculateSubtotal}
          calculateTax={calculateTax}
          calculateTotal={calculateTotal}
        />
      </div>
    </div>
  );
};

export default InvoiceForm;
