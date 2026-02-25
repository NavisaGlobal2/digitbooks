import { useEffect, useState } from "react";
import { useInvoices, useExpenses, useRevenues } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";

const FinancialSummaryCard = () => {
  const { fetchInvoices } = useInvoices();
  const { fetchExpenses } = useExpenses();
  const { fetchRevenues } = useRevenues();

  const [data, setData] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netIncome: 0,
    invoiceCount: 0,
    loading: true,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [invoices, expenses, revenues] = await Promise.all([
          fetchInvoices(),
          fetchExpenses(),
          fetchRevenues(),
        ]);

        const totalRevenue = revenues?.reduce((sum, r) => sum + r.amount, 0) || 0;
        const totalExpenses = expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;

        setData({
          totalRevenue,
          totalExpenses,
          netIncome: totalRevenue - totalExpenses,
          invoiceCount: invoices?.length || 0,
          loading: false,
        });
      } catch {
        setData(prev => ({ ...prev, loading: false }));
      }
    };
    load();
  }, []);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  if (data.loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Financial Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading financial data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Financial Summary
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            For visa application reference
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-3">
          This summary is generated from your DigitBooks financial records. Use it as a reference when preparing financial documents for your visa application.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
              <p className="text-sm font-semibold text-green-700">{formatCurrency(data.totalRevenue)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-red-50">
            <TrendingDown className="h-4 w-4 text-red-600" />
            <div>
              <p className="text-xs text-muted-foreground">Total Expenses</p>
              <p className="text-sm font-semibold text-red-700">{formatCurrency(data.totalExpenses)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50">
            <DollarSign className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-xs text-muted-foreground">Net Income</p>
              <p className="text-sm font-semibold text-blue-700">{formatCurrency(data.netIncome)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-50">
            <BarChart3 className="h-4 w-4 text-purple-600" />
            <div>
              <p className="text-xs text-muted-foreground">Total Invoices</p>
              <p className="text-sm font-semibold text-purple-700">{data.invoiceCount}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialSummaryCard;
