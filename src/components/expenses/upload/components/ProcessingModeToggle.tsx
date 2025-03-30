
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { FileText, FileImage, Brain, CloudUpload } from "lucide-react";
import { useState, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ProcessingModeToggleProps {
  preferredAIProvider: string;
  setPreferredAIProvider: (provider: string) => void;
  useVisionApi: boolean;
  setUseVisionApi: (useVision: boolean) => void;
  storePdfInSupabase: boolean;
  onStorePdfToggle: (value: boolean) => void;
  extractPdfText: boolean;
  onExtractPdfTextToggle: (value: boolean) => void;
  useOcrSpace?: boolean;
  onOcrSpaceToggle?: (value: boolean) => void;
}

const ProcessingModeToggle = ({
  preferredAIProvider,
  setPreferredAIProvider,
  useVisionApi,
  setUseVisionApi,
  storePdfInSupabase,
  onStorePdfToggle,
  extractPdfText,
  onExtractPdfTextToggle,
  useOcrSpace = false,
  onOcrSpaceToggle
}: ProcessingModeToggleProps) => {
  // Local state to handle PDF processing options visibility
  const [showPdfOptions, setShowPdfOptions] = useState(false);

  // Show PDF options when the extract text or OCR options are enabled
  useEffect(() => {
    if (extractPdfText || useOcrSpace) {
      setShowPdfOptions(true);
    }
  }, [extractPdfText, useOcrSpace]);

  // Handle OCR.space toggle if available
  const handleOcrSpaceToggle = (value: boolean) => {
    if (onOcrSpaceToggle) {
      onOcrSpaceToggle(value);
      
      // When enabling OCR.space, auto-enable storing PDF in Supabase
      if (value) {
        onStorePdfToggle(true);
      }
    }
  };

  return (
    <>
      <div className="rounded-md border p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">AI Model for Parsing</span>
          </div>
          <Select
            value={preferredAIProvider}
            onValueChange={setPreferredAIProvider}
          >
            <SelectTrigger className="h-8 w-[130px]">
              <SelectValue placeholder="AI Provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="anthropic">Claude (Better)</SelectItem>
              <SelectItem value="openai">GPT-4o</SelectItem>
              <SelectItem value="deepseek">DeepSeek</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* PDF Processing Options Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileImage className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-medium">PDF Advanced Processing</Label>
          </div>
          <Switch
            checked={showPdfOptions}
            onCheckedChange={setShowPdfOptions}
            aria-label="Show PDF processing options"
          />
        </div>

        {/* PDF Processing Options */}
        {showPdfOptions && (
          <div className="mt-2 pl-6 space-y-2">
            <div className="flex items-center justify-between">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      <Label className="text-xs text-muted-foreground cursor-help">
                        OCR with Google Vision
                      </Label>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-[200px] text-xs">
                      Use Google Vision API for more accurate text extraction from PDF pages
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Switch
                checked={extractPdfText}
                onCheckedChange={onExtractPdfTextToggle}
                aria-label="Extract text from PDF with Google Vision"
                className="scale-90"
              />
            </div>

            {/* OCR.space Option - Now visible and enabled */}
            {onOcrSpaceToggle && (
              <div className="flex items-center justify-between">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center">
                        <Label className="text-xs text-muted-foreground cursor-help">
                          OCR.space PDF Processing
                        </Label>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-[200px] text-xs">
                        Use OCR.space API for advanced PDF text extraction 
                        (requires storing PDF in Supabase)
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Switch
                  checked={useOcrSpace}
                  onCheckedChange={handleOcrSpaceToggle}
                  aria-label="Use OCR.space for PDF processing"
                  className="scale-90"
                />
              </div>
            )}

            {/* Store PDF Option - Always visible in PDF options */}
            <div className="flex items-center justify-between">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      <Label className="text-xs text-muted-foreground cursor-help">
                        Store PDF in Supabase
                      </Label>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-[200px] text-xs">
                      Store the original PDF statement in your Supabase storage for record keeping
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Switch
                checked={storePdfInSupabase || useOcrSpace}
                onCheckedChange={onStorePdfToggle}
                disabled={useOcrSpace}
                aria-label="Store PDF in Supabase"
                className="scale-90"
              />
            </div>
          </div>
        )}

        <Separator />

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-medium">Vision AI for Images</Label>
          </div>
          <Switch
            checked={useVisionApi}
            onCheckedChange={setUseVisionApi}
            aria-label="Enable Vision API"
          />
        </div>
      </div>
    </>
  );
};

export default ProcessingModeToggle;
