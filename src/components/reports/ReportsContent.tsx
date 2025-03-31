
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportsHeader } from "./ReportsHeader";
import { ReportView } from "./ReportView";
import { ReportList } from "./ReportList";
import ReportDateFilter from "./filters/ReportDateFilter";
import ReportHistoryTab from "./saved/ReportHistoryTab";

interface ReportsContentProps {
  selectedReportType: string | null;
  reportPeriod: string;
  dateRange: { startDate: Date; endDate: Date } | null;
  isCustomDateRange: boolean;
  onBack: () => void;
  onSelectReport: (reportType: string) => void;
  onDateRangeChange: (dateRange: { startDate: Date; endDate: Date } | null) => void;
  onGenerateReport: () => void;
}

export const ReportsContent: React.FC<ReportsContentProps> = ({
  selectedReportType,
  reportPeriod,
  dateRange,
  isCustomDateRange,
  onBack,
  onSelectReport,
  onDateRangeChange,
  onGenerateReport
}) => {
  const [activeTab, setActiveTab] = useState("browse");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  if (selectedReportType) {
    return (
      <ReportView
        selectedReportType={selectedReportType}
        reportPeriod={reportPeriod}
        dateRange={dateRange}
        isCustomDateRange={isCustomDateRange}
        onBack={onBack}
      />
    );
  }

  return (
    <div className="space-y-6">
      <ReportsHeader
        onGenerateReport={onGenerateReport}
        onMobileMenuOpen={() => {}}
        showGenerateButton={true}
      />

      <Tabs defaultValue="browse" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="browse">Browse Reports</TabsTrigger>
          <TabsTrigger value="history">Report History</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="browse" className="space-y-6 mt-0">
            <div className="w-full sm:w-auto">
              <ReportDateFilter
                onChange={onDateRangeChange}
                dateRange={dateRange}
              />
            </div>
            
            <ReportList onSelectReport={onSelectReport} />
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <ReportHistoryTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
