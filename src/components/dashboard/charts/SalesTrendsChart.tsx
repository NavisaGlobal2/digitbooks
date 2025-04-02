
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { formatNaira } from "@/utils/invoice/formatters";
import { useSalesTrendsData } from "@/hooks/useSalesTrendsData";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { toast } from "sonner";

const chartConfig = {
  sales: {
    label: "Sales",
    color: "#9b87f5"
  }
};

const SalesTrendsChart = () => {
  const [filterPeriod, setFilterPeriod] = useState("Last six months");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { salesData, isLoading } = useSalesTrendsData(filterPeriod);

  const handleCalendarSelect = (date: Date | undefined) => {
    setDate(date);
    
    if (date) {
      const formattedDate = format(date, "MMM yyyy");
      setFilterPeriod(formattedDate);
      toast.success(`Sales data updated for ${formattedDate}`);
    }
  };

  return (
    <Card className="p-4 md:p-6 border-none shadow-sm mt-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h2 className="text-lg font-semibold">Sales trends</h2>
        <div className="mt-2 sm:mt-0">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs sm:text-sm h-8 sm:h-9 gap-2 border border-gray-200 shadow-sm">
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
        </div>
      </div>
      
      <div className="h-[250px]">
        {isLoading ? (
          <div className="h-full w-full flex items-center justify-center">
            <Skeleton className="h-full w-full rounded-lg" />
          </div>
        ) : salesData.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center flex-col">
            <p className="text-muted-foreground">No sales data available for the selected period</p>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="w-full aspect-auto h-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={salesData}
                margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6E4DD" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#828179' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#828179' }}
                  tickFormatter={(value) => `₦${(value / 1000)}k`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    
                    // Ensure value is treated as a number
                    const value = typeof payload[0].value === 'number' 
                      ? payload[0].value 
                      : parseFloat(String(payload[0].value)) || 0;
                    
                    return (
                      <div className="bg-white p-2 border border-gray-200 rounded shadow-sm">
                        <p className="font-semibold">{payload[0].payload.name}</p>
                        <p className="break-words">{formatNaira(value)}</p>
                      </div>
                    );
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value"
                  stroke="#9b87f5"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#9b87f5", strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: "#9b87f5", stroke: "#fff", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </div>
    </Card>
  );
};

export default SalesTrendsChart;
