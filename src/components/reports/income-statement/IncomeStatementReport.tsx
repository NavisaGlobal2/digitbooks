
import React, { useState, useEffect, useRef } from "react";
import { useRevenue } from "@/contexts/RevenueContext";
import { useExpenses } from "@/contexts/ExpenseContext";
import { ReportCard } from "./ReportCard";
import { ReportHeader } from "./ReportHeader";
import { ReportTimeline } from "./ReportTimeline";
import { ReportSummary } from "./ReportSummary";
import { ReportFooter } from "./ReportFooter";
import { ReportActions } from "./ReportActions";
import { useIncomeStatementData } from "./hooks/useIncomeStatementData";

interface IncomeStatementReportProps {
  onBack: () => void;
  period: string;
  dateRange: { startDate: Date; endDate: Date } | null;
  onDirectGeneration?: () => void;
}

const IncomeStatementReport = ({ onBack, period, dateRange, onDirectGeneration }: IncomeStatementReportProps) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [localDateRange, setLocalDateRange] = useState<{ startDate: Date; endDate: Date } | null>(dateRange);
  
  const { isLoading, reportData, formattedDate, startDateFormatted, endDateFormatted, reportDuration } = 
    useIncomeStatementData(localDateRange || dateRange);
  
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
