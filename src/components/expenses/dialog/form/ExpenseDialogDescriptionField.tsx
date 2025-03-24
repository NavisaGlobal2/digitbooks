
import { Input } from "@/components/ui/input";

interface ExpenseDialogDescriptionFieldProps {
  description: string;
  setDescription: (value: string) => void;
}

const ExpenseDialogDescriptionField = ({
  description,
  setDescription,
}: ExpenseDialogDescriptionFieldProps) => {
  return (
    <div>
      <label htmlFor="expense-name" className="block text-sm font-medium mb-1">
        Expense name
      </label>
      <Input
        id="expense-name"
        placeholder="Input details"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
    </div>
  );
};

export default ExpenseDialogDescriptionField;
