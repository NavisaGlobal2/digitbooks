
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Upload, FileText } from "lucide-react";
import { useState } from "react";
import { Revenue } from "@/types/revenue";
import { toast } from "sonner";

interface ImportRevenueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRevenuesImported?: (revenues: Omit<Revenue, "id">[]) => void;
}

const ImportRevenueDialog = ({ open, onOpenChange, onRevenuesImported }: ImportRevenueDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleBrowseClick = () => {
    document.getElementById('file-upload')?.click();
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("Please select a file to import");
      return;
    }

    setIsUploading(true);

    try {
      // This would normally process the CSV or Excel file
      // For demo purposes, we'll just simulate importing 5 sample revenues
      setTimeout(() => {
        const sampleRevenues: Omit<Revenue, "id">[] = [
          {
            description: "Product Sale - Premium Package",
            amount: 125000,
            date: new Date(),
            source: "sales",
            paymentMethod: "bank transfer",
            clientName: "Acme Corp",
            notes: "Annual subscription",
            paymentStatus: "paid"
          },
          {
            description: "Consulting Services",
            amount: 85000,
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            source: "consulting",
            paymentMethod: "card",
            clientName: "Tech Innovators Ltd",
            paymentStatus: "paid"
          },
          {
            description: "Workshop Revenue",
            amount: 45000,
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
            source: "services",
            paymentMethod: "cash",
            clientName: "Multiple Clients",
            paymentStatus: "pending"
          },
          {
            description: "Software License",
            amount: 35000,
            date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
            source: "sales",
            paymentMethod: "bank transfer",
            clientName: "Global Systems Inc",
            paymentStatus: "paid"
          },
          {
            description: "Affiliate Commission",
            amount: 12500,
            date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
            source: "affiliate",
            paymentMethod: "bank transfer",
            paymentStatus: "pending"
          }
        ];

        if (onRevenuesImported) {
          onRevenuesImported(sampleRevenues);
        }

        toast.success(`Successfully imported ${sampleRevenues.length} revenue entries`);
        setIsUploading(false);
        onOpenChange(false);
      }, 1500);
    } catch (error) {
      toast.error("Failed to import revenue data");
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Import revenue</DialogTitle>
          <button 
            onClick={() => onOpenChange(false)} 
            className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 focus:outline-none"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>
        
        <div className="py-4">
          <div 
            className={`border-2 border-dashed rounded-md p-8 ${isDragging ? 'border-green-500 bg-green-50' : 'border-gray-200'} flex flex-col items-center justify-center text-center cursor-pointer`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleBrowseClick}
          >
            <FileText className="h-12 w-12 text-gray-400 mb-2" />
            <p className="text-gray-600 mb-1">Drag & drop file here</p>
            <p className="text-gray-500 text-sm mb-2">Or</p>
            <button 
              type="button" 
              className="text-green-500 font-medium text-sm hover:text-green-600 focus:outline-none"
            >
              Browse files
            </button>
            <input
              id="file-upload"
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          
          {file && (
            <div className="mt-4 p-2 bg-gray-50 rounded-md flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm font-medium truncate">{file.name}</span>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
        
        <div className="flex justify-between gap-3 mt-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={!file || isUploading}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white"
          >
            {isUploading ? "Processing..." : "Upload"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportRevenueDialog;
