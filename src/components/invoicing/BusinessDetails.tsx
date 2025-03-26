
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import ClientSelector from "./ClientSelector";

interface BusinessDetailsProps {
  invoiceDate: Date | undefined;
  setInvoiceDate: (date: Date | undefined) => void;
  dueDate: Date | undefined;
  setDueDate: (date: Date | undefined) => void;
  clientName: string;
  setClientName: (name: string) => void;
}

const BusinessDetails = ({
  invoiceDate,
  setInvoiceDate,
  dueDate,
  setDueDate,
  clientName,
  setClientName
}: BusinessDetailsProps) => {
  return (
    <div className="rounded-lg border border-border p-4">
      <h3 className="text-lg font-medium mb-4">Invoice Details</h3>
      
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label htmlFor="clientName" className="text-sm font-medium mb-1 block">
            Client
          </label>
          <ClientSelector 
            selectedClientName={clientName}
            onClientSelect={setClientName}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col space-y-1">
            <label htmlFor="invoiceDate" className="text-sm font-medium">Invoice Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !invoiceDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {invoiceDate ? format(invoiceDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={invoiceDate}
                  onSelect={setInvoiceDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="flex flex-col space-y-1">
            <label htmlFor="dueDate" className="text-sm font-medium">Due Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDetails;
