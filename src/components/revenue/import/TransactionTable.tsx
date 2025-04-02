
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/invoice/formatters";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { ParsedTransaction } from "./parsers/types";
import { RevenueSource } from "@/types/revenue";

interface TransactionTableProps {
  transactions: ParsedTransaction[];
  onSelectTransaction: (id: string, checked: boolean) => void;
  onSetSource: (id: string, source: RevenueSource) => void;
}

const sourcesOptions: Array<{ value: RevenueSource; label: string }> = [
  { value: "sales", label: "Sales" },
  { value: "services", label: "Services" },
  { value: "investments", label: "Investments" },
  { value: "grants", label: "Grants" },
  { value: "donations", label: "Donations" },
  { value: "other", label: "Other" }
];

const TransactionTable = ({ 
  transactions,
  onSelectTransaction,
  onSetSource
}: TransactionTableProps) => {
  // State to track pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Filter to show only credit transactions (revenue)
  const creditTransactions = transactions.filter(tx => tx.type === "credit");
  
  // Calculate pagination values
  const totalPages = Math.ceil(creditTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, creditTransactions.length);
  const currentTransactions = creditTransactions.slice(startIndex, endIndex);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy");
    } catch (error) {
      return dateString;
    }
  };
  
  return (
    <>
      <div className="overflow-auto flex-grow max-h-[60vh]">
        <Table>
          <TableHeader className="sticky top-0 bg-white z-10">
            <TableRow>
              <TableHead className="w-[50px]">Select</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="max-w-[300px]">Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Source</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentTransactions.map(transaction => (
              <TableRow key={transaction.id} className={!transaction.selected ? "opacity-50" : ""}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={transaction.selected}
                    onChange={(e) => onSelectTransaction(transaction.id, e.target.checked)}
                    className="rounded border-gray-300 text-green-500 focus:ring-green-500 h-4 w-4"
                  />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatDate(transaction.date)}
                </TableCell>
                <TableCell className="max-w-[300px] truncate">
                  {transaction.description}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(transaction.amount)}
                </TableCell>
                <TableCell>
                  {transaction.selected ? (
                    <Select
                      value={transaction.source || ""}
                      onValueChange={(value) => onSetSource(transaction.id, value as RevenueSource)}
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        {sourcesOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant="outline" className="opacity-50">
                      Not selected
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
            
            {currentTransactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No credit transactions found in this file.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-between items-center px-4 py-2 border-t">
          <div className="text-sm text-gray-500">
            Showing {startIndex + 1} to {endIndex} of {creditTransactions.length}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default TransactionTable;
