
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronLeft } from "lucide-react";

interface InvoiceHeaderProps {
  isCreatingInvoice: boolean;
  setIsCreatingInvoice: (value: boolean) => void;
}

const InvoiceHeader = ({ isCreatingInvoice, setIsCreatingInvoice }: InvoiceHeaderProps) => {
  return (
    <header className="h-16 border-b border-border bg-white flex items-center px-6 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        {isCreatingInvoice ? (
          <>
            <button 
              onClick={() => setIsCreatingInvoice(false)}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-semibold">Create invoice</h1>
          </>
        ) : (
          <>
            <Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-semibold">Invoicing</h1>
          </>
        )}
      </div>
    </header>
  );
};

export default InvoiceHeader;
