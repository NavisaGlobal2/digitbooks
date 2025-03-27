
import { useState } from "react";
import { Search, Filter, Calendar, CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import FilterDropdown, { FilterOption } from "@/components/ui/FilterDropdown";
import { ExpenseCategory } from "@/types/expense";
import { getCategoryLabel } from "@/utils/expenseCategories";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

interface ExpenseFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onCategoryChange?: (category: string) => void;
  onPaymentMethodChange?: (method: string) => void;
  onDateRangeChange?: (range: DateRange | undefined) => void;
  selectedCategory?: string;
  selectedPaymentMethod?: string;
  selectedDateRange?: DateRange;
}

const ExpenseFilters = ({ 
  searchQuery, 
  setSearchQuery,
  onCategoryChange,
  onPaymentMethodChange,
  onDateRangeChange,
  selectedCategory = 'all',
  selectedPaymentMethod = 'all',
  selectedDateRange
}: ExpenseFiltersProps) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(selectedDateRange);
  
  // Category filter options
  const categoryOptions: FilterOption[] = [
    { label: "All Categories", value: "all" },
    { label: getCategoryLabel("office"), value: "office" },
    { label: getCategoryLabel("travel"), value: "travel" },
    { label: getCategoryLabel("meals"), value: "meals" },
    { label: getCategoryLabel("utilities"), value: "utilities" },
    { label: getCategoryLabel("rent"), value: "rent" },
    { label: getCategoryLabel("software"), value: "software" },
    { label: getCategoryLabel("hardware"), value: "hardware" },
    { label: getCategoryLabel("marketing"), value: "marketing" },
    { label: getCategoryLabel("salaries"), value: "salaries" },
    { label: getCategoryLabel("taxes"), value: "taxes" },
    { label: getCategoryLabel("other"), value: "other" },
  ];
  
  // Payment method filter options
  const paymentMethodOptions: FilterOption[] = [
    { label: "All Methods", value: "all" },
    { label: "Cash", value: "cash" },
    { label: "Card", value: "card" },
    { label: "Bank Transfer", value: "bank transfer" },
    { label: "Other", value: "other" },
  ];
  
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    if (onDateRangeChange) {
      onDateRangeChange(range);
    }
  };
  
  return (
    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 items-start sm:items-center justify-between mb-4 gap-2">
      <div className="relative w-full sm:w-auto flex-grow max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          type="search"
          placeholder="Search expenses..."
          className="pl-8 w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
        <FilterDropdown
          options={categoryOptions}
          selectedValue={selectedCategory}
          onFilterChange={(value) => onCategoryChange?.(value)}
          label="Category"
          className="w-full sm:w-auto"
        />
        
        <FilterDropdown
          options={paymentMethodOptions}
          selectedValue={selectedPaymentMethod}
          onFilterChange={(value) => onPaymentMethodChange?.(value)}
          label="Payment"
          className="w-full sm:w-auto"
        />
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <Calendar className="h-4 w-4 mr-2" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd")} - {format(dateRange.to, "LLL dd")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd")
                )
              ) : (
                "Date Range"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <CalendarComponent
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={handleDateRangeChange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default ExpenseFilters;
