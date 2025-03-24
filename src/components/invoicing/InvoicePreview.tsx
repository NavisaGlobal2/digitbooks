
import { format } from "date-fns";

interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
  tax: number;
}

interface InvoicePreviewProps {
  logoPreview: string | null;
  invoiceItems: InvoiceItem[];
  invoiceDate: Date | undefined;
  dueDate: Date | undefined;
  additionalInfo: string;
  bankName: string;
  accountNumber: string;
  swiftCode: string;
  calculateSubtotal: () => number;
  calculateTax: () => number;
  calculateTotal: () => number;
}

const InvoicePreview = ({
  logoPreview,
  invoiceItems,
  invoiceDate,
  dueDate,
  additionalInfo,
  bankName,
  accountNumber,
  swiftCode,
  calculateSubtotal,
  calculateTax,
  calculateTotal
}: InvoicePreviewProps) => {
  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      <h3 className="text-xl font-medium mb-4">Invoice preview</h3>
      <div className="border rounded-lg p-8 bg-white">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">INVOICE</h1>
          <div className="h-20 w-20 rounded-full flex items-center justify-center overflow-hidden">
            {logoPreview ? (
              <img src={logoPreview} alt="Company logo" className="h-full w-full object-contain" />
            ) : (
              <span className="text-gray-400">Logo</span>
            )}
          </div>
        </div>
        
        <div className="flex justify-between mb-10">
          <div>
            <h4 className="font-medium mb-2 text-lg">Billed to</h4>
            <p className="font-medium">Amarachhhlii LTD</p>
            <p>Amarachhhli@gmail.com</p>
            <p>Company address</p>
            <p>City, Country - 00000</p>
          </div>
          <div className="text-right">
            <p className="font-medium text-lg">Business name</p>
            <p>youremail@example.com</p>
            <p>Business address</p>
            <p>City, State, IN - 000 000</p>
            <p>TAX ID 00XXXXX1234XXXX</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="grid grid-cols-5 font-medium text-sm border-b pb-2">
            <div>Invoice #</div>
            <div>Description</div>
            <div className="text-center">Qty</div>
            <div className="text-right">Price</div>
            <div className="text-right">Total</div>
          </div>
          
          {invoiceItems.map((item, index) => (
            <div key={index} className="grid grid-cols-5 py-4 border-b text-sm">
              <div>{index === 0 ? "AB2324-01" : ""}</div>
              <div>{item.description || "Item description"}</div>
              <div className="text-center">{item.quantity}</div>
              <div className="text-right">${item.price.toFixed(2)}</div>
              <div className="text-right">${(item.quantity * item.price).toFixed(2)}</div>
            </div>
          ))}
        </div>

        <div className="flex justify-between mb-8">
          <div>
            <p className="font-medium mb-2">Invoice date</p>
            <p>{invoiceDate ? format(invoiceDate, "dd MMM, yyyy") : "01 Jan, 2023"}</p>
            
            <p className="font-medium mt-4 mb-2">Due date</p>
            <p>{dueDate ? format(dueDate, "dd MMM, yyyy") : "15 Jan, 2023"}</p>
          </div>
          
          <div className="text-right w-1/3">
            <div className="flex justify-between mb-2">
              <span>Subtotal</span>
              <span>${calculateSubtotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Tax ({(calculateTax() / calculateSubtotal() * 100).toFixed(1)}%)</span>
              <span>${calculateTax().toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold pt-2 border-t mt-3 text-lg">
              <span>Total due</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="border-t pt-5">
          <p className="font-medium mb-2">Payment terms</p>
          <p>100% upon project completion</p>
          <div className="flex items-start mt-3">
            <input type="checkbox" className="mt-1 mr-2" defaultChecked />
            <p className="text-sm">Please pay within 15 days of receiving this invoice.</p>
          </div>
        </div>

        <div className="border-t mt-6 pt-5">
          <p className="font-medium mb-2">Payment details</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p>Bank name</p>
              <p>IBAN/Account #</p>
              <p>Swift code</p>
            </div>
            <div>
              <p>{bankName || "ABCD BANK"}</p>
              <p>{accountNumber || "3747489 2300011"}</p>
              <p>{swiftCode || "ABCDUSBBXXX"}</p>
            </div>
          </div>
        </div>

        {additionalInfo && (
          <div className="border-t mt-6 pt-5">
            <p className="font-medium mb-2">Additional information</p>
            <p className="text-sm">{additionalInfo}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoicePreview;
