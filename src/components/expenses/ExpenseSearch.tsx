
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import FilterDropdown from "@/components/ui/FilterDropdown";

interface ExpenseSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onAddExpense: () => void;
}

const ExpenseSearch = ({ searchQuery, setSearchQuery, onAddExpense }: ExpenseSearchProps) => {
  const [filterValue, setFilterValue] = useState("all");

  const filterOptions = [
    { label: "All expenses", value: "all" },
    { label: "Food & Dining", value: "food" },
    { label: "Transportation", value: "transportation" },
    { label: "Utilities", value: "utilities" },
    { label: "Office supplies", value: "office" },
    { label: "Marketing", value: "marketing" }
  ];

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-6">
      <div className="relative w-full md:w-auto md:flex-1">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search expenses..."
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
          className="w-full md:w-auto"
        />
        
        <Button 
          className="bg-green-500 hover:bg-green-600 text-white ml-auto md:ml-0"
          onClick={onAddExpense}
        >
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden xs:inline">Add Expense</span>
          <span className="xs:hidden">Add</span>
        </Button>
      </div>
    </div>
  );
};

export default ExpenseSearch;
