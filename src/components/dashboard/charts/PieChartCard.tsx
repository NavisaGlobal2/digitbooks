
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { PieChart, Pie, ResponsiveContainer, Cell, Tooltip } from "recharts";

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
  const [tooltipContent, setTooltipContent] = useState<ChartDataItem | null>(null);
  
  const handleMouseEnter = (data: ChartDataItem, index: number) => {
    setActiveIndex(index);
    setTooltipContent(data);
  };
  
  const handleMouseLeave = () => {
    setActiveIndex(undefined);
    setTooltipContent(null);
  };
  
  return (
    <Card className="p-4 sm:p-6 bg-white rounded-lg border border-gray-100 overflow-hidden relative">
      {/* Decorative accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"></div>
      
      <h2 className="text-lg font-semibold mb-3 sm:mb-4 text-gray-900">{title}</h2>
      
      <div className="relative" style={{ height: "220px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={70}
              paddingAngle={4}
              dataKey="value"
              stroke="#FFFFFF"
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  onMouseEnter={() => handleMouseEnter(entry, index)}
                  onMouseLeave={handleMouseLeave}
                  style={{
                    opacity: activeIndex === undefined || activeIndex === index ? 1 : 0.6,
                    transition: 'opacity 0.3s, transform 0.3s',
                    transform: activeIndex === index ? 'scale(1.05)' : 'scale(1)',
                    cursor: 'pointer'
                  }}
                />
              ))}
            </Pie>
            
            {tooltipContent && (
              <foreignObject 
                x="33%" 
                y="35%" 
                width="34%" 
                height="30%" 
                style={{
                  overflow: 'visible',
                  animation: 'fade-in 0.2s ease-out',
                }}
              >
                <div className="bg-white p-3 rounded-lg shadow-md border border-gray-100 text-center">
                  <p className="font-semibold text-sm">{tooltipContent.name}</p>
                  <p className="text-base font-mono mt-1">₦{tooltipContent.value.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">{tooltipContent.percentage}</p>
                </div>
              </foreignObject>
            )}
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 sm:mt-6 space-y-1 bg-gray-50 p-2 sm:p-3 rounded-lg max-h-[180px] overflow-auto">
        {data.map((item, index) => (
          <div 
            key={index} 
            className="flex items-center justify-between py-1.5 sm:py-2 px-1.5 sm:px-2 rounded-md hover:bg-white hover:shadow-sm transition-all duration-200"
            onMouseEnter={() => handleMouseEnter(item, index)}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-sm" 
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-xs sm:text-sm">{item.name}</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-6">
              <span className="text-xs sm:text-sm text-gray-500 w-12 text-right">{item.percentage}</span>
              <span className="text-xs sm:text-sm font-medium w-16 sm:w-24 text-right">₦{item.value.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default PieChartCard;
