
import { useState } from "react";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useExpenses } from "@/contexts/ExpenseContext";
import { ExpenseCategory } from "@/types/expense";

interface BankStatementUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatementProcessed: () => void;
}

const BankStatementUploadDialog = ({
  open,
  onOpenChange,
  onStatementProcessed
}: BankStatementUploadDialogProps) => {
  const { addExpense } = useExpenses();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) {
      toast.error("Please select a bank statement file");
      return;
    }

    setUploading(true);
    
    // Simulate processing bank statement
    setTimeout(() => {
      // Create mock expenses from bank statement
      const sampleCategories: ExpenseCategory[] = ["utilities", "rent", "software", "marketing", "office"];
      const sampleVendors = ["Electric Company", "Office Space Ltd", "Software Solutions Inc", "Facebook Ads", "Office Supplies Co"];
      const samplePaymentMethods = ["bank transfer", "card"] as const;
      
      // Generate 5 sample expenses from statement
      for (let i = 0; i < 5; i++) {
        const randomCategory = sampleCategories[Math.floor(Math.random() * sampleCategories.length)];
        const matchingVendor = sampleVendors[sampleCategories.indexOf(randomCategory)];
        const randomAmount = Math.floor(Math.random() * 100000) + 5000; // Between 5,000 and 105,000
        const randomDaysAgo = Math.floor(Math.random() * 30) + 1; // Between 1 and 30 days ago
        const randomDate = new Date();
        randomDate.setDate(randomDate.getDate() - randomDaysAgo);
        
        addExpense({
          description: `Payment to ${matchingVendor}`,
          amount: randomAmount,
          date: randomDate,
          category: randomCategory,
          status: "pending",
          paymentMethod: samplePaymentMethods[Math.floor(Math.random() * samplePaymentMethods.length)],
          vendor: matchingVendor,
          notes: `Imported from bank statement: ${file.name}`,
          fromStatement: true
        });
      }
      
      setUploading(false);
      onStatementProcessed();
      onOpenChange(false);
      setFile(null);
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="text-xl font-semibold mb-4">
          Upload Bank Statement
        </DialogTitle>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="bank-statement" className="mb-2 block">
              Select statement file
            </Label>
            <div className="mt-1">
              <label className="block w-full">
                <div className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none">
                  {file ? (
                    <div className="text-center">
                      <p className="text-sm text-gray-600">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-2">
                      <Upload className="w-8 h-8 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        Drop your bank statement here or click to browse
                      </span>
                      <span className="text-xs text-gray-400">
                        Supports CSV, PDF, OFX
                      </span>
                    </div>
                  )}
                  <input
                    id="bank-statement"
                    type="file"
                    className="hidden"
                    accept=".csv,.pdf,.ofx"
                    onChange={handleFileChange}
                  />
                </div>
              </label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={!file || uploading}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              {uploading ? "Processing..." : "Upload Statement"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BankStatementUploadDialog;
