
import React from "react";
import { ArrowLeft, BarChart3, Download, FileText, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";

interface GenericReportViewProps {
  reportType: string;
  onBack: () => void;
}

const GenericReportView = ({ reportType, onBack }: GenericReportViewProps) => {
  const today = new Date();
  const formattedDate = format(today, "MMMM dd, yyyy");

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
          onClick={() => {
            toast.success("Report downloaded successfully!");
          }}
        >
          <Download className="h-4 w-4" />
          Download Report
        </Button>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-lg border shadow-sm">
        <div className="text-center mb-6 sm:mb-8">
          <BarChart3 className="h-16 sm:h-24 w-16 sm:w-24 mx-auto text-green-500 mb-2" />
          <h2 className="text-xl sm:text-2xl font-bold">
            {reportType.charAt(0).toUpperCase() + reportType.slice(1).replace("-", " ")}{" "}
            Report
          </h2>
          <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm sm:text-base mt-1">
            <Calendar className="h-4 w-4" />
            <p>{formattedDate}</p>
          </div>
        </div>

        <div className="bg-gray-100 rounded-lg p-4 sm:p-12 flex items-center justify-center">
          <div className="text-center">
            <FileText className="h-12 sm:h-16 w-12 sm:w-16 mx-auto text-gray-400 mb-4" />
            <p className="text-muted-foreground text-sm">
              Preview of the report would be displayed here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenericReportView;
