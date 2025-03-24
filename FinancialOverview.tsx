
import { ArrowDown, ArrowUp, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatNaira } from "@/utils/invoice/formatters";

interface FinancialData {
  totalRevenue: number;
  totalExpenses: number;
  netCashflow: number;
  positive: boolean;
}

interface FinancialOverviewProps {
  data: FinancialData;
}

const FinancialOverview = ({ data }: FinancialOverviewProps) => {
  return (
    <div className="mb-2">
      <h2 className="text-xl font-semibold mb-4">Financial Overview</h2>
      <div className="grid grid-cols-3 gap-5">
        <Card className="overflow-hidden border-none shadow-sm">
          <div className="h-1 bg-gradient-to-r from-green-400 to-green-500 w-full"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-secondary text-sm font-medium">Total Revenue</span>
              <div className="h-8 w-8 bg-green-50 rounded-full flex items-center justify-center">
                <ArrowDown className="text-green-500 h-5 w-5" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-2">{formatNaira(data.totalRevenue)}</div>
            <div className="flex items-center text-sm">
              <span className="text-muted-foreground">Cash inflow</span>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-none shadow-sm">
          <div className="h-1 bg-gradient-to-r from-purple-400 to-purple-500 w-full"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-secondary text-sm font-medium">Total Expenses</span>
              <div className="h-8 w-8 bg-purple-50 rounded-full flex items-center justify-center">
                <ArrowUp className="text-purple-500 h-5 w-5" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-2">{formatNaira(data.totalExpenses)}</div>
            <div className="flex items-center text-sm">
              <span className="text-muted-foreground">Cash outflow</span>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-none shadow-sm">
          <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-500 w-full"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-secondary text-sm font-medium">Net Cashflow</span>
              <div className="h-8 w-8 bg-blue-50 rounded-full flex items-center justify-center">
                <TrendingUp className="text-blue-500 h-5 w-5" />
              </div>
            </div>
            <div className="text-3xl font-bold text-success mb-2">{formatNaira(data.netCashflow)}</div>
            <div className="flex items-center text-sm">
              <span className="text-success">Positive cashflow</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancialOverview;
