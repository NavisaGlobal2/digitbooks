
import { useState } from "react";
import { Calendar, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import PieChartCard from "@/components/dashboard/charts/PieChartCard";
import SalesTrendsChart from "@/components/dashboard/charts/SalesTrendsChart";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";

// Sample data for the pie charts
const expenseData = [
  { name: "Salaries", value: 55000, percentage: "31.5%", color: "#10B981" },
  { name: "Rent", value: 55000, percentage: "31.5%", color: "#F87171" },
  { name: "Utilities", value: 55000, percentage: "31.5%", color: "#1E293B" },
  { name: "Marketing", value: 55000, percentage: "31.5%", color: "#93C5FD" },
  { name: "Travel", value: 55000, percentage: "31.5%", color: "#9CA3AF" }
];

const revenueData = [
  { name: "Salaries", value: 55000, percentage: "31.5%", color: "#10B981" },
  { name: "Rent", value: 55000, percentage: "31.5%", color: "#F87171" },
  { name: "Utilities", value: 55000, percentage: "31.5%", color: "#1E293B" },
  { name: "Marketing", value: 55000, percentage: "31.5%", color: "#93C5FD" },
  { name: "Travel", value: 55000, percentage: "31.5%", color: "#9CA3AF" }
];

const FinancialChartsSection = () => {
  const [filterPeriod, setFilterPeriod] = useState("Last six month");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleCalendarSelect = (date: Date | undefined) => {
    setDate(date);
    
    if (date) {
      const formattedDate = format(date, "MMM yyyy");
      setFilterPeriod(formattedDate);
      toast.success(`Financial data updated for ${formattedDate}`);
    }
  };
  
  const handleFilterClick = () => {
    setIsFilterOpen(!isFilterOpen);
    
    if (!isFilterOpen) {
      toast.success("Filter options opened");
    }
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6">
        <h2 className="text-xl font-semibold mb-2 sm:mb-0">Financial breakdown</h2>
        <div className="flex items-center w-full sm:w-auto gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs sm:text-sm h-8 sm:h-9 gap-2 w-full sm:w-auto">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="truncate">{filterPeriod}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={handleCalendarSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs sm:text-sm h-8 sm:h-9 w-8 sm:w-9 p-0 ml-auto sm:ml-0"
                onClick={handleFilterClick}
              >
                <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56" align="end">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Filter Options</h4>
                <div className="grid gap-1">
                  {["Income", "Expenses", "Both"].map((option) => (
                    <Button
                      key={option}
                      variant="ghost"
                      className="justify-start text-xs h-8"
                      onClick={() => {
                        toast.success(`Filtered by ${option}`);
                        setIsFilterOpen(false);
                      }}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
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
