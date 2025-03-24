
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

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
    <div className="grid grid-cols-3 gap-5 mb-8">
      <Card className="overflow-hidden border-none shadow-sm">
        <CardContent className="p-0">
          <div className="bg-gradient-to-r from-[#f0f9ff] to-[#e6f7ff] p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="font-medium text-secondary">Total Revenue</p>
              <Badge variant="info" className="bg-blue-100 text-blue-600 hover:bg-blue-100">+14.5%</Badge>
            </div>
            <h3 className="text-2xl font-bold mb-1">${data.totalRevenue.toLocaleString()}</h3>
            <p className="text-muted-foreground text-sm">Compared to $21,490 last month</p>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-none shadow-sm">
        <CardContent className="p-0">
          <div className="bg-gradient-to-r from-[#fff7f5] to-[#fff0eb] p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="font-medium text-secondary">Total Expenses</p>
              <Badge className="bg-red-100 text-red-600 hover:bg-red-100" variant="destructive">-3.2%</Badge>
            </div>
            <h3 className="text-2xl font-bold mb-1">${data.totalExpenses.toLocaleString()}</h3>
            <p className="text-muted-foreground text-sm">Compared to $14,900 last month</p>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-none shadow-sm">
        <CardContent className="p-0">
          <div className="bg-gradient-to-r from-[#f6f9ff] to-[#edf2ff] p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="font-medium text-secondary">Net Cashflow</p>
              <Badge variant="success" className="bg-green-100 text-green-600 hover:bg-green-100">+7.8%</Badge>
            </div>
            <h3 className="text-2xl font-bold mb-1">${data.netCashflow.toLocaleString()}</h3>
            <p className="text-muted-foreground text-sm">Compared to $9,580 last month</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialOverview;
