
import React from "react";
import { ReportActions } from "../income-statement/ReportActions";
import CashflowChart from "@/components/dashboard/CashflowChart";
import { Card, CardContent } from "@/components/ui/card";

interface CashFlowReportProps {
  onBack: () => void;
  period: string;
  dateRange: { startDate: Date; endDate: Date } | null;
}

const CashFlowReport: React.FC<CashFlowReportProps> = ({ 
  onBack, 
  period, 
  dateRange 
}) => {
  return (
    <div className="space-y-4 print:p-6">
      <ReportActions 
        onBack={onBack}
        title="Cash Flow"
        period={period}
        dateRange={dateRange}
      />

      <div id="report-container" className="space-y-6 print:space-y-8">
        <h2 className="text-2xl font-bold text-center print:text-3xl">
          Cash Flow Report
        </h2>
        
        <p className="text-center text-muted-foreground">
          {period}
        </p>

        <Card className="border shadow-sm">
          <CardContent className="p-4 pt-4">
            <div className="h-[400px]">
              <CashflowChart />
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 space-y-4">
          <h3 className="text-xl font-semibold">Cash Flow Summary</h3>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="p-4 border shadow-sm">
              <h4 className="text-sm font-medium text-muted-foreground">Total Inflow</h4>
              <p className="text-2xl font-bold text-green-600">₦18,450,000</p>
            </Card>
            
            <Card className="p-4 border shadow-sm">
              <h4 className="text-sm font-medium text-muted-foreground">Total Outflow</h4>
              <p className="text-2xl font-bold text-purple-600">₦12,300,000</p>
            </Card>
          </div>

          <Card className="p-4 border shadow-sm">
            <h4 className="text-sm font-medium text-muted-foreground">Net Cash Flow</h4>
            <p className="text-2xl font-bold text-blue-600">₦6,150,000</p>
            <p className="text-sm text-muted-foreground mt-1">Positive cash flow of ₦6,150,000</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CashFlowReport;
