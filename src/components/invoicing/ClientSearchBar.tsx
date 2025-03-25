
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import FilterDropdown from "@/components/ui/FilterDropdown";

interface ClientSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onAddClient: () => void;
}

const ClientSearchBar = ({ 
  searchQuery, 
  setSearchQuery, 
  onAddClient 
}: ClientSearchBarProps) => {
  const [filterValue, setFilterValue] = useState("all");

  const filterOptions = [
    { label: "All clients", value: "all" },
    { label: "Active clients", value: "active" },
    { label: "Inactive clients", value: "inactive" },
    { label: "Outstanding balance", value: "outstanding" }
  ];

  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="relative w-full md:w-auto flex-1">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search clients..."
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
        
        <Button 
          className="bg-green-500 hover:bg-green-600 text-white"
          onClick={onAddClient}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </Button>
      </div>
    </div>
  );
};

export default ClientSearchBar;
