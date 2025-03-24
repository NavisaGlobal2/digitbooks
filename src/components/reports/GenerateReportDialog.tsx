
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface GenerateReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (reportType: string, reportPeriod: string, fileFormat: string) => void;
}

export const GenerateReportDialog = ({
  open,
  onOpenChange,
  onGenerate,
}: GenerateReportDialogProps) => {
  const [reportType, setReportType] = useState("");
  const [reportPeriod, setReportPeriod] = useState("");
  const [fileFormat, setFileFormat] = useState("pdf");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!reportType) {
      toast.error("Please select a report type");
      return;
    }

    if (!reportPeriod) {
      toast.error("Please select a report period");
      return;
    }

    onGenerate(reportType, reportPeriod, fileFormat);
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setReportType("");
    setReportPeriod("");
    setFileFormat("pdf");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generate Financial Report</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reportType">Report Type</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger id="reportType">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income-statement">Income Statement</SelectItem>
                <SelectItem value="cash-flow">Cash Flow Statement</SelectItem>
                <SelectItem value="expense-summary">Expense Summary</SelectItem>
                <SelectItem value="revenue-summary">Revenue Summary</SelectItem>
                <SelectItem value="budget-analysis">Budget Analysis</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reportPeriod">Report Period</Label>
            <Select value={reportPeriod} onValueChange={setReportPeriod}>
              <SelectTrigger id="reportPeriod">
                <SelectValue placeholder="Select time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current-month">Current Month</SelectItem>
                <SelectItem value="previous-month">Previous Month</SelectItem>
                <SelectItem value="current-quarter">Current Quarter</SelectItem>
                <SelectItem value="previous-quarter">Previous Quarter</SelectItem>
                <SelectItem value="year-to-date">Year to Date</SelectItem>
                <SelectItem value="last-year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>File Format</Label>
            <RadioGroup
              value={fileFormat}
              onValueChange={setFileFormat}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf">PDF</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="excel" id="excel" />
                <Label htmlFor="excel">Excel</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv">CSV</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Generate Report
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
