
import { FileSpreadsheet } from "lucide-react";

const SupportedFormatsInfo = () => {
  return (
    <div className="bg-muted/30 p-4 rounded-lg">
      <h3 className="text-sm font-medium mb-3">Supported Formats</h3>
      <div className="flex items-start space-x-6">
        <div className="flex items-center space-x-2">
          <FileSpreadsheet className="h-5 w-5 text-green-600" />
          <div>
            <p className="text-sm font-medium">CSV Files</p>
            <p className="text-xs text-muted-foreground">
              Comma-separated values exported from your bank
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportedFormatsInfo;
