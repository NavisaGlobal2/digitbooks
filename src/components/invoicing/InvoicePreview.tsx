
import { format } from "date-fns";
import { InvoiceItem } from "@/types/invoice";
import { formatNaira } from "@/utils/invoice/formatters";
import { Logo } from "@/components/Logo";

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
  clientAddress?: string;
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
  clientAddress
}: InvoicePreviewProps) => {
  return (
    <div className="invoice-preview bg-white rounded-lg border border-border p-8 shadow-sm">
      {/* Invoice Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">INVOICE</h2>
          <p className="text-sm text-gray-500 mt-1">
            <span className="font-medium">Invoice No:</span> INV-2023-001
          </p>
          <p className="text-sm text-gray-500">
            <span className="font-medium">Issue Date:</span> {invoiceDate ? format(invoiceDate, "dd MMM yyyy") : "Not set"}
          </p>
          <p className="text-sm text-gray-500">
            <span className="font-medium">Due Date:</span> {dueDate ? format(dueDate, "dd MMM yyyy") : "Not set"}
          </p>
        </div>
        
        <div className="flex-shrink-0">
          {logoPreview ? (
            <img 
              src={logoPreview} 
              alt="Company Logo" 
              className="h-16 w-auto object-contain" 
              crossOrigin="anonymous"
              onError={(e) => {
                console.error("Error loading logo in preview:", e);
                // Fallback to Logo component if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallbackDiv = document.createElement('div');
                fallbackDiv.className = 'h-16 w-16';
                const logoComponent = document.createElement('div');
                fallbackDiv.appendChild(logoComponent);
                target.parentNode?.appendChild(fallbackDiv);
              }}
            />
          ) : (
            <div className="h-16 w-16">
              <Logo className="w-full h-full" />
            </div>
          )}
        </div>
      </div>
      
      {/* Client Info */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Bill To:</h3>
        <p className="font-medium">{clientName || "Client Name"}</p>
        {clientAddress && <p className="text-gray-600">{clientAddress}</p>}
        <p className="text-gray-600">client@example.com</p>
        {!clientAddress && <p className="text-gray-600">Client Address, City</p>}
      </div>
      
      {/* Invoice Items */}
      <div className="mb-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-2 text-left">Description</th>
              <th className="py-2 text-right">Qty</th>
              <th className="py-2 text-right">Price</th>
              <th className="py-2 text-right">Tax</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoiceItems.map((item, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-3">{item.description}</td>
                <td className="py-3 text-right">{item.quantity}</td>
                <td className="py-3 text-right">{formatNaira(item.price)}</td>
                <td className="py-3 text-right">{item.tax}%</td>
                <td className="py-3 text-right">
                  {formatNaira(item.quantity * item.price)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Invoice Summary */}
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between py-1">
            <span className="text-gray-600">Subtotal:</span>
            <span>{formatNaira(calculateSubtotal(invoiceItems))}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-gray-600">Tax:</span>
            <span>{formatNaira(calculateTax(invoiceItems))}</span>
          </div>
          <div className="flex justify-between py-2 font-bold border-t border-gray-200 mt-2">
            <span>Total:</span>
            <span>{formatNaira(calculateTotal(invoiceItems))}</span>
          </div>
        </div>
      </div>
      
      {/* Payment Details */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Bank Details</h3>
        <div className="text-sm">
          <p><span className="font-medium">Bank Name:</span> {bankName || "Bank Name"}</p>
          <p><span className="font-medium">Account Name:</span> {accountName || "Account Name"}</p>
          <p><span className="font-medium">Account Number:</span> {accountNumber || "Account Number"}</p>
        </div>
      </div>
      
      {/* Additional Info */}
      {additionalInfo && (
        <div className="text-sm text-gray-600 border-t border-gray-100 pt-4">
          <h3 className="text-lg font-semibold mb-2">Additional Information</h3>
          <p>{additionalInfo}</p>
        </div>
      )}
    </div>
  );
};

export default InvoicePreview;
