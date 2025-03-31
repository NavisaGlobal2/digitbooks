
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RevenueSource } from "@/types/revenue";
import { ParsedTransaction } from "./parsers/types";
import { formatCurrency } from "@/utils/invoice/formatters";
import { Sparkles } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const REVENUE_SOURCES = [
  { value: "sales", label: "Sales" },
  { value: "services", label: "Services" },
  { value: "investments", label: "Investments" },
  { value: "grants", label: "Grants" },
  { value: "donations", label: "Donations" },
  { value: "royalties", label: "Royalties" },
  { value: "rental", label: "Rental" },
  { value: "consulting", label: "Consulting" },
  { value: "affiliate", label: "Affiliate" },
  { value: "other", label: "Other" },
];

interface TransactionTableProps {
  transactions: ParsedTransaction[];
  onSelectTransaction: (id: string, checked: boolean) => void;
  onSetSource: (id: string, source: RevenueSource) => void;
}

const TransactionTable = ({
  transactions,
  onSelectTransaction,
  onSetSource
}: TransactionTableProps) => {
  return (
    <div className="flex-1 overflow-auto p-0 max-h-[calc(90vh-210px)]">
      <Table>
        <TableHeader className="sticky top-0 bg-white shadow-sm">
          <TableRow>
            <TableHead className="w-10"></TableHead>
            <TableHead className="w-32">Date</TableHead>
            <TableHead className="w-36">Amount</TableHead>
            <TableHead className="w-24">Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="w-40">Source</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id} className={!transaction.selected ? "opacity-70" : ""}>
              <TableCell>
                <Checkbox
                  id={`transaction-${transaction.id}`}
                  checked={transaction.selected}
                  onCheckedChange={(checked) => {
                    // Ensure we're passing a boolean value
                    onSelectTransaction(
                      transaction.id, 
                      checked === true || checked === "indeterminate"
                    );
                  }}
                  disabled={transaction.type === 'debit'} // Can't select debit transactions
                  className="cursor-pointer"
                  aria-label={`Select transaction ${transaction.description}`}
                />
              </TableCell>
              <TableCell className="font-mono text-xs">
                {format(new Date(transaction.date), "yyyy-MM-dd")}
              </TableCell>
              <TableCell className="font-medium">
                {formatCurrency(transaction.amount)}
              </TableCell>
              <TableCell>
                <Badge variant={transaction.type === 'debit' ? "destructive" : "success"} className="capitalize">
                  {transaction.type}
                </Badge>
              </TableCell>
              <TableCell className="max-w-xs truncate" title={transaction.description}>
                {transaction.description}
              </TableCell>
              <TableCell>
                {transaction.type === 'credit' ? (
                  <div className="flex items-center gap-1">
                    <Select
                      value={transaction.source}
                      onValueChange={(value) => 
                        onSetSource(transaction.id, value as RevenueSource)
                      }
                      disabled={!transaction.selected}
                    >
                      <SelectTrigger className={`w-full ${!transaction.source && transaction.selected ? "border-red-300" : ""}`}>
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        {REVENUE_SOURCES.map((source) => (
                          <SelectItem key={source.value} value={source.value}>
                            {source.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {transaction.sourceSuggestion && transaction.sourceSuggestion.confidence > 0.5 && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="cursor-help">
                              <Sparkles 
                                className={`h-4 w-4 ml-1 ${transaction.source ? 'text-gray-400' : 'text-yellow-500 animate-pulse'}`} 
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p className="text-sm">
                              Suggested: <span className="font-medium">{REVENUE_SOURCES.find(s => s.value === transaction.sourceSuggestion?.source)?.label}</span>
                              <br />
                              <span className="text-xs opacity-70">Confidence: {Math.round(transaction.sourceSuggestion.confidence * 100)}%</span>
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-gray-500 italic">N/A</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TransactionTable;
