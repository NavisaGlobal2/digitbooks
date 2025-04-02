
import { useState } from "react";
import { Calendar, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import CashflowChart from "@/components/dashboard/CashflowChart";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useCashflowData } from "@/hooks/useCashflowData";

const CashflowSection = () => {
  const [filterPeriod, setFilterPeriod] = useState("Last six months");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [periodMonths, setPeriodMonths] = useState(6);
  
  const { data, isLoading } = useCashflowData(periodMonths);

  const handleCalendarSelect = (date: Date | undefined) => {
    setDate(date);
    
    if (date) {
      const formattedDate = format(date, "MMM yyyy");
      setFilterPeriod(formattedDate);
      toast.success(`Cashflow data updated for ${formattedDate}`);
    }
  };
  
  const handleFilterClick = () => {
    setIsFilterOpen(!isFilterOpen);
    
    if (!isFilterOpen) {
      toast.success("Filter options opened");
    }
  };
  
  const handlePeriodChange = (months: number, label: string) => {
    setPeriodMonths(months);
    setFilterPeriod(label);
    setIsFilterOpen(false);
    toast.success(`Showing data for ${label}`);
  };

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 pt-3 sm:pt-4 md:pt-6 px-3 sm:px-4 md:px-6">
        <CardTitle className="text-lg sm:text-xl font-semibold mb-2 sm:mb-0">Cashflow Analysis</CardTitle>
        <div className="flex flex-wrap w-full sm:w-auto items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="success" 
                size="sm" 
                className="text-xs sm:text-sm h-8 sm:h-9 gap-2 w-full sm:w-auto"
              >
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="truncate">{filterPeriod}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-[#F2FCE2] border border-green-100 shadow-md rounded-lg" align="end">
              <div className="p-2">
                <div className="space-y-1">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-left hover:bg-green-100" 
                    onClick={() => handlePeriodChange(3, "Last three months")}
                  >
                    Last three months
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-left hover:bg-green-100" 
                    onClick={() => handlePeriodChange(6, "Last six months")}
                  >
                    Last six months
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-left hover:bg-green-100" 
                    onClick={() => handlePeriodChange(12, "Last twelve months")}
                  >
                    Last twelve months
                  </Button>
                </div>
                <div className="border-t border-green-100 my-2"></div>
                <p className="px-2 py-1 text-xs text-muted-foreground">Or select a specific month:</p>
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={handleCalendarSelect}
                  initialFocus
                  className="w-[270px] p-3 pointer-events-auto"
                />
              </div>
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
            <PopoverContent className="w-56 bg-[#F2FCE2] border border-green-100" align="end">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Filter Options</h4>
                <div className="grid gap-1">
                  {["Income", "Expenses", "Both"].map((option) => (
                    <Button
                      key={option}
                      variant="ghost"
                      className="justify-start text-xs h-8 hover:bg-green-100"
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
      </CardHeader>
      <CardContent className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4">
        <div className="h-[200px] sm:h-[260px] md:h-[320px]">
          <CashflowChart data={data} isLoading={isLoading} />
        </div>
      </CardContent>
    </Card>
  );
};

export default CashflowSection;
