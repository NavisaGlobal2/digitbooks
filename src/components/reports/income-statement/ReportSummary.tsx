
import React from "react";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table";
import { formatCurrency } from "@/utils/invoice/formatters";
import { ReportData } from "./hooks/useIncomeStatementData";

interface ReportSummaryProps {
  reportData: ReportData;
}

export const ReportSummary: React.FC<ReportSummaryProps> = ({ reportData }) => {
  return (
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
  );
};
