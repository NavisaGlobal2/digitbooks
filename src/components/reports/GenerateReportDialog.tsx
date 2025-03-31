
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, addDays, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, subYears } from "date-fns";
import * as z from "zod";
import { CalendarIcon, FileText, Info } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

const formSchema = z.object({
  reportType: z.string({
    required_error: "Please select a report type",
  }),
  reportPeriod: z.string({
    required_error: "Please select a report period",
  }),
  fileFormat: z.string({
    required_error: "Please select a file format",
  }),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

export const GenerateReportDialog = ({ 
  open, 
  onOpenChange, 
  onGenerate 
}: GenerateReportDialogProps) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reportType: "income-statement",
      reportPeriod: "current-month",
      fileFormat: "pdf",
    },
  });

  const selectedReportPeriod = form.watch("reportPeriod");
  const showCustomDateRange = selectedReportPeriod === "custom-range";
  
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

  const handleGenerate = (values: z.infer<typeof formSchema>) => {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generate Financial Report</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleGenerate)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="reportType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Report Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a report type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="income-statement">Income Statement</SelectItem>
                      <SelectItem value="cash-flow">Cash Flow Statement</SelectItem>
                      <SelectItem value="expense-summary">Expense Summary</SelectItem>
                      <SelectItem value="revenue-summary">Revenue Summary</SelectItem>
                      <SelectItem value="budget-analysis">Budget Analysis</SelectItem>
                      <SelectItem value="profit-loss">Profit & Loss</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="reportPeriod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    Time Period
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Select a predefined period or choose "Custom Range" to specify exact dates</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a time period" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="current-month">Current Month</SelectItem>
                      <SelectItem value="last-month">Last Month</SelectItem>
                      <SelectItem value="current-quarter">Current Quarter</SelectItem>
                      <SelectItem value="year-to-date">Year To Date</SelectItem>
                      <SelectItem value="last-year">Last Year</SelectItem>
                      <SelectItem value="custom-range">Custom Date Range</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            
            <div className="space-y-4 border rounded-md p-4 bg-slate-50">
              <div className="text-sm font-medium">Report Date Range</div>
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-xs mb-1">Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              size="sm"
                              className={cn(
                                "w-full pl-3 text-left font-normal text-xs",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "MMM dd, yyyy")
                              ) : (
                                <span>Select date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-xs mb-1">End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              size="sm"
                              className={cn(
                                "w-full pl-3 text-left font-normal text-xs",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "MMM dd, yyyy")
                              ) : (
                                <span>Select date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            className="pointer-events-auto"
                            disabled={(date) => {
                              const startDate = form.getValues("startDate");
                              return startDate ? date < startDate : false;
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="text-xs text-muted-foreground italic">
                {!showCustomDateRange && "Date range automatically set based on selected period"}
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="fileFormat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>File Format</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a file format" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                      <SelectItem value="csv">CSV File</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full bg-green-500 hover:bg-green-600" 
              disabled={isGenerating || !form.watch("startDate") || !form.watch("endDate")}
            >
              {isGenerating ? (
                <>
                  <span className="animate-spin mr-2">
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <circle 
                        className="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="4"
                        fill="none"
                      />
                      <path 
                        className="opacity-75" 
                        fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  </span>
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
