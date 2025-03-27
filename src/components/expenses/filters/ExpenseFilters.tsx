
import { useState } from "react";
import { DateRange } from "react-day-picker";
import FilterDropdown from "@/components/ui/FilterDropdown";
import { getCategoryLabel } from "@/utils/expenseCategories";
import SearchInput from "./SearchInput";
import DateRangeFilter from "./DateRangeFilter";

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
  const categoryOptions = [
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
  const paymentMethodOptions = [
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
      <SearchInput 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
      />
      
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
        
        <DateRangeFilter 
          dateRange={dateRange}
          onDateRangeChange={handleDateRangeChange}
        />
      </div>
    </div>
  );
};

export default ExpenseFilters;
