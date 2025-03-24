
import { InvoiceItem } from "@/types/invoice";
import { calculateSubtotal, calculateTax, calculateTotal } from "@/utils/invoice";

interface InvoiceFormContainerProps {
  children: React.ReactNode;
  preview: React.ReactNode;
}

const InvoiceFormContainer = ({ children, preview }: InvoiceFormContainerProps) => {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Invoice Form - Made narrower */}
      <div className="w-full lg:w-2/5 space-y-6 lg:overflow-y-auto lg:max-h-[calc(100vh-140px)] pr-4">
        {children}
      </div>

      {/* Invoice Preview - Made larger and sticky */}
      <div className="w-full lg:w-3/5 lg:sticky lg:top-24 lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto">
        {preview}
      </div>
    </div>
  );
};

export default InvoiceFormContainer;
