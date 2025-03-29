
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNaira } from "@/utils/invoice/formatters";
import { FinancialSummary } from "@/hooks/useFinancialReports";
import { ArrowDown, ArrowUp, BarChart2 } from "lucide-react";

interface FinancialReportSummaryProps {
  summary: FinancialSummary;
}

const FinancialReportSummary = ({ summary }: FinancialReportSummaryProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <div className="h-8 w-8 bg-green-50 rounded-full flex items-center justify-center">
              <ArrowDown className="h-4 w-4 text-green-500" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-1">{formatNaira(summary.totalRevenue)}</div>
          <p className="text-xs text-muted-foreground">Cash inflow from sales, services, etc.</p>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
            <div className="h-8 w-8 bg-red-50 rounded-full flex items-center justify-center">
              <ArrowUp className="h-4 w-4 text-red-500" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-1">{formatNaira(summary.totalExpenses)}</div>
          <p className="text-xs text-muted-foreground">Cash outflow from operations</p>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gross Profit</CardTitle>
            <div className="h-8 w-8 bg-blue-50 rounded-full flex items-center justify-center">
              <BarChart2 className="h-4 w-4 text-blue-500" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-1">{formatNaira(summary.grossProfit)}</div>
          <p className="text-xs text-muted-foreground">Revenue minus COGS</p>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Profit</CardTitle>
            <div className="h-8 w-8 bg-purple-50 rounded-full flex items-center justify-center">
              <BarChart2 className="h-4 w-4 text-purple-500" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-1">{formatNaira(summary.netProfit)}</div>
          <p className="text-xs text-muted-foreground">
            Profit margin: {summary.profitMargin.toFixed(1)}%
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialReportSummary;
