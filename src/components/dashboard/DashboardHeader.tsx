
import { useState } from "react";
import FilterDropdown from "@/components/ui/FilterDropdown";

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

  return (
    <div className="flex justify-between items-center mb-8">
      <p className="text-secondary">Here's what's happening with your finances today.</p>
      
      <div className="flex gap-4">
        <FilterDropdown 
          options={filterOptions}
          selectedValue={filterPeriod}
          onFilterChange={setFilterPeriod}
          className="rounded-full"
        />
      </div>
    </div>
  );
};

export default DashboardHeader;
