
import { format } from "date-fns";
import { InvoiceItem } from "@/types/invoice";
import { formatNaira } from "@/utils/invoice/formatters";
import { Logo } from "@/components/Logo";
import { useEffect, useState } from "react";

interface InvoicePreviewProps {
  logoPreview: string | null;
  invoiceItems: InvoiceItem[];
  invoiceDate: Date | undefined;
  dueDate: Date | undefined;
  additionalInfo: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  calculateSubtotal: (items: InvoiceItem[]) => number;
  calculateTax: (items: InvoiceItem[]) => number;
  calculateTotal: (items: InvoiceItem[]) => number;
  clientName: string;
  clientEmail?: string;
  clientAddress?: string;
  selectedTemplate?: string;
}

const InvoicePreview = ({
  logoPreview,
  invoiceItems,
  invoiceDate,
  dueDate,
  additionalInfo,
  bankName,
  accountNumber,
  accountName,
  calculateSubtotal,
  calculateTax,
  calculateTotal,
  clientName,
  clientEmail,
  clientAddress,
  selectedTemplate = "default"
}: InvoicePreviewProps) => {
  // State to track if logo failed to load
  const [logoError, setLogoError] = useState(false);
  
  // Reset logo error if logoPreview changes
  useEffect(() => {
    setLogoError(false);
  }, [logoPreview]);

  // Template-specific styles based on the selected template
  const styles = getTemplateStyles(selectedTemplate);
  
  return (
    <div className={`invoice-preview ${styles.container}`}>
      {/* Invoice Header */}
      <div className={`flex justify-between items-start ${styles.header}`}>
        <div>
          <h2 className={styles.title}>INVOICE</h2>
          <p className={styles.text}>
            <span className="font-medium">Invoice No:</span> INV-2023-001
          </p>
          <p className={styles.text}>
            <span className="font-medium">Issue Date:</span> {invoiceDate ? format(invoiceDate, "dd MMM yyyy") : "Not set"}
          </p>
          <p className={styles.text}>
            <span className="font-medium">Due Date:</span> {dueDate ? format(dueDate, "dd MMM yyyy") : "Not set"}
          </p>
        </div>
        
        <div className="flex-shrink-0">
          {logoPreview && !logoError ? (
            <div className="h-16 w-auto">
              <img 
                src={logoPreview} 
                alt="Company Logo" 
                className="h-16 w-auto object-contain" 
                crossOrigin="anonymous"
                onError={() => {
                  console.error("Logo failed to load in preview");
                  setLogoError(true);
                }}
              />
            </div>
          ) : (
            <div className="h-16 w-16 bg-green-500 text-white flex items-center justify-center font-bold rounded">
              <Logo className="w-full h-full" />
            </div>
          )}
        </div>
      </div>
      
      {/* Client Info */}
      <div className={styles.section}>
        <h3 className={styles.subtitle}>Bill To:</h3>
        <p className="font-medium">{clientName || "Client Name"}</p>
        {clientEmail && <p className={styles.text}>{clientEmail}</p>}
        {clientAddress && <p className={styles.text}>{clientAddress}</p>}
      </div>
      
      {/* Invoice Items */}
      <div className={styles.section}>
        <table className={styles.table}>
          <thead className={styles.tableHeader}>
            <tr>
              <th className={styles.tableHeaderCell}>Description</th>
              <th className={`${styles.tableHeaderCell} text-right`}>Qty</th>
              <th className={`${styles.tableHeaderCell} text-right`}>Price</th>
              <th className={`${styles.tableHeaderCell} text-right`}>Tax</th>
              <th className={`${styles.tableHeaderCell} text-right`}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoiceItems.map((item, index) => (
              <tr key={index} className={styles.tableRow}>
                <td className={styles.tableCell}>{item.description}</td>
                <td className={`${styles.tableCell} text-right`}>{item.quantity}</td>
                <td className={`${styles.tableCell} text-right`}>{formatNaira(item.price)}</td>
                <td className={`${styles.tableCell} text-right`}>{item.tax}%</td>
                <td className={`${styles.tableCell} text-right`}>
                  {formatNaira(item.quantity * item.price)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Invoice Summary */}
      <div className={`flex justify-end ${styles.section}`}>
        <div className="w-64">
          <div className="flex justify-between py-1">
            <span className={styles.text}>Subtotal:</span>
            <span>{formatNaira(calculateSubtotal(invoiceItems))}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className={styles.text}>Tax:</span>
            <span>{formatNaira(calculateTax(invoiceItems))}</span>
          </div>
          <div className="flex justify-between py-2 font-bold border-t border-gray-200 mt-2">
            <span>Total:</span>
            <span>{formatNaira(calculateTotal(invoiceItems))}</span>
          </div>
        </div>
      </div>
      
      {/* Payment Details */}
      <div className={styles.section}>
        <h3 className={styles.subtitle}>Bank Details</h3>
        <div className="text-sm">
          <p><span className="font-medium">Bank Name:</span> {bankName || "Bank Name"}</p>
          <p><span className="font-medium">Account Name:</span> {accountName || "Account Name"}</p>
          <p><span className="font-medium">Account Number:</span> {accountNumber || "Account Number"}</p>
        </div>
      </div>
      
      {/* Additional Info */}
      {additionalInfo && (
        <div className={`${styles.text} border-t border-gray-100 pt-4`}>
          <h3 className={styles.subtitle}>Additional Information</h3>
          <p>{additionalInfo}</p>
        </div>
      )}
    </div>
  );
};

// Function to get template-specific styles
function getTemplateStyles(selectedTemplate: string) {
  switch (selectedTemplate) {
    case "professional":
      return {
        container: "bg-white rounded-lg border border-gray-300 p-8 shadow",
        title: "text-2xl font-bold text-gray-800",
        subtitle: "text-base font-medium text-gray-600",
        text: "text-sm text-gray-600",
        header: "mb-8 border-b pb-4",
        section: "mb-6",
        table: "border-collapse w-full",
        tableHeader: "border-b-2 border-gray-300 bg-gray-100",
        tableHeaderCell: "text-left py-3 px-4 text-sm font-semibold text-gray-700",
        tableRow: "border-b border-gray-200",
        tableCell: "py-3 px-4 text-sm",
        summary: "mt-6 text-right"
      };
    case "minimalist":
      return {
        container: "bg-white rounded-lg border border-gray-200 p-6 shadow-sm",
        title: "text-xl font-normal text-gray-900",
        subtitle: "text-sm font-normal text-gray-500",
        text: "text-sm text-gray-500",
        header: "mb-8",
        section: "mb-6",
        table: "border-collapse w-full",
        tableHeader: "border-b border-gray-200",
        tableHeaderCell: "text-left py-2 px-1 text-xs font-medium text-gray-500 uppercase",
        tableRow: "border-b border-gray-100",
        tableCell: "py-2 px-1 text-sm",
        summary: "mt-4 text-right"
      };
    case "default":
    default:
      return {
        container: "bg-white rounded-lg border border-border p-8 shadow-sm",
        title: "text-2xl font-bold text-gray-900",
        subtitle: "text-sm font-medium text-gray-700",
        text: "text-sm text-gray-500",
        header: "mb-8",
        section: "mb-8",
        table: "border-collapse w-full",
        tableHeader: "border-b border-gray-200",
        tableHeaderCell: "text-left py-2 px-2 text-sm font-medium",
        tableRow: "border-b border-gray-100",
        tableCell: "py-3 px-2 text-sm",
        summary: "mt-6 text-right"
      };
  }
}

export default InvoicePreview;
