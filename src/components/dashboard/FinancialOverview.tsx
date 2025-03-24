
import { ArrowDown, ArrowUp, TrendingUp } from "lucide-react";

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
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Financial overview</h2>
      <div className="grid grid-cols-3 gap-5">
        <div className="bg-white rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-secondary text-sm font-medium">Total Revenue</span>
            <ArrowDown className="text-primary h-5 w-5" />
          </div>
          <div className="text-3xl font-bold mb-2">{data.totalRevenue.toLocaleString()}</div>
          <div className="flex items-center text-sm">
            <span className="text-muted-foreground">Cash inflow</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-secondary text-sm font-medium">Total expenses</span>
            <ArrowUp className="text-primary h-5 w-5" />
          </div>
          <div className="text-3xl font-bold mb-2">{data.totalExpenses.toLocaleString()}</div>
          <div className="flex items-center text-sm">
            <span className="text-muted-foreground">Cash outflow</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-secondary text-sm font-medium">Net cashflow</span>
            <TrendingUp className="text-primary h-5 w-5" />
          </div>
          <div className="text-3xl font-bold text-success mb-2">{data.netCashflow.toLocaleString()}</div>
          <div className="flex items-center text-sm">
            <span className="text-success">Positive cashflow</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialOverview;
