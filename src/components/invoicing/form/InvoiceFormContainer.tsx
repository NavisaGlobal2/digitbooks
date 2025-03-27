
import { Suspense, lazy, ReactNode } from "react";

interface InvoiceFormContainerProps {
  children: ReactNode;
  preview: ReactNode;
}

const InvoiceFormContainer = ({ children, preview }: InvoiceFormContainerProps) => {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Invoice Form - Made narrower */}
      <div className="w-full lg:w-2/5 space-y-6 lg:overflow-y-auto lg:max-h-[calc(100vh-140px)] pr-0 lg:pr-4 order-2 lg:order-1">
        {children}
      </div>

      {/* Invoice Preview - Made larger and sticky with deferred loading */}
      <div className="w-full lg:w-3/5 lg:sticky lg:top-24 lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto mb-6 lg:mb-0 order-1 lg:order-2">
        <Suspense fallback={
          <div className="bg-white rounded-lg border border-border p-8 shadow-sm h-[500px] flex items-center justify-center">
            <div className="animate-pulse text-primary">Loading preview...</div>
          </div>
        }>
          {preview}
        </Suspense>
      </div>
    </div>
  );
};

export default InvoiceFormContainer;
