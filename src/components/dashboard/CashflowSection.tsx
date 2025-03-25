
import { useState } from "react";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import CashflowChart from "@/components/dashboard/CashflowChart";
import FilterDropdown from "@/components/ui/FilterDropdown";

const CashflowSection = () => {
  const [filterPeriod, setFilterPeriod] = useState("sixMonths");

  const filterOptions = [
    { label: "Last 30 days", value: "thirtyDays" },
    { label: "Last 3 months", value: "threeMonths" },
    { label: "Last 6 months", value: "sixMonths" },
    { label: "Last year", value: "oneYear" },
    { label: "All time", value: "allTime" }
  ];

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 pt-4 md:pt-6 px-4 md:px-6">
        <CardTitle className="text-xl font-semibold mb-2 sm:mb-0">Cashflow Analysis</CardTitle>
        <div className="flex flex-wrap w-full sm:w-auto items-center gap-2">
          <Button variant="outline" size="sm" className="text-sm h-9 gap-2 w-full sm:w-auto">
            <Calendar className="h-4 w-4" />
            Custom Range
          </Button>
          <FilterDropdown
            options={filterOptions}
            selectedValue={filterPeriod}
            onFilterChange={setFilterPeriod}
            className="text-sm h-9 w-auto"
            variant="outline"
          />
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="h-[280px] md:h-[320px]">
          <CashflowChart />
        </div>
      </CardContent>
    </Card>
  );
};

export default CashflowSection;
