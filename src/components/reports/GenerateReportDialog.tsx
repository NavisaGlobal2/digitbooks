
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ReportForm } from "./generateReport/ReportForm";

interface GenerateReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate?: (
    reportType: string, 
    reportPeriod: string, 
    fileFormat: string,
    dateRange?: { startDate: Date; endDate: Date }
  ) => void;
}

export const GenerateReportDialog: React.FC<GenerateReportDialogProps> = ({
  open,
  onOpenChange,
  onGenerate
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Generate Financial Report</DialogTitle>
        </DialogHeader>
        
        <ReportForm onOpenChange={onOpenChange} onGenerate={onGenerate} />
      </DialogContent>
    </Dialog>
  );
};
