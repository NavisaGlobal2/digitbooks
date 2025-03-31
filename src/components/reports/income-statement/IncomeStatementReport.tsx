
import React, { useState, useEffect } from "react";
import { useRevenue } from "@/contexts/RevenueContext";
import { useExpenses } from "@/contexts/ExpenseContext";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { format } from "date-fns";
import { ReportCard } from "./ReportCard";
import { ReportHeader } from "./ReportHeader";
import { ReportTimeline } from "./ReportTimeline";
import { ReportSummary } from "./ReportSummary";
import { ReportFooter } from "./ReportFooter";
import { ReportActions } from "./ReportActions";
import { formatCurrency } from "@/utils/invoice/formatters";
import { useIncomeStatementData } from "./hooks/useIncomeStatementData";

interface IncomeStatementReportProps {
  onBack: () => void;
  period: string;
  dateRange: { startDate: Date; endDate: Date } | null;
}

const IncomeStatementReport = ({ onBack, period, dateRange }: IncomeStatementReportProps) => {
  const { revenues, getTotalRevenue, getRevenueBySource, getRevenueByPeriod } = useRevenue();
  const { getTotalExpenses, getExpensesByCategory } = useExpenses();
  
  const { isLoading, reportData, formattedDate, startDateFormatted, endDateFormatted, reportDuration } = 
    useIncomeStatementData(revenues, getTotalRevenue, getRevenueBySource, getRevenueByPeriod, getTotalExpenses, getExpensesByCategory, dateRange);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col xs:flex-row items-center justify-between gap-3">
          <Button variant="outline" onClick={onBack} className="w-full xs:w-auto">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
        </div>
        <ReportCard isLoading={true} />
      </div>
    );
  }

  if (!reportData) {
    return <div>Error loading report data</div>;
  }

  return (
    <div className="space-y-4 print:p-6">
      <ReportActions 
        onBack={onBack}
        title="Income Statement"
        period={period}
        dateRange={dateRange}
      />

      <ReportCard>
        <div className="income-statement-report-container">
          <ReportHeader 
            title="Income Statement" 
            period={period}
            formattedDate={formattedDate}
          />
          
          {dateRange && (
            <ReportTimeline 
              startDateFormatted={startDateFormatted}
              endDateFormatted={endDateFormatted}
              reportDuration={reportDuration}
            />
          )}

          <div className="my-6 border-y py-4 bg-gray-50 rounded">
            <h3 className="text-center text-lg font-medium">Financial Summary for Period: {startDateFormatted} - {endDateFormatted}</h3>
          </div>

          <ReportSummary reportData={reportData} />
          
          <ReportFooter 
            formattedDate={formattedDate} 
            startDateFormatted={startDateFormatted} 
            endDateFormatted={endDateFormatted} 
          />
        </div>
      </ReportCard>
    </div>
  );
};

export default IncomeStatementReport;
