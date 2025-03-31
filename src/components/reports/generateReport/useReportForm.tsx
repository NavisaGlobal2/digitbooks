
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { 
  format, 
  addDays, 
  startOfMonth, 
  endOfMonth, 
  startOfYear, 
  endOfYear, 
  subMonths, 
  subYears 
} from "date-fns";
import { formSchema, ReportFormValues } from "./ReportFormSchema";

interface UseReportFormProps {
  onGenerate?: (
    reportType: string, 
    reportPeriod: string, 
    fileFormat: string,
    dateRange?: { startDate: Date; endDate: Date }
  ) => void;
  onOpenChange: (open: boolean) => void;
}

export const useReportForm = ({ onGenerate, onOpenChange }: UseReportFormProps) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reportType: "income-statement",
      reportPeriod: "current-month",
      fileFormat: "pdf",
    },
  });

  const selectedReportPeriod = form.watch("reportPeriod");
  
  // Auto-set date range based on selected period
  useEffect(() => {
    if (selectedReportPeriod && selectedReportPeriod !== "custom-range") {
      const today = new Date();
      let start: Date;
      let end: Date;
      
      switch (selectedReportPeriod) {
        case "current-month":
          start = startOfMonth(today);
          end = endOfMonth(today);
          break;
        case "last-month":
          const lastMonth = subMonths(today, 1);
          start = startOfMonth(lastMonth);
          end = endOfMonth(lastMonth);
          break;
        case "current-quarter":
          const quarterMonth = Math.floor(today.getMonth() / 3) * 3;
          start = new Date(today.getFullYear(), quarterMonth, 1);
          end = new Date(today.getFullYear(), quarterMonth + 3, 0);
          break;
        case "year-to-date":
          start = startOfYear(today);
          end = today;
          break;
        case "last-year":
          const lastYear = subYears(today, 1);
          start = startOfYear(lastYear);
          end = endOfYear(lastYear);
          break;
        default:
          start = startOfMonth(today);
          end = endOfMonth(today);
      }
      
      form.setValue("startDate", start);
      form.setValue("endDate", end);
    }
  }, [selectedReportPeriod, form]);

  const handleGenerate = (values: ReportFormValues) => {
    setIsGenerating(true);
    
    if (onGenerate) {
      const dateRange = values.startDate && values.endDate 
        ? { startDate: values.startDate, endDate: values.endDate }
        : undefined;
      
      onGenerate(
        values.reportType, 
        values.reportPeriod, 
        values.fileFormat, 
        dateRange
      );
    }
    
    setTimeout(() => {
      setIsGenerating(false);
      onOpenChange(false);
    }, 1000);
  };

  return {
    form,
    isGenerating,
    handleGenerate
  };
};
