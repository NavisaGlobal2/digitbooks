
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InvoiceHeaderProps {
  isCreatingInvoice: boolean;
  setIsCreatingInvoice: (value: boolean) => void;
}

const InvoiceHeader = ({ 
  isCreatingInvoice, 
  setIsCreatingInvoice 
}: InvoiceHeaderProps) => {
  const navigate = useNavigate();
  
  const handleCreateInvoice = () => {
    setIsCreatingInvoice(true);
    window.scrollTo(0, 0);
  };
  
  const handleBackClick = () => {
    if (isCreatingInvoice) {
      setIsCreatingInvoice(false);
    } else {
      navigate('/dashboard');
    }
  };
  
  const handleClientClick = () => {
    navigate('/clients');
  };
  
  return (
    <header className="border-b border-border bg-white">
      <div className="px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={handleBackClick}
            className="flex items-center text-sm font-medium hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">
              {isCreatingInvoice ? 'Back to Invoices' : 'Back to Dashboard'}
            </span>
            <span className="sm:hidden">Back</span>
          </button>
          <h1 className="text-sm sm:text-lg font-semibold truncate">
            {isCreatingInvoice ? 'Create Invoice' : 'Invoicing'}
          </h1>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          {!isCreatingInvoice && (
            <>
              <Button 
                onClick={handleClientClick}
                className="bg-white text-primary border border-border hover:bg-[#F2FCE2]"
                size="sm"
              >
                <Users className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Clients</span>
              </Button>
              
              <Button 
                onClick={handleCreateInvoice}
                className="bg-[#05D166] hover:bg-[#05D166]/90 text-white"
                size="sm"
              >
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Create Invoice</span>
                <span className="sm:hidden">Create</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default InvoiceHeader;
