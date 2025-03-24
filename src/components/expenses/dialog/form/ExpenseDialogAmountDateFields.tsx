
import { Input } from "@/components/ui/input";

interface ExpenseDialogAmountDateFieldsProps {
  amount: string;
  setAmount: (value: string) => void;
  date: string;
  setDate: (value: string) => void;
}

const ExpenseDialogAmountDateFields = ({
  amount,
  setAmount,
  date,
  setDate,
}: ExpenseDialogAmountDateFieldsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label htmlFor="expense-date" className="block text-sm font-medium mb-1">
          Date
        </label>
        <Input
          id="expense-date"
          type="date"
          placeholder="Input details"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      
      <div>
        <label htmlFor="expense-amount" className="block text-sm font-medium mb-1">
          Amount
        </label>
        <Input
          id="expense-amount"
          placeholder="Input details"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          type="number"
          step="0.01"
          min="0"
        />
      </div>
    </div>
  );
};

export default ExpenseDialogAmountDateFields;
