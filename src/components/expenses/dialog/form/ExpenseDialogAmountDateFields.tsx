
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface ExpenseDialogAmountDateFieldsProps {
  amount: string;
  setAmount: (value: string) => void;
  date: Date | undefined;
  setDate: (value: Date | undefined) => void;
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
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
              type="button"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
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
