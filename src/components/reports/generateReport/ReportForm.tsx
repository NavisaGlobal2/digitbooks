
import React from "react";
import { Form } from "@/components/ui/form";
import { ReportTypeField } from "./ReportTypeField";
import { ReportPeriodField } from "./ReportPeriodField";
import { DateRangeFields } from "./DateRangeFields";
import { FileFormatField } from "./FileFormatField";
import { GenerateReportButton } from "./GenerateReportButton";
import { useReportForm } from "./useReportForm";

interface ReportFormProps {
  onOpenChange: (open: boolean) => void;
  onGenerate?: (
    reportType: string, 
    reportPeriod: string, 
    fileFormat: string,
    dateRange?: { startDate: Date; endDate: Date }
  ) => void;
}

export const ReportForm: React.FC<ReportFormProps> = ({ onOpenChange, onGenerate }) => {
  const { form, isGenerating, handleGenerate } = useReportForm({ onGenerate, onOpenChange });
  const watch = form.watch;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleGenerate)} className="space-y-6 py-4">
        <ReportTypeField form={form} />
        <ReportPeriodField form={form} />
        <DateRangeFields form={form} watch={watch} />
        <FileFormatField form={form} />
        <GenerateReportButton isGenerating={isGenerating} watch={watch} />
      </form>
    </Form>
  );
};
