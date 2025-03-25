
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface ExpenseAmountDateFieldsProps {
  amount: string;
  setAmount: (value: string) => void;
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

const ExpenseAmountDateFields = ({
  amount,
  setAmount,
  date,
  setDate
}: ExpenseAmountDateFieldsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
      <div>
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
        />
      </div>
      
      <div>
        <Label>Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PP") : <span>Pick a date</span>}
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
    </div>
  );
};

export default ExpenseAmountDateFields;
