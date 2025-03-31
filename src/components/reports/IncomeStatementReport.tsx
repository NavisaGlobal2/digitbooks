import React, { useState, useEffect } from "react";
import { useRevenue } from "@/contexts/RevenueContext";
import { useExpenses } from "@/contexts/ExpenseContext";
import { Card } from "@/components/ui/card";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Printer, Download, ChevronLeft, Calendar, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/utils/invoice/formatters";
import { format } from "date-fns";

interface IncomeStatementReportProps {
  onBack: () => void;
  period: string;
  dateRange: { startDate: Date; endDate: Date } | null;
}

const IncomeStatementReport = ({ onBack, period, dateRange }: IncomeStatementReportProps) => {
  const { revenues, getTotalRevenue, getRevenueBySource, getRevenueByPeriod } = useRevenue();
  const { getTotalExpenses, getExpensesByCategory } = useExpenses();
  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState<{
    totalRevenue: number;
    revenueBySource: Record<string, number>;
    totalExpenses: number;
    expensesByCategory: Record<string, number>;
    grossProfit: number;
    netProfit: number;
    profitMargin: number;
  } | null>(null);

  const today = new Date();
  const formattedDate = format(today, "MMMM dd, yyyy");
  
  const startDateFormatted = dateRange ? format(dateRange.startDate, "MMM dd, yyyy") : "";
  const endDateFormatted = dateRange ? format(dateRange.endDate, "MMM dd, yyyy") : "";
  const reportDuration = dateRange ? 
    Math.ceil((dateRange.endDate.getTime() - dateRange.startDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const reportProgress = 100;

  useEffect(() => {
    const timer = setTimeout(() => {
      let filteredRevenues = revenues;
      let totalRevenue = 0;
      let revenueBySource = {};
      
      if (dateRange) {
        filteredRevenues = getRevenueByPeriod(dateRange.startDate, dateRange.endDate);
        totalRevenue = filteredRevenues.reduce((total, revenue) => total + revenue.amount, 0);
        
        revenueBySource = filteredRevenues.reduce((acc, revenue) => {
          const source = revenue.source;
          if (!acc[source]) {
            acc[source] = 0;
          }
          acc[source] += revenue.amount;
          return acc;
        }, {} as Record<string, number>);
      } else {
        totalRevenue = getTotalRevenue();
        revenueBySource = getRevenueBySource();
      }
      
      const totalExpenses = getTotalExpenses();
      const expensesByCategory = getExpensesByCategory();
      
      const grossProfit = totalRevenue - totalExpenses;
      const netProfit = grossProfit;
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
      
      setReportData({
        totalRevenue,
        revenueBySource,
        totalExpenses,
        expensesByCategory,
        grossProfit,
        netProfit,
        profitMargin
      });
      
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [revenues, getTotalRevenue, getRevenueBySource, getTotalExpenses, getExpensesByCategory, dateRange, getRevenueByPeriod]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    alert("Download functionality would be implemented here");
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col xs:flex-row items-center justify-between gap-3">
          <Button variant="outline" onClick={onBack} className="w-full xs:w-auto">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
          <Skeleton className="h-10 w-full xs:w-[200px]" />
        </div>
        <Card className="p-6">
          <Skeleton className="h-8 w-1/3 mb-6" />
          <Skeleton className="h-6 w-full mb-4" />
          <div className="space-y-2">
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (!reportData) {
    return <div>Error loading report data</div>;
  }

  return (
    <div className="space-y-4 print:p-6">
      <div className="flex flex-col xs:flex-row items-center justify-between gap-3 print:hidden">
        <Button variant="outline" onClick={onBack} className="w-full xs:w-auto">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Reports
        </Button>
        <div className="flex gap-2 w-full xs:w-auto">
          <Button variant="outline" onClick={handlePrint} className="flex-1 xs:flex-none">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button onClick={handleDownload} className="bg-green-500 hover:bg-green-600 text-white flex-1 xs:flex-none">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="text-center mb-6 print:mb-8">
          <h2 className="text-2xl font-bold">Income Statement</h2>
          <p className="text-muted-foreground">{period}</p>
          <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm mt-1">
            <Calendar className="h-4 w-4" />
            <p>Generated on {formattedDate}</p>
          </div>
          
          {dateRange && (
            <div className="mt-4 pt-3 border-t">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 text-green-500" />
                <span>Reporting Period ({reportDuration} days):</span>
                <span className="font-semibold text-gray-700">{startDateFormatted} — {endDateFormatted}</span>
              </div>
              
              <div className="mt-3 w-full max-w-md mx-auto px-4">
                <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="absolute left-0 top-0 h-full bg-green-500 rounded-full" 
                    style={{ width: `${reportProgress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1 text-xs">
                  <span>{startDateFormatted}</span>
                  <span>{endDateFormatted}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <Table className="mb-8">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60%]">Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="font-medium">
              <TableCell>Revenue</TableCell>
              <TableCell className="text-right">{formatCurrency(reportData.totalRevenue)}</TableCell>
            </TableRow>
            
            {Object.entries(reportData.revenueBySource).map(([source, amount]) => (
              <TableRow key={`revenue-${source}`} className="text-sm text-muted-foreground">
                <TableCell className="pl-8">- {source}</TableCell>
                <TableCell className="text-right">{formatCurrency(amount)}</TableCell>
              </TableRow>
            ))}
            
            <TableRow className="border-t-2">
              <TableCell className="font-medium">Expenses</TableCell>
              <TableCell className="text-right text-red-500">
                ({formatCurrency(reportData.totalExpenses)})
              </TableCell>
            </TableRow>
            
            {Object.entries(reportData.expensesByCategory).map(([category, amount]) => (
              <TableRow key={`expense-${category}`} className="text-sm text-muted-foreground">
                <TableCell className="pl-8">- {category}</TableCell>
                <TableCell className="text-right text-red-500">
                  ({formatCurrency(amount)})
                </TableCell>
              </TableRow>
            ))}
            
            <TableRow className="border-t-2">
              <TableCell className="font-medium">Gross Profit</TableCell>
              <TableCell className={`text-right font-medium ${reportData.grossProfit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {formatCurrency(reportData.grossProfit)}
              </TableCell>
            </TableRow>
            
            <TableRow className="border-t-2 text-lg font-bold">
              <TableCell>Net Profit</TableCell>
              <TableCell className={`text-right ${reportData.netProfit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {formatCurrency(reportData.netProfit)}
              </TableCell>
            </TableRow>
            
            <TableRow className="text-sm">
              <TableCell>Profit Margin</TableCell>
              <TableCell className={`text-right ${reportData.profitMargin >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {reportData.profitMargin.toFixed(2)}%
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        
        <div className="text-sm text-muted-foreground">
          <p>This report is generated based on the revenue and expense data recorded in the system.</p>
          <p>Generated on {formattedDate} | Reporting period: {startDateFormatted} - {endDateFormatted}</p>
        </div>
      </Card>
    </div>
  );
};

export default IncomeStatementReport;
