
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
import { useFinancialBreakdown } from "@/hooks/useFinancialBreakdown";
import { Skeleton } from "@/components/ui/skeleton";

const FinancialChartsSection = () => {
  const [filterPeriod, setFilterPeriod] = useState("Last six month");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Use our custom hook to fetch financial data
  const { expenseData, revenueData, isLoading } = useFinancialBreakdown(filterPeriod);

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
    <div className="mb-8 relative">
      {/* Background decorative element */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br from-green-200 to-blue-200 opacity-30 blur-2xl -z-10"></div>
      <div className="absolute bottom-12 -left-6 w-32 h-32 rounded-full bg-gradient-to-tr from-purple-200 to-pink-200 opacity-30 blur-2xl -z-10"></div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6">
        <h2 className="text-xl font-semibold mb-2 sm:mb-0 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Financial breakdown</h2>
        <div className="flex items-center w-full sm:w-auto gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs sm:text-sm h-8 sm:h-9 gap-2 w-full sm:w-auto border border-gray-200 shadow-sm">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="truncate">{filterPeriod}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="p-3">
                <p className="px-2 py-2 text-sm text-muted-foreground">Select a specific month:</p>
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={handleCalendarSelect}
                  initialFocus
                />
              </div>
            </PopoverContent>
          </Popover>
          
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs sm:text-sm h-8 sm:h-9 w-8 sm:w-9 p-0 ml-auto sm:ml-0 border border-gray-200 shadow-sm"
                onClick={handleFilterClick}
              >
                <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 bg-white" align="end">
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mb-5 relative">
        <div className="transform transition-all duration-300 hover:scale-[1.01] hover:shadow-md">
          {isLoading ? (
            <Skeleton className="w-full h-[420px] rounded-lg" />
          ) : (
            <PieChartCard title="Expense breakdown" data={expenseData} />
          )}
        </div>
        <div className="transform transition-all duration-300 hover:scale-[1.01] hover:shadow-md">
          {isLoading ? (
            <Skeleton className="w-full h-[420px] rounded-lg" />
          ) : (
            <PieChartCard title="Revenue sources" data={revenueData} />
          )}
        </div>
      </div>
      
      <div className="transform transition-all duration-300 hover:scale-[1.01] hover:shadow-md">
        <SalesTrendsChart />
      </div>
    </div>
  );
};

export default FinancialChartsSection;
