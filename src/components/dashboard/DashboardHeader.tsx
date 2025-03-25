
import { useState, useEffect } from "react";
import FilterDropdown from "@/components/ui/FilterDropdown";
import { toast } from "sonner";

const DashboardHeader = () => {
  const [filterPeriod, setFilterPeriod] = useState("sixMonths");

  const filterOptions = [
    { label: "Last 7 days", value: "sevenDays" },
    { label: "Last 30 days", value: "thirtyDays" },
    { label: "Last 3 months", value: "threeMonths" },
    { label: "Last 6 months", value: "sixMonths" },
    { label: "Last year", value: "oneYear" },
    { label: "All time", value: "allTime" }
  ];
  
  const handleFilterChange = (value: string) => {
    setFilterPeriod(value);
    
    // Get the selected filter label
    const selectedOption = filterOptions.find(option => option.value === value);
    if (selectedOption) {
      toast.success(`Data filtered for ${selectedOption.label}`);
    }
    
    // You would typically fetch data for the selected filter period here
    console.log(`Filter changed to: ${value}`);
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2 sm:gap-0">
      <p className="text-secondary text-sm sm:text-base">Here's what's happening with your finances today.</p>
      
      <div className="w-full sm:w-auto">
        <FilterDropdown 
          options={filterOptions}
          selectedValue={filterPeriod}
          onFilterChange={handleFilterChange}
          className="rounded-full w-full sm:w-auto"
        />
      </div>
    </div>
  );
};

export default DashboardHeader;
