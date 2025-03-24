
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ExpenseNotesFieldProps {
  notes: string;
  setNotes: (value: string) => void;
}

const ExpenseNotesField = ({ notes, setNotes }: ExpenseNotesFieldProps) => {
  return (
    <div>
      <Label htmlFor="notes">Additional Notes (Optional)</Label>
      <Textarea
        id="notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Any additional details about the expense"
        rows={3}
      />
    </div>
  );
};

export default ExpenseNotesField;
