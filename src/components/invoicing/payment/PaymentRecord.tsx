
import { PaymentRecord } from "@/types/invoice";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { ReceiptUploader } from "./ReceiptUploader";

// Internal interface that ensures we have an ID for UI operations
interface PaymentRecordWithId extends PaymentRecord {
  id: string;
}

interface PaymentRecordProps {
  payment: PaymentRecordWithId;
  index: number;
  isRemovable: boolean;
  onChange: (id: string, field: keyof PaymentRecord, value: any) => void;
  onRemove: (id: string) => void;
  onFileUpload: (id: string, file: File) => void;
}

export const PaymentRecordComponent = ({
  payment,
  index,
  isRemovable,
  onChange,
  onRemove,
  onFileUpload
}: PaymentRecordProps) => {
  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Payment {index + 1}</h4>
        {isRemovable && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onRemove(payment.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`amount-${payment.id}`}>Amount</Label>
          <Input
            id={`amount-${payment.id}`}
            type="number"
            value={payment.amount}
            onChange={(e) => onChange(payment.id, 'amount', parseFloat(e.target.value) || 0)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor={`method-${payment.id}`}>Payment Method</Label>
          <select
            id={`method-${payment.id}`}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={payment.method}
            onChange={(e) => onChange(payment.id, 'method', e.target.value)}
          >
            <option value="bank transfer">Bank Transfer</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="check">Check</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div className="space-y-2">
          <Label>Payment Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !payment.date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {payment.date ? format(payment.date, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={payment.date}
                onSelect={(date) => onChange(payment.id, 'date', date || new Date())}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor={`reference-${payment.id}`}>Reference (Optional)</Label>
          <Input
            id={`reference-${payment.id}`}
            placeholder="Transfer ref, payment ID, etc."
            value={payment.reference || ""}
            onChange={(e) => onChange(payment.id, 'reference', e.target.value)}
          />
        </div>
        
        <div className="col-span-2 space-y-2">
          <ReceiptUploader 
            paymentId={payment.id}
            receiptUrl={payment.receiptUrl} 
            onUpload={onFileUpload}
          />
        </div>
      </div>
    </div>
  );
};
