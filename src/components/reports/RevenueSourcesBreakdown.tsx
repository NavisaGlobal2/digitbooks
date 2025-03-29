
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { RevenueBreakdown } from "@/hooks/useFinancialReports";
import { formatNaira } from "@/utils/invoice/formatters";

interface RevenueSourcesBreakdownProps {
  data: RevenueBreakdown[];
}

const COLORS = ["#10B981", "#3B82F6", "#8B5CF6", "#F97316", "#EC4899", "#6366F1"];

const RevenueSourcesBreakdown = ({ data }: RevenueSourcesBreakdownProps) => {
  // Sort data by amount in descending order
  const sortedData = [...data].sort((a, b) => b.amount - a.amount);

  // Custom name formatting
  const formatSourceName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, ' ');
  };

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Revenue Sources</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="h-64 w-full md:w-1/2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sortedData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  innerRadius={50}
                  dataKey="amount"
                  nameKey="source"
                >
                  {sortedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatNaira(value as number)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="w-full md:w-1/2">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left text-sm font-medium text-muted-foreground">Source</th>
                  <th className="text-right text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="text-right text-sm font-medium text-muted-foreground">%</th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((item, index) => (
                  <tr key={index} className="border-b last:border-b-0 border-gray-100">
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span>{formatSourceName(item.source)}</span>
                      </div>
                    </td>
                    <td className="py-2 text-right">{formatNaira(item.amount)}</td>
                    <td className="py-2 text-right">{item.percentage.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueSourcesBreakdown;
