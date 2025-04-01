
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Check, AlertCircle } from "lucide-react";
import { ParsedTransaction } from "./parsers/types";
import { Badge } from "@/components/ui/badge";
import TransactionTable from "./TransactionTable";
import { formatCurrency } from "@/utils/invoice/formatters";
import { toast } from "sonner";
import { RevenueSource } from "@/types/revenue";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RevenueTaggingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactions: ParsedTransaction[];
  onTaggingComplete: (transactions: ParsedTransaction[]) => void;
  fileName?: string;
}

const RevenueTaggingDialog = ({ 
  open, 
  onOpenChange,
  transactions,
  onTaggingComplete,
  fileName = "unknown"
}: RevenueTaggingDialogProps) => {
  const [localTransactions, setLocalTransactions] = useState<ParsedTransaction[]>([]);
  const [selectAll, setSelectAll] = useState(true);
  const [bulkSource, setBulkSource] = useState<RevenueSource | "">("");
  
  // Count of selected transactions
  const selectedCount = localTransactions.filter(t => t.selected).length;
  
  // Total amount of selected transactions
  const totalSelectedAmount = localTransactions
    .filter(t => t.selected)
    .reduce((sum, t) => sum + t.amount, 0);
    
  // Count of transactions with no source
  const noSourceCount = localTransactions
    .filter(t => t.selected && !t.source)
    .length;
  
  useEffect(() => {
    // Log the incoming transactions for debugging
    console.log("RevenueTaggingDialog - transactions received:", transactions.length);
    
    // Filter to only credit transactions and pre-select them
    const filteredTransactions = transactions
      .filter(tx => tx.type === 'credit')
      .map(tx => ({...tx, selected: true}));
      
    console.log("RevenueTaggingDialog - filtered credit transactions:", filteredTransactions.length);
    
    // Initialize local transactions with the filtered transactions
    setLocalTransactions(filteredTransactions);
  }, [transactions]);
  
  // Toggle selection for a single transaction
  const handleSelectTransaction = (id: string, checked: boolean) => {
    setLocalTransactions(prev => 
      prev.map(t => t.id === id ? { ...t, selected: checked } : t)
    );
  };
  
  // Toggle select all
  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    
    setLocalTransactions(prev => 
      prev.map(t => ({ ...t, selected: newSelectAll }))
    );
  };
  
  // Set source for a transaction
  const handleSetSource = (id: string, source: RevenueSource) => {
    setLocalTransactions(prev => 
      prev.map(t => t.id === id ? { ...t, source } : t)
    );
  };
  
  // Apply source to all selected transactions
  const handleApplyBulkSource = () => {
    if (!bulkSource) {
      toast.warning("Please select a source first");
      return;
    }
    
    setLocalTransactions(prev => 
      prev.map(t => t.selected ? { ...t, source: bulkSource } : t)
    );
    
    toast.success(`Applied ${bulkSource} source to ${selectedCount} transactions`);
  };
  
  // Complete the tagging process
  const handleComplete = () => {
    // Check if all selected transactions have sources
    if (noSourceCount > 0) {
      toast.warning(`${noSourceCount} selected transaction(s) are missing a revenue source.`);
      return;
    }
    
    // Make sure we have at least one transaction selected
    if (selectedCount === 0) {
      toast.warning("Please select at least one transaction to import");
      return;
    }
    
    // Pass the complete transaction list back
    try {
      console.log("RevenueTaggingDialog - completing with transactions:", 
        localTransactions.filter(t => t.selected).length);
      onTaggingComplete(localTransactions);
    } catch (err) {
      console.error("Error during tagging completion:", err);
      toast.error("Failed to process transactions");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Tag revenue sources</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Selection summary */}
        <div className="px-4 py-2 border-b bg-muted/30 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <input 
                type="checkbox" 
                checked={selectAll}
                onChange={handleSelectAll}
                id="select-all"
                className="rounded border-gray-300 text-primary focus:ring-primary mr-2 h-4 w-4"
              />
              <label htmlFor="select-all" className="text-sm font-medium">
                Select all
              </label>
            </div>
            
            <Badge variant="outline" className="bg-white">
              {selectedCount} selected
            </Badge>
            
            <Badge variant="outline" className="bg-white">
              Total: {formatCurrency(totalSelectedAmount)}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={bulkSource} onValueChange={(value) => setBulkSource(value as RevenueSource)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Set source for all" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="services">Services</SelectItem>
                <SelectItem value="investments">Investments</SelectItem>
                <SelectItem value="grants">Grants</SelectItem>
                <SelectItem value="donations">Donations</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleApplyBulkSource}
              disabled={!bulkSource}
            >
              Apply
            </Button>
          </div>
          
          {noSourceCount > 0 && (
            <div className="flex items-center text-amber-500 text-xs">
              <AlertCircle className="h-3 w-3 mr-1" />
              {noSourceCount} transaction(s) missing sources
            </div>
          )}
        </div>
        
        {/* Transaction table */}
        <TransactionTable
          transactions={localTransactions}
          onSelectTransaction={handleSelectTransaction}
          onSetSource={handleSetSource}
        />
        
        {/* Actions */}
        <div className="p-4 border-t mt-auto flex justify-end gap-2">
          <Button 
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleComplete}
            disabled={selectedCount === 0}
            className="bg-green-500 hover:bg-green-600"
          >
            <Check className="h-4 w-4 mr-2" />
            Confirm selection ({selectedCount})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RevenueTaggingDialog;
