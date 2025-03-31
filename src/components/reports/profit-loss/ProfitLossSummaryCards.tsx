
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface ProfitLossSummaryCardsProps {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  formatCurrency: (value: number) => string;
}

const ProfitLossSummaryCards: React.FC<ProfitLossSummaryCardsProps> = ({
  totalRevenue,
  totalExpenses,
  netProfit,
  profitMargin,
  formatCurrency
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border-none shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col">
            <span className="text-muted-foreground">Total Revenue</span>
            <span className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</span>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-none shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col">
            <span className="text-muted-foreground">Total Expenses</span>
            <span className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</span>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-none shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col">
            <span className="text-muted-foreground">Net Profit</span>
            <span className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(netProfit)}
            </span>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-none shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col">
            <span className="text-muted-foreground">Profit Margin</span>
            <span className={`text-2xl font-bold ${profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {profitMargin.toFixed(1)}%
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfitLossSummaryCards;
