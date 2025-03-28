
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNaira } from "@/utils/invoice/formatters";

interface ChartData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface FinancialReportChartProps {
  data: ChartData[];
}

const FinancialReportChart = ({ data }: FinancialReportChartProps) => {
  // Custom tooltip formatter
  const formatTooltipValue = (value: number) => {
    return formatNaira(value);
  };

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Financial Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] sm:h-80 w-full overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 10,
                left: 0,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 10 }}
                tickMargin={5}
              />
              <YAxis 
                tickFormatter={(value) => {
                  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                  return value;
                }}
                tick={{ fontSize: 10 }}
                width={40}
              />
              <Tooltip formatter={formatTooltipValue} />
              <Legend wrapperStyle={{ fontSize: '12px', marginTop: '10px' }} />
              <Bar dataKey="revenue" name="Revenue" fill="#10B981" />
              <Bar dataKey="expenses" name="Expenses" fill="#F87171" />
              <Bar dataKey="profit" name="Net Profit" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialReportChart;
