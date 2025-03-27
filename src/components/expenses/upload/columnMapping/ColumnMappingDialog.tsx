
import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDown, Check, AlertCircle, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import DialogHeader from "../DialogHeader";

interface ColumnMappingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  headers: string[];
  sampleData: string[][];
  onMappingComplete: (mapping: ColumnMapping) => void;
  initialMapping?: ColumnMapping;
}

export interface ColumnMapping {
  date: number;
  description: number;
  amount: number;
  type?: number; // Optional - some statements have explicit type columns
}

const ColumnMappingDialog = ({
  open,
  onOpenChange,
  headers,
  sampleData,
  onMappingComplete,
  initialMapping
}: ColumnMappingDialogProps) => {
  const [mapping, setMapping] = useState<ColumnMapping>(() => {
    if (initialMapping) return initialMapping;
    
    // Default mapping - attempt to guess based on common column names
    const guessedMapping: ColumnMapping = {
      date: -1,
      description: -1,
      amount: -1
    };
    
    headers.forEach((header, index) => {
      const headerLower = header.toLowerCase();
      
      if (headerLower.includes('date') || headerLower.includes('time')) {
        guessedMapping.date = index;
      } else if (
        headerLower.includes('desc') || 
        headerLower.includes('narr') || 
        headerLower.includes('part') || 
        headerLower.includes('ref')
      ) {
        guessedMapping.description = index;
      } else if (
        headerLower.includes('amount') || 
        headerLower.includes('sum') || 
        headerLower.includes('debit') || 
        headerLower.includes('credit') || 
        headerLower.includes('value')
      ) {
        guessedMapping.amount = index;
      } else if (
        headerLower.includes('type') || 
        headerLower.includes('dr/cr') || 
        headerLower.includes('d/c')
      ) {
        guessedMapping.type = index;
      }
    });
    
    return guessedMapping;
  });
  
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Validate the current mapping
  useEffect(() => {
    const errors: Record<string, string> = {};
    
    if (mapping.date === -1) {
      errors.date = "Date column is required";
    }
    
    if (mapping.description === -1) {
      errors.description = "Description column is required";
    }
    
    if (mapping.amount === -1) {
      errors.amount = "Amount column is required";
    }
    
    // Check for duplicates
    const selectedIndices = Object.values(mapping).filter(index => index !== -1);
    if (new Set(selectedIndices).size !== selectedIndices.length) {
      errors.general = "Each column can only be mapped once";
    }
    
    setValidationErrors(errors);
  }, [mapping]);
  
  const handleColumnSelect = (field: keyof ColumnMapping, index: number) => {
    setMapping(prev => ({
      ...prev,
      [field]: index
    }));
  };
  
  const handleComplete = () => {
    if (Object.keys(validationErrors).length === 0) {
      onMappingComplete(mapping);
    }
  };
  
  const isValid = Object.keys(validationErrors).length === 0;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl p-0 gap-0 max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader title="Column Mapping" />
        
        <div className="p-4 space-y-4 flex-1 overflow-auto">
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md">
            <div className="flex space-x-2 text-yellow-800">
              <HelpCircle className="h-5 w-5 flex-shrink-0" />
              <div>
                <h4 className="font-medium">Customize Column Mapping</h4>
                <p className="text-sm">
                  Please match each required field to the corresponding column in your bank statement. 
                  This helps ensure your transactions are correctly imported.
                </p>
              </div>
            </div>
          </div>
          
          {validationErrors.general && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-md">
              <div className="flex space-x-2 text-red-800">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p>{validationErrors.general}</p>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MappingSelector
              label="Date"
              headers={headers}
              selectedIndex={mapping.date}
              onSelect={(index) => handleColumnSelect('date', index)}
              error={validationErrors.date}
            />
            
            <MappingSelector
              label="Description"
              headers={headers}
              selectedIndex={mapping.description}
              onSelect={(index) => handleColumnSelect('description', index)}
              error={validationErrors.description}
            />
            
            <MappingSelector
              label="Amount"
              headers={headers}
              selectedIndex={mapping.amount}
              onSelect={(index) => handleColumnSelect('amount', index)}
              error={validationErrors.amount}
            />
            
            <MappingSelector
              label="Type (Optional)"
              headers={headers}
              selectedIndex={mapping.type ?? -1}
              onSelect={(index) => handleColumnSelect('type', index)}
              optional
            />
          </div>
          
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Preview with Current Mapping</h3>
            <div className="border rounded-md overflow-x-auto max-h-64">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    {mapping.type !== undefined && <TableHead>Type</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleData.slice(0, 5).map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      <TableCell>{mapping.date >= 0 ? row[mapping.date] : 'Not mapped'}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {mapping.description >= 0 ? row[mapping.description] : 'Not mapped'}
                      </TableCell>
                      <TableCell>
                        {mapping.amount >= 0 ? row[mapping.amount] : 'Not mapped'}
                      </TableCell>
                      {mapping.type !== undefined && (
                        <TableCell>
                          {mapping.type >= 0 ? row[mapping.type] : 'Not mapped'}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Showing first 5 rows of {sampleData.length} transactions
            </p>
          </div>
        </div>
        
        <div className="border-t p-4 flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleComplete} 
            disabled={!isValid}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            <Check className="h-4 w-4 mr-2" />
            Apply Mapping
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface MappingSelectorProps {
  label: string;
  headers: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  error?: string;
  optional?: boolean;
}

const MappingSelector = ({
  label,
  headers,
  selectedIndex,
  onSelect,
  error,
  optional = false
}: MappingSelectorProps) => {
  return (
    <div className="space-y-1">
      <div className="flex items-center">
        <span className="text-sm font-medium">{label}</span>
        {optional && (
          <Badge variant="outline" className="ml-2 text-xs">
            Optional
          </Badge>
        )}
      </div>
      <Select
        value={selectedIndex === -1 ? "" : selectedIndex.toString()}
        onValueChange={(value) => onSelect(parseInt(value) || -1)}
      >
        <SelectTrigger className={error ? "border-red-300" : ""}>
          <SelectValue placeholder="Select column" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">
            {optional ? 'Not selected' : 'Select column'}
          </SelectItem>
          {headers.map((header, index) => (
            <SelectItem key={index} value={index.toString()}>
              {header}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default ColumnMappingDialog;
