
import { useRevenue } from "@/contexts/RevenueContext";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { 
  Bar, 
  BarChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from "recharts";
import { formatNaira } from "@/utils/invoice/formatters";

const RevenueChart = () => {
  const { revenues } = useRevenue();
  
  // Prepare data for the last 7 days
  const last7Days = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date()
  });

  const chartData = last7Days.map(date => {
    const formattedDate = format(date, "MMM dd");
    const dayRevenues = revenues.filter(revenue => {
      const revenueDate = new Date(revenue.date);
      return (
        revenueDate.getDate() === date.getDate() &&
        revenueDate.getMonth() === date.getMonth() &&
        revenueDate.getFullYear() === date.getFullYear()
      );
    });
    
    const totalAmount = dayRevenues.reduce((sum, revenue) => sum + revenue.amount, 0);
    
    return {
      date: formattedDate,
      amount: totalAmount,
    };
  });

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium">{label}</p>
          <p className="text-green-600 font-medium">{formatNaira(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6B7280', fontSize: 12 }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6B7280', fontSize: 12 }}
            tickFormatter={(value) => `₦${value.toLocaleString()}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ bottom: 0 }} />
          <Bar 
            dataKey="amount" 
            name="Revenue" 
            fill="#10B981" 
            radius={[4, 4, 0, 0]}
            barSize={30}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;
