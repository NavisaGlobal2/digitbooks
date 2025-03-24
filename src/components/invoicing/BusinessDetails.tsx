
import { format } from "date-fns";
import { CalendarRange, Copy, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface BusinessDetailsProps {
  invoiceDate: Date | undefined;
  setInvoiceDate: (date: Date | undefined) => void;
  dueDate: Date | undefined;
  setDueDate: (date: Date | undefined) => void;
}

const BusinessDetails = ({ invoiceDate, setInvoiceDate, dueDate, setDueDate }: BusinessDetailsProps) => {
  return (
    <div className="bg-white p-6 rounded-lg border border-border space-y-4">
      {/* Invoice Number */}
      <div>
        <h3 className="text-lg font-medium mb-2">Invoice number</h3>
        <div className="relative">
          <Input placeholder="INV-001" defaultValue="AB2324-01" />
          <Button 
            variant="ghost" 
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Client Selection */}
      <div className="pt-2">
        <h3 className="text-lg font-medium mb-2">Select client</h3>
        <div className="relative mb-2">
          <Select defaultValue="client1">
            <SelectTrigger>
              <SelectValue placeholder="Select a client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="client1">Amarachhhlii LTD</SelectItem>
              <SelectItem value="client2">Client 2</SelectItem>
              <SelectItem value="client3">Client 3</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" className="text-green-500 border-green-500 hover:bg-green-50 w-full">
          <Plus className="h-4 w-4 mr-2" />
          Create client
        </Button>
      </div>
      
      {/* Dates */}
      <div className="grid grid-cols-2 gap-4 pt-2">
        <div>
          <Label htmlFor="invoice-date">Invoice date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !invoiceDate && "text-muted-foreground"
                )}
              >
                <CalendarRange className="mr-2 h-4 w-4" />
                {invoiceDate ? format(invoiceDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={invoiceDate}
                onSelect={setInvoiceDate}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Label htmlFor="due-date">Due date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dueDate && "text-muted-foreground"
                )}
              >
                <CalendarRange className="mr-2 h-4 w-4" />
                {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={setDueDate}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Payment Terms */}
      <div className="pt-2">
        <Label htmlFor="payment-terms">Payment terms</Label>
        <Select defaultValue="full">
          <SelectTrigger>
            <SelectValue placeholder="Select payment terms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="full">100% upon project completion</SelectItem>
            <SelectItem value="50-50">50% upfront, 50% upon completion</SelectItem>
            <SelectItem value="net30">Net 30</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default BusinessDetails;
