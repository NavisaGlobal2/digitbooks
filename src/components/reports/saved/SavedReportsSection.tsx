
import React, { useState, useEffect } from "react";
import { fetchUserReports, deleteReport, SavedReport } from "@/services/reportService";
import { Button } from "@/components/ui/button";
import { FileText, Trash2, Download, Calendar } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { generateReportPdf } from "@/utils/reports/reportPdfGenerator";

const SavedReportsSection = () => {
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    setLoading(true);
    const reports = await fetchUserReports();
    setSavedReports(reports);
    setLoading(false);
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleDeleteReport = async (id: string) => {
    if (confirm("Are you sure you want to delete this report?")) {
      const success = await deleteReport(id);
      if (success) {
        setSavedReports((prevReports) => 
          prevReports.filter((report) => report.id !== id)
        );
      }
    }
  };

  const handleDownloadReport = (report: SavedReport) => {
    try {
      const dateRange = report.start_date && report.end_date 
        ? { startDate: report.start_date, endDate: report.end_date } 
        : null;
        
      generateReportPdf({
        title: report.report_title,
        period: report.report_period,
        dateRange,
        reportData: report.report_data
      });
    } catch (error) {
      console.error("Error downloading report:", error);
      toast.error("Failed to download report");
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin h-6 w-6 border-t-2 border-b-2 border-green-500 rounded-full mx-auto"></div>
        <p className="mt-2 text-sm text-gray-500">Loading saved reports...</p>
      </div>
    );
  }

  if (savedReports.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-medium">No Saved Reports</h3>
        <p className="text-muted-foreground mb-4">Generate and download reports to save them here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Saved Reports</h3>
      <div className="grid gap-4">
        {savedReports.map((report) => (
          <div 
            key={report.id} 
            className="p-4 border rounded-lg bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-500" />
                <h4 className="font-medium">{report.report_title}</h4>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                  {report.file_format.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{report.report_period}</p>
              <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                <Calendar className="h-3 w-3" />
                <span>Generated: {format(new Date(report.created_at), "MMM d, yyyy")}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-2 sm:mt-0">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleDownloadReport(report)}
              >
                <Download className="h-4 w-4 mr-1" />
                <span>Download</span>
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="border-red-200 hover:bg-red-50 text-red-600"
                onClick={() => handleDeleteReport(report.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedReportsSection;
