
import { TableCell, TableRow } from "@/components/ui/table";

const EmptyExpensesRow = () => {
  return (
    <TableRow>
      <TableCell colSpan={7} className="text-center py-6 text-gray-500">
        No expenses match the selected filters
      </TableCell>
    </TableRow>
  );
};

export default EmptyExpensesRow;
