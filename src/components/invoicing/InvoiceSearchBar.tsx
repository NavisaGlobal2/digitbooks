
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import FilterDropdown from "@/components/ui/FilterDropdown";

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
  const [filterValue, setFilterValue] = useState("all");

  const filterOptions = [
    { label: "All invoices", value: "all" },
    { label: "Paid invoices", value: "paid" },
    { label: "Unpaid invoices", value: "unpaid" },
    { label: "Overdue invoices", value: "overdue" },
    { label: "Draft invoices", value: "draft" }
  ];

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
        <FilterDropdown
          options={filterOptions}
          selectedValue={filterValue}
          onFilterChange={setFilterValue}
        />
      </div>
    </div>
  );
};

export default InvoiceSearchBar;
