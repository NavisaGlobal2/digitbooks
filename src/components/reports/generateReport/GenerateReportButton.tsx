
import React from "react";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { UseFormWatch } from "react-hook-form";
import { ReportFormValues } from "./ReportFormSchema";

interface GenerateReportButtonProps {
  isGenerating: boolean;
  watch: UseFormWatch<ReportFormValues>;
}

export const GenerateReportButton: React.FC<GenerateReportButtonProps> = ({ 
  isGenerating,
  watch 
}) => {
  return (
    <Button 
      type="submit" 
      className="w-full bg-green-500 hover:bg-green-600" 
      disabled={isGenerating || !watch("startDate") || !watch("endDate")}
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
  );
};
