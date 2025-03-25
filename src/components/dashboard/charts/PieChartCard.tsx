
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { PieChart, Pie, ResponsiveContainer, Cell, Tooltip, Legend } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { PieChartIcon } from "lucide-react";

interface ChartDataItem {
  name: string;
  value: number;
  percentage: string;
  color: string;
}

interface PieChartCardProps {
  title: string;
  data: ChartDataItem[];
}

const PieChartCard: React.FC<PieChartCardProps> = ({ title, data }) => {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };
  
  const onPieLeave = () => {
    setActiveIndex(undefined);
  };
  
  // Calculate total for better percentage display
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // Enhanced data with better percentages
  const enhancedData = data.map(item => ({
    ...item,
    calculatedPercentage: `${((item.value / total) * 100).toFixed(1)}%`
  }));
  
  return (
    <Card className="p-6 border-none shadow-sm bg-white hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-4">
        <PieChartIcon className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      
      <div className="h-[260px]">
        <ChartContainer
          config={{
            item1: { color: "#10B981" },
            item2: { color: "#F87171" },
            item3: { color: "#1E293B" },
            item4: { color: "#93C5FD" },
            item5: { color: "#9CA3AF" },
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={enhancedData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={2}
                dataKey="value"
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
                strokeWidth={3}
                stroke="#FFFFFF"
              >
                {enhancedData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    style={{
                      filter: activeIndex === index ? 'drop-shadow(0px 0px 4px rgba(0,0,0,0.3))' : 'none',
                      opacity: activeIndex === undefined || activeIndex === index ? 1 : 0.7,
                      transition: 'opacity 0.3s, filter 0.3s',
                    }}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
                      <p className="font-semibold text-sm">{data.name}</p>
                      <div className="flex items-center justify-between gap-3 mt-1">
                        <p className="font-mono text-sm">₦{data.value.toLocaleString()}</p>
                        <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs font-medium">
                          {data.calculatedPercentage}
                        </span>
                      </div>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
      
      <div className="mt-6 space-y-2">
        {enhancedData.map((item, index) => (
          <div 
            key={index} 
            className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50"
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(undefined)}
          >
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-sm" 
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-sm">{item.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">{item.calculatedPercentage}</span>
              <span className="text-sm font-medium">₦{item.value.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default PieChartCard;
