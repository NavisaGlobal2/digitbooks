
import { useState } from "react";
import { Calendar, Filter, Bot } from "lucide-react";
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
import AnalyticsAIChat from "@/components/analytics/AnalyticsAIChat";

// Sample data for the pie charts
const expenseData = [
  { name: "Salaries", value: 55000, percentage: "31.5%", color: "#10B981" },
  { name: "Rent", value: 35000, percentage: "20.1%", color: "#F87171" },
  { name: "Utilities", value: 25000, percentage: "14.3%", color: "#1E293B" },
  { name: "Marketing", value: 40000, percentage: "22.9%", color: "#93C5FD" },
  { name: "Travel", value: 20000, percentage: "11.2%", color: "#9CA3AF" }
];

const revenueData = [
  { name: "Product Sales", value: 75000, percentage: "42.6%", color: "#10B981" },
  { name: "Services", value: 45000, percentage: "25.6%", color: "#F87171" },
  { name: "Subscriptions", value: 30000, percentage: "17.0%", color: "#1E293B" },
  { name: "Consulting", value: 15000, percentage: "8.5%", color: "#93C5FD" },
  { name: "Other", value: 11000, percentage: "6.3%", color: "#9CA3AF" }
];

const FinancialChartsSection = () => {
  const [filterPeriod, setFilterPeriod] = useState("Last six month");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

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

  const openAnalyticsAI = () => {
    setIsAIChatOpen(true);
    toast.success("Analytics AI Assistant opened");
  };

  return (
    <div className="mb-8 relative">
      {/* Background decorative element */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br from-green-200 to-blue-200 opacity-30 blur-2xl -z-10"></div>
      <div className="absolute bottom-12 -left-6 w-32 h-32 rounded-full bg-gradient-to-tr from-purple-200 to-pink-200 opacity-30 blur-2xl -z-10"></div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6">
        <h2 className="text-xl font-semibold mb-2 sm:mb-0 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Financial breakdown</h2>
        <div className="flex items-center w-full sm:w-auto gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={openAnalyticsAI}
            className="text-xs sm:text-sm h-8 sm:h-9 gap-2 w-full sm:w-auto border border-gray-200 shadow-sm bg-[#05D166]/10 hover:bg-[#05D166]/20 border-[#05D166]/30"
          >
            <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-[#05D166]" />
            <span className="truncate">Ask AI Analyst</span>
          </Button>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs sm:text-sm h-8 sm:h-9 gap-2 w-full sm:w-auto border border-gray-200 shadow-sm">
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
          <PieChartCard title="Expense breakdown" data={expenseData} />
        </div>
        <div className="transform transition-all duration-300 hover:scale-[1.01] hover:shadow-md">
          <PieChartCard title="Revenue sources" data={revenueData} />
        </div>
      </div>
      
      <div className="transform transition-all duration-300 hover:scale-[1.01] hover:shadow-md">
        <SalesTrendsChart />
      </div>
      
      {/* Analytics AI Chat Modal */}
      <AnalyticsAIChat 
        isOpen={isAIChatOpen} 
        onClose={() => setIsAIChatOpen(false)} 
      />
    </div>
  );
};

export default FinancialChartsSection;
