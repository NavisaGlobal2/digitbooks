
import { Button } from "@/components/ui/button";

interface UploadDialogFooterProps {
  onCancel: () => void;
  onParse: () => void;
  uploading: boolean;
  disabled: boolean;
  showCancelButton?: boolean;
  file?: File | null; // Making file optional to fix the TypeScript error
}

const UploadDialogFooter = ({ 
  onCancel, 
  onParse, 
  uploading, 
  disabled,
  showCancelButton = false
}: UploadDialogFooterProps) => {
  return (
    <div className="flex justify-end space-x-2 pt-2">
      <Button 
        variant="outline" 
        onClick={onCancel}
      >
        {showCancelButton ? "Cancel Upload" : "Cancel"}
      </Button>
      <Button 
        onClick={onParse} 
        disabled={disabled || uploading}
        className="bg-green-500 hover:bg-green-600 text-white"
      >
        {uploading ? "Processing..." : "Parse Statement"}
      </Button>
    </div>
  );
};

export default UploadDialogFooter;
