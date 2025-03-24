import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useRevenue } from "@/contexts/RevenueContext";
import { toast } from "sonner";
import { Revenue } from "@/types/revenue";

interface ImportRevenueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ImportRevenueDialog = ({ open, onOpenChange }: ImportRevenueDialogProps) => {
  const { importRevenues } = useRevenue();
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const processFile = async (file: File) => {
    try {
      const text = await file.text();
      const rows = text.split('\n');
      const headers = rows[0].split(',');
      
      const revenues = rows.slice(1)
        .filter(row => row.trim())
        .map(row => {
          const values = row.split(',');
          const revenue: Partial<Revenue> = {};
          
          headers.forEach((header, index) => {
            const value = values[index]?.trim();
            switch (header.trim().toLowerCase()) {
              case 'source':
                revenue.source = value as any;
                break;
              case 'description':
                revenue.description = value;
                break;
              case 'amount':
                revenue.amount = parseFloat(value);
                break;
              case 'date':
                revenue.date = new Date(value);
                break;
              case 'status':
                revenue.status = value as any;
                break;
            }
          });
          
          return revenue as Omit<Revenue, 'id' | 'revenueNumber'>;
        });

      importRevenues(revenues);
      toast.success(`Successfully imported ${revenues.length} revenues`);
      onOpenChange(false);
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Failed to process file. Please check the format and try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import Revenue</DialogTitle>
        </DialogHeader>
        
        <div
          className={`mt-4 border-2 border-dashed rounded-lg p-8 text-center ${
            isDragging ? 'border-green-500 bg-green-50' : 'border-gray-300'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Drag and drop your CSV file here, or click to browse
          </p>
          <input
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileSelect}
            id="file-upload"
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById('file-upload')?.click()}
            className="mt-4"
          >
            Browse Files
          </Button>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          <p>File format requirements:</p>
          <ul className="list-disc list-inside mt-2">
            <li>CSV format only</li>
            <li>Required columns: source, description, amount, date, status</li>
            <li>First row must be column headers</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
};