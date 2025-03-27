
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExpenseCategory } from "@/types/expense";
import { EXPENSE_CATEGORIES } from "@/utils/expenseCategories";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

interface TransactionTaggingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactions: any[];
  onTaggingComplete: (taggedTransactions: any[]) => void;
}

const TransactionTaggingDialog = ({
  open,
  onOpenChange,
  transactions,
  onTaggingComplete,
}: TransactionTaggingDialogProps) => {
  const [taggedTransactions, setTaggedTransactions] = useState<any[]>(transactions);
  const [selectAll, setSelectAll] = useState(true);
  const [isReadyToSave, setIsReadyToSave] = useState(false);

  useEffect(() => {
    // Check if all selected transactions have categories
    const selectedTransactions = taggedTransactions.filter(t => t.selected);
    const allTagged = selectedTransactions.length > 0 && 
                      selectedTransactions.every(t => t.category);
    setIsReadyToSave(allTagged);
  }, [taggedTransactions]);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setTaggedTransactions(transactions.map(t => ({
      ...t,
      selected: checked && t.type === 'debit' // Only select debits
    })));
  };

  const handleSelectTransaction = (id: string, checked: boolean) => {
    setTaggedTransactions(taggedTransactions.map(t => 
      t.id === id ? { ...t, selected: checked } : t
    ));
  };

  const handleSetCategory = (id: string, category: ExpenseCategory) => {
    setTaggedTransactions(taggedTransactions.map(t => 
      t.id === id ? { ...t, category } : t
    ));
  };

  const handleSetCategoryForAll = (category: ExpenseCategory) => {
    setTaggedTransactions(taggedTransactions.map(t => 
      t.selected ? { ...t, category } : t
    ));
  };

  const handleSave = () => {
    onTaggingComplete(taggedTransactions);
  };

  const selectedCount = taggedTransactions.filter(t => t.selected).length;
  const debitCount = taggedTransactions.filter(t => t.type === 'debit').length;
  const taggedCount = taggedTransactions.filter(t => t.selected && t.category).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="w-full">
      <DialogContent className="sm:max-w-5xl p-0 gap-0 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <DialogTitle className="text-xl font-semibold">
            Tag Transactions
          </DialogTitle>
          <div className="flex items-center space-x-2 text-sm">
            <Badge variant="outline" className="bg-gray-100">
              {selectedCount} of {debitCount} transactions selected
            </Badge>
            <Badge variant="outline" className="bg-green-100 text-green-700">
              {taggedCount} transactions tagged
            </Badge>
          </div>
        </div>
        
        <div className="p-4 space-y-2 border-b">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="select-all" 
                checked={selectAll} 
                onCheckedChange={handleSelectAll}
              />
              <label htmlFor="select-all" className="text-sm font-medium">
                Select all debit transactions
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Set category for all selected:</span>
              <Select 
                onValueChange={(value) => handleSetCategoryForAll(value as ExpenseCategory)}
              >
                <SelectTrigger className="w-40 h-8">
                  <SelectValue placeholder="Choose category" />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto p-0 max-h-[calc(90vh-210px)]">
          <Table>
            <TableHeader className="sticky top-0 bg-white shadow-sm">
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead className="w-32">Date</TableHead>
                <TableHead className="w-36">Amount</TableHead>
                <TableHead className="w-24">Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-40">Category</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {taggedTransactions.map((transaction) => (
                <TableRow key={transaction.id} className={!transaction.selected ? "opacity-70" : ""}>
                  <TableCell>
                    <Checkbox
                      checked={transaction.selected}
                      onCheckedChange={(checked) => 
                        handleSelectTransaction(transaction.id, checked as boolean)
                      }
                      disabled={transaction.type === 'credit'} // Can't select credit transactions
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {format(new Date(transaction.date), "yyyy-MM-dd")}
                  </TableCell>
                  <TableCell className="font-medium">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD'
                    }).format(transaction.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={transaction.type === 'debit' ? "destructive" : "default"} className="capitalize">
                      {transaction.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate" title={transaction.description}>
                    {transaction.description}
                  </TableCell>
                  <TableCell>
                    {transaction.type === 'debit' ? (
                      <Select
                        value={transaction.category}
                        onValueChange={(value) => 
                          handleSetCategory(transaction.id, value as ExpenseCategory)
                        }
                        disabled={!transaction.selected}
                      >
                        <SelectTrigger className={`w-full ${!transaction.category && transaction.selected ? "border-red-300" : ""}`}>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {EXPENSE_CATEGORIES.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-sm text-gray-500 italic">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="p-4 border-t flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {!isReadyToSave && selectedCount > 0 && (
              <span className="text-red-500">
                Please categorize all selected transactions
              </span>
            )}
            {selectedCount === 0 && (
              <span className="text-yellow-600">
                No transactions selected
              </span>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              className="bg-green-500 hover:bg-green-600 text-white"
              disabled={!isReadyToSave}
              onClick={handleSave}
            >
              Save {taggedCount} Expense{taggedCount !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionTaggingDialog;
