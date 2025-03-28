
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { formatNaira } from "@/utils/invoice/formatters";
import { Expense } from "@/types/expense";

interface TransactionsTabContentProps {
  transactions: Expense[];
}

const TransactionsTabContent = ({ transactions }: TransactionsTabContentProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>
                    {expense.date instanceof Date 
                      ? expense.date.toLocaleDateString() 
                      : new Date(expense.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell>{expense.category}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatNaira(expense.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-gray-500">No transactions with this vendor yet.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionsTabContent;
