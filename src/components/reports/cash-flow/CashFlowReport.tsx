
import React, { useState, useEffect } from "react";
import { ArrowLeft, Download, BarChart3, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { format } from "date-fns";
import { generateReportPdf } from "@/utils/reports/reportPdfGenerator";
import { useReportDataLoading } from "../income-statement/hooks/useReportDataLoading";
import { formatReportDates } from "../income-statement/utils/dateFormatters";
import CashflowChart from "@/components/dashboard/CashflowChart";
import { useCashflowData } from "./hooks/useCashflowData";

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

  const handleDownload = async () => {
    try {
      toast.loading("Generating report...");
      
      // Allow time for rendering before capturing
      setTimeout(async () => {
        await generateReportPdf({
          title: "Cash Flow",
          period: dateRange 
            ? `${startDateFormatted} — ${endDateFormatted}` 
            : period,
          dateRange: dateRange || undefined,
          cashflowData
        });
        toast.dismiss();
        toast.success("Cash flow report downloaded successfully!");
      }, 100);
    } catch (error) {
      console.error("Error generating report:", error);
      toast.dismiss();
      toast.error("Failed to generate report");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col xs:flex-row items-center justify-between gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-1 w-full xs:w-auto"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Reports
        </Button>
        <Button
          className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2 w-full xs:w-auto"
          onClick={handleDownload}
        >
          <Download className="h-4 w-4" />
          Download Report
        </Button>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-lg border shadow-sm cash-flow-report-container print-container">
        <div className="text-center mb-6">
          <BarChart3 className="h-16 w-16 mx-auto text-green-500 mb-2" />
          <h2 className="text-2xl font-bold">Cash Flow Report</h2>
          <p className="text-lg font-medium text-muted-foreground">
            {dateRange 
              ? `${startDateFormatted} — ${endDateFormatted}` 
              : period}
          </p>
          <div className="flex items-center justify-center gap-2 text-muted-foreground mt-1">
            <Calendar className="h-4 w-4" />
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
