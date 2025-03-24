
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
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
            notes: "Annual subscription"
          },
          {
            description: "Consulting Services",
            amount: 85000,
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            source: "consulting",
            paymentMethod: "card",
            clientName: "Tech Innovators Ltd"
          },
          {
            description: "Workshop Revenue",
            amount: 45000,
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
            source: "services",
            paymentMethod: "cash",
            clientName: "Multiple Clients"
          },
          {
            description: "Software License",
            amount: 35000,
            date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
            source: "sales",
            paymentMethod: "bank transfer",
            clientName: "Global Systems Inc"
          },
          {
            description: "Affiliate Commission",
            amount: 12500,
            date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
            source: "affiliate",
            paymentMethod: "bank transfer"
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
          <DialogTitle>Import Revenue Data</DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file with your revenue data. The file should include columns for description, amount, date, source, and payment method.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="file-upload" className="text-sm font-medium">
              Upload File (CSV or Excel)
            </label>
            <Input 
              id="file-upload" 
              type="file" 
              accept=".csv,.xlsx,.xls" 
              onChange={handleFileChange}
            />
            <p className="text-xs text-muted-foreground">
              Supported formats: CSV, Excel (.xlsx, .xls)
            </p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Download Template</p>
            <Button variant="outline" size="sm" className="w-full">
              Download CSV Template
            </Button>
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={!file || isUploading}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            {isUploading ? "Processing..." : "Import"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportRevenueDialog;
