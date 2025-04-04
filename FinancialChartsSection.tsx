
import { useState } from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import PieChartCard from "@/components/dashboard/charts/PieChartCard";
import SalesTrendsChart from "@/components/dashboard/charts/SalesTrendsChart";

// Sample data for the pie charts
const expenseData = [
  { name: "Salaries", value: 35000, percentage: "31.5%", color: "#10B981" },
  { name: "Rent", value: 25000, percentage: "31.5%", color: "#F87171" },
  { name: "Utilities", value: 15000, percentage: "31.5%", color: "#1E293B" },
  { name: "Marketing", value: 10000, percentage: "31.5%", color: "#93C5FD" },
  { name: "Travel", value: 5000, percentage: "31.5%", color: "#9CA3AF" }
];

const revenueData = [
  { name: "Salaries", value: 45000, percentage: "31.5%", color: "#10B981" },
  { name: "Rent", value: 25000, percentage: "31.5%", color: "#F87171" },
  { name: "Utilities", value: 20000, percentage: "31.5%", color: "#1E293B" },
  { name: "Marketing", value: 15000, percentage: "31.5%", color: "#93C5FD" },
  { name: "Travel", value: 10000, percentage: "31.5%", color: "#9CA3AF" }
];

const FinancialChartsSection = () => {
  const [filterPeriod, setFilterPeriod] = useState("Last six month");

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6">
        <h2 className="text-xl font-semibold mb-2 sm:mb-0">Financial breakdown</h2>
        <div className="flex items-center w-full sm:w-auto">
          <Button variant="outline" className="text-sm w-full sm:w-auto">
            {filterPeriod}
            <Filter className="h-4 w-4 ml-2 text-muted-foreground" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mb-5">
        <PieChartCard title="Expense breakdown" data={expenseData} />
        <PieChartCard title="Revenue sources" data={revenueData} />
      </div>
      
      <SalesTrendsChart />
    </div>
  );
};

export default FinancialChartsSection;
