
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ColumnMapping, guessColumnMapping } from "../parsers/columnMapper";
import MappingSelector from "./MappingSelector";

interface ColumnMappingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  headers: string[];
  sampleData: string[][];
  onMappingComplete: (mapping: ColumnMapping) => void;
}

const ColumnMappingDialog = ({
  open,
  onOpenChange,
  headers,
  sampleData,
  onMappingComplete
}: ColumnMappingDialogProps) => {
  const [mapping, setMapping] = useState<ColumnMapping>({ date: -1, description: -1, amount: -1 });
  
  // When headers change, try to guess the mapping
  useEffect(() => {
    if (headers.length > 0) {
      const guessedMapping = guessColumnMapping(headers);
      setMapping(guessedMapping);
    }
  }, [headers]);
  
  const handleMappingChange = (field: keyof ColumnMapping, value: number) => {
    setMapping(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSave = () => {
    // Validate that we have the required mappings
    if (mapping.date === -1 || mapping.description === -1 || mapping.amount === -1) {
      alert("Please map all required fields: Date, Description, and Amount");
      return;
    }
    
    onMappingComplete(mapping);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Map CSV Columns</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <div className="grid grid-cols-4 gap-4">
            <MappingSelector 
              label="Date Column" 
              headers={headers}
              selectedIndex={mapping.date}
              onChange={(value) => handleMappingChange('date', value)}
              required
            />
            
            <MappingSelector 
              label="Description Column" 
              headers={headers}
              selectedIndex={mapping.description}
              onChange={(value) => handleMappingChange('description', value)}
              required
            />
            
            <MappingSelector 
              label="Amount Column" 
              headers={headers}
              selectedIndex={mapping.amount}
              onChange={(value) => handleMappingChange('amount', value)}
              required
            />
            
            <MappingSelector 
              label="Transaction Type Column (optional)" 
              headers={headers}
              selectedIndex={mapping.type !== undefined ? mapping.type : -1}
              onChange={(value) => handleMappingChange('type', value)}
              required={false}
            />
          </div>
          
          <div className="overflow-auto flex-1 border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  {headers.map((header, index) => (
                    <TableHead key={index} className={`whitespace-nowrap ${
                      index === mapping.date ? 'bg-blue-100' : 
                      index === mapping.description ? 'bg-green-100' : 
                      index === mapping.amount ? 'bg-yellow-100' : 
                      index === mapping.type ? 'bg-purple-100' : ''
                    }`}>
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleData.slice(0, 5).map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <TableCell key={cellIndex} className={`whitespace-nowrap ${
                        cellIndex === mapping.date ? 'bg-blue-50' : 
                        cellIndex === mapping.description ? 'bg-green-50' : 
                        cellIndex === mapping.amount ? 'bg-yellow-50' : 
                        cellIndex === mapping.type ? 'bg-purple-50' : ''
                      }`}>
                        {cell}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="text-sm text-muted-foreground p-2 bg-gray-50 rounded-md">
            <p className="font-semibold">Column Mapping Key:</p>
            <div className="grid grid-cols-4 gap-2 mt-1">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-100 rounded"></div>
                <span>Date</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-100 rounded"></div>
                <span>Description</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-100 rounded"></div>
                <span>Amount</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-100 rounded"></div>
                <span>Type (optional)</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Apply Mapping
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ColumnMappingDialog;
