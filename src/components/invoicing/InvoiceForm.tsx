
import { useInvoiceForm } from "@/hooks/useInvoiceForm";
import TemplateSelection from "./TemplateSelection";
import LogoUpload from "./LogoUpload";
import BusinessDetails from "./BusinessDetails";
import InvoiceItems from "./InvoiceItems";
import AdditionalInfo from "./AdditionalInfo";
import BankDetails from "./BankDetails";
import ActionButtons from "./ActionButtons";
import InvoicePreview from "./InvoicePreview";
import InvoiceFormContainer from "./form/InvoiceFormContainer";
import SaveInvoiceButton from "./form/SaveInvoiceButton";
import { calculateSubtotal, calculateTax, calculateTotal } from "@/utils/invoice";

const InvoiceForm = () => {
  const {
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
    setClientName,
    accountName,
    setAccountName,
    accountNumber,
    setAccountNumber,
    bankName,
    setBankName,
    addInvoiceItem,
    handleSaveInvoice
  } = useInvoiceForm();

  const formContent = (
    <>
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
        isVerified={isAccountVerified}
        setIsVerified={setIsAccountVerified}
      />

      {/* Save Button and Action Buttons */}
      <div className="space-y-4">
        <SaveInvoiceButton onSave={handleSaveInvoice} />
        
        <ActionButtons 
          logoPreview={logoPreview}
          invoiceItems={invoiceItems}
          invoiceDate={invoiceDate}
          dueDate={dueDate}
          additionalInfo={additionalInfo}
          bankName={bankName}
          accountNumber={accountNumber}
          accountName={accountName}
          clientName={clientName}
          selectedTemplate={selectedTemplate}
        />
      </div>
    </>
  );

  const previewContent = (
    <InvoicePreview 
      logoPreview={logoPreview}
      invoiceItems={invoiceItems}
      invoiceDate={invoiceDate}
      dueDate={dueDate}
      additionalInfo={additionalInfo}
      bankName={bankName}
      accountNumber={accountNumber}
      accountName={accountName}
      calculateSubtotal={calculateSubtotal}
      calculateTax={calculateTax}
      calculateTotal={calculateTotal}
      clientName={clientName}
    />
  );

  return (
    <InvoiceFormContainer
      children={formContent}
      preview={previewContent}
    />
  );
};

export default InvoiceForm;
