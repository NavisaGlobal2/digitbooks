
import React, { useState, useEffect, useRef } from "react";
import { useRevenue } from "@/contexts/RevenueContext";
import { useExpenses } from "@/contexts/ExpenseContext";
import { ReportCard } from "./ReportCard";
import { ReportHeader } from "./ReportHeader";
import { ReportTimeline } from "./ReportTimeline";
import { ReportSummary } from "./ReportSummary";
import { ReportFooter } from "./ReportFooter";
import { ReportActions } from "./ReportActions";
import { formatReportDates } from "./utils/dateFormatters";
import { calculateFinancialMetrics } from "./utils/financialCalculations";
import { useReportDataLoading } from "./hooks/useReportDataLoading";

interface IncomeStatementReportProps {
  onBack: () => void;
  period: string;
  dateRange: { startDate: Date; endDate: Date } | null;
  onDirectGeneration?: () => void;
}

const IncomeStatementReport = ({ onBack, period, dateRange, onDirectGeneration }: IncomeStatementReportProps) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [localDateRange, setLocalDateRange] = useState<{ startDate: Date; endDate: Date } | null>(dateRange);
  const { isLoading, setIsLoading } = useReportDataLoading();
  const [reportData, setReportData] = useState<any>(null);
  const { revenues, getTotalRevenue, getRevenueBySource, getRevenueByPeriod } = useRevenue();
  const { getTotalExpenses, getExpensesByCategory } = useExpenses();
  
  // Format the date information using the utility function
  const {
    formattedDate,
    startDateFormatted,
    endDateFormatted,
    reportDuration
  } = formatReportDates(localDateRange);

  // Load report data
  useEffect(() => {
    const timer = setTimeout(() => {
      // Extract revenue data based on date range if available
      let filteredRevenues = revenues;
      let totalRevenue = 0;
      let revenueBySource = {};
      
      if (localDateRange) {
        filteredRevenues = getRevenueByPeriod(localDateRange.startDate, localDateRange.endDate);
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
      
      // Get expense data
      const totalExpenses = getTotalExpenses();
      const expensesByCategory = getExpensesByCategory();
      
      // Calculate financial metrics
      const { grossProfit, netProfit, profitMargin } = calculateFinancialMetrics(
        totalRevenue, 
        totalExpenses
      );
      
      // Set the report data state
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
  }, [revenues, getTotalRevenue, getRevenueBySource, getTotalExpenses, getExpensesByCategory, localDateRange, getRevenueByPeriod, setIsLoading]);
  
  useEffect(() => {
    if (dateRange && !localDateRange) {
      setLocalDateRange(dateRange);
    }
  }, [dateRange]);

  const handleDateRangeChange = (newRange: { startDate: Date; endDate: Date } | null) => {
    setLocalDateRange(newRange);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <ReportActions
          onBack={onBack}
          title="Income Statement"
          period={period}
          dateRange={localDateRange}
          reportRef={reportRef}
          onDateRangeChange={handleDateRangeChange}
        />
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
        dateRange={localDateRange}
        reportRef={reportRef}
        reportData={reportData}
        onDirectGeneration={onDirectGeneration}
        onDateRangeChange={handleDateRangeChange}
      />

      <ReportCard ref={reportRef} id="report-container">
        <ReportHeader 
          title="Income Statement" 
          period={period}
          formattedDate={formattedDate}
        />
        
        {localDateRange && (
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
      </ReportCard>
    </div>
  );
};

export default IncomeStatementReport;
