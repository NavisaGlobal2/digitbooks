
import { Filter, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface InvoiceSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onCreateInvoice: () => void;
}

const InvoiceSearchBar = ({ 
  searchQuery, 
  setSearchQuery, 
  onCreateInvoice 
}: InvoiceSearchBarProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
      <div className="relative w-full md:w-auto flex-1">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search invoices..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="flex items-center gap-3 w-full md:w-auto">
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span>Filters</span>
        </Button>
        
        <Button 
          className="bg-green-500 hover:bg-green-600 text-white"
          onClick={onCreateInvoice}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create invoice
        </Button>
      </div>
    </div>
  );
};

export default InvoiceSearchBar;
