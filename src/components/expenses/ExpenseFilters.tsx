
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface ExpenseFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const ExpenseFilters = ({ searchQuery, setSearchQuery }: ExpenseFiltersProps) => {
  const [filterPeriod, setFilterPeriod] = useState("Last six month");
  
  return (
    <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mb-6 gap-4">
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          type="search"
          placeholder="Search expenses..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="flex gap-2 sm:gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              {filterPeriod}
              <Filter className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setFilterPeriod("Last month")}>
              Last month
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterPeriod("Last three month")}>
              Last three month
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterPeriod("Last six month")}>
              Last six month
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterPeriod("Last year")}>
              Last year
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterPeriod("All time")}>
              All time
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              All category
              <svg className="ml-2 h-4 w-4" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24">
                <path d="m6 9 6 6 6-6"></path>
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>All categories</DropdownMenuItem>
            <DropdownMenuItem>Office</DropdownMenuItem>
            <DropdownMenuItem>Travel</DropdownMenuItem>
            <DropdownMenuItem>Meals</DropdownMenuItem>
            <DropdownMenuItem>Utilities</DropdownMenuItem>
            <DropdownMenuItem>Rent</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Amount
              <svg className="ml-2 h-4 w-4" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24">
                <path d="m6 9 6 6 6-6"></path>
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Highest to lowest</DropdownMenuItem>
            <DropdownMenuItem>Lowest to highest</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Date range
              <svg className="ml-2 h-4 w-4" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24">
                <path d="m6 9 6 6 6-6"></path>
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Last 7 days</DropdownMenuItem>
            <DropdownMenuItem>Last 30 days</DropdownMenuItem>
            <DropdownMenuItem>Last 90 days</DropdownMenuItem>
            <DropdownMenuItem>Custom range</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default ExpenseFilters;
