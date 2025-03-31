
import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { useReportDataLoading } from "../income-statement/hooks/useReportDataLoading";
import { formatReportDates } from "../income-statement/utils/dateFormatters";
import CashflowChart from "@/components/dashboard/CashflowChart";
import { useCashflowData } from "./hooks/useCashflowData";
import { ReportActions } from "../income-statement/ReportActions";

interface CashFlowReportProps {
  onBack: () => void;
  period: string;
  dateRange: { startDate: Date; endDate: Date } | null;
}

const CashFlowReport: React.FC<CashFlowReportProps> = ({ onBack, period, dateRange }) => {
  const { isLoading, setIsLoading } = useReportDataLoading();
  const { cashflowData } = useCashflowData(dateRange);
  const { formattedDate, startDateFormatted, endDateFormatted, reportDuration } = formatReportDates(dateRange);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      <ReportActions 
        onBack={onBack}
        title="Cash Flow"
        period={period}
        dateRange={dateRange}
      />

      <div className="bg-white p-4 sm:p-6 rounded-lg border shadow-sm cash-flow-report-container print-container">
        <div className="text-center mb-6">
          <div className="h-16 w-16 mx-auto text-green-500 mb-2 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/><path d="m16 15-3-3-3 3"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold">Cash Flow Report</h2>
          <p className="text-lg font-medium text-muted-foreground">
            {dateRange 
              ? `${startDateFormatted} — ${endDateFormatted}` 
              : period}
          </p>
          <div className="flex items-center justify-center gap-2 text-muted-foreground mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="3" y2="21"/>
            </svg>
            <p>{formattedDate}</p>
          </div>
          
          {/* Report Timeline */}
          <div className="mt-4 pt-3 border-t">
            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="text-base font-medium">
                Reporting Period: {reportDuration} days
              </span>
            </div>
            
            <div className="mt-3 w-full max-w-md mx-auto px-4">
              <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="absolute left-0 top-0 h-full bg-green-500 rounded-full" style={{ width: '100%' }}></div>
              </div>
              <div className="flex justify-between mt-1 text-xs">
                <span>{startDateFormatted}</span>
                <span>{endDateFormatted}</span>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <>
            {/* Cash Flow Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="p-4 border border-green-100 bg-green-50">
                <h3 className="text-sm font-medium text-muted-foreground">Total Inflow</h3>
                <p className="text-2xl font-bold text-green-600">
                  ₦{cashflowData.reduce((sum, item) => sum + item.inflow, 0).toLocaleString()}
                </p>
              </Card>
              <Card className="p-4 border border-purple-100 bg-purple-50">
                <h3 className="text-sm font-medium text-muted-foreground">Total Outflow</h3>
                <p className="text-2xl font-bold text-purple-600">
                  ₦{cashflowData.reduce((sum, item) => sum + item.outflow, 0).toLocaleString()}
                </p>
              </Card>
              <Card className="p-4 border border-blue-100 bg-blue-50">
                <h3 className="text-sm font-medium text-muted-foreground">Net Cash Flow</h3>
                <p className="text-2xl font-bold text-blue-600">
                  ₦{(cashflowData.reduce((sum, item) => sum + item.inflow - item.outflow, 0)).toLocaleString()}
                </p>
              </Card>
            </div>

            {/* Cash Flow Chart */}
            <div className="h-[320px] mb-6">
              <CashflowChart />
            </div>

            {/* Cash Flow Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-2 border">Month</th>
                    <th className="text-right p-2 border">Cash Inflow</th>
                    <th className="text-right p-2 border">Cash Outflow</th>
                    <th className="text-right p-2 border">Net Cash Flow</th>
                  </tr>
                </thead>
                <tbody>
                  {cashflowData.map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="p-2 border">{item.name}</td>
                      <td className="text-right p-2 border text-green-600">₦{item.inflow.toLocaleString()}</td>
                      <td className="text-right p-2 border text-purple-600">₦{item.outflow.toLocaleString()}</td>
                      <td className="text-right p-2 border font-medium">
                        ₦{(item.inflow - item.outflow).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CashFlowReport;
