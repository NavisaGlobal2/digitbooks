
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { ParsedTransaction } from "./parsers/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RevenueSource } from "@/types/revenue";
import { formatCurrency } from "@/utils/invoice/formatters";

interface TransactionTableProps {
  transactions: ParsedTransaction[];
  onSelectTransaction: (id: string, selected: boolean) => void;
  onSetSource: (id: string, source: RevenueSource) => void;
}

const TransactionTable = ({
  transactions,
  onSelectTransaction,
  onSetSource
}: TransactionTableProps) => {
  return (
    <div className="flex-grow overflow-auto border-t border-b">
      <Table>
        <TableHeader className="sticky top-0 bg-white">
          <TableRow>
            <TableHead className="w-[50px]">Select</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-[180px]">Revenue Source</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No transaction data found.
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((tx) => (
              <TableRow key={tx.id} className={!tx.selected ? "opacity-60" : undefined}>
                <TableCell>
                  <Checkbox 
                    checked={tx.selected} 
                    onCheckedChange={(checked) => 
                      onSelectTransaction(tx.id, !!checked)
                    }
                  />
                </TableCell>
                <TableCell>{format(new Date(tx.date), "MMM d, yyyy")}</TableCell>
                <TableCell className="max-w-[300px] truncate">{tx.description}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(tx.amount)}
                </TableCell>
                <TableCell>
                  <Select 
                    value={tx.source || ""} 
                    onValueChange={(value) => onSetSource(tx.id, value as RevenueSource)}
                    disabled={!tx.selected}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="services">Services</SelectItem>
                      <SelectItem value="investments">Investments</SelectItem>
                      <SelectItem value="grants">Grants</SelectItem>
                      <SelectItem value="donations">Donations</SelectItem>
                      <SelectItem value="royalties">Royalties</SelectItem>
                      <SelectItem value="rental">Rental</SelectItem>
                      <SelectItem value="consulting">Consulting</SelectItem>
                      <SelectItem value="affiliate">Affiliate</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TransactionTable;
