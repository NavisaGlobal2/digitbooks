
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
  tax: number;
}

interface InvoiceItemsProps {
  invoiceItems: InvoiceItem[];
  setInvoiceItems: (items: InvoiceItem[]) => void;
  addInvoiceItem: () => void;
}

const InvoiceItems = ({ invoiceItems, setInvoiceItems, addInvoiceItem }: InvoiceItemsProps) => {
  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const updatedItems = [...invoiceItems];
    
    if (field === 'quantity' || field === 'price' || field === 'tax') {
      updatedItems[index][field] = Number(value);
    } else {
      updatedItems[index][field] = value as string;
    }
    
    setInvoiceItems(updatedItems);
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-border">
      <h3 className="text-lg font-medium mb-4">Itemized products/services</h3>
      {invoiceItems.map((item, index) => (
        <div key={index} className="mb-4 border border-gray-200 rounded-md p-3 sm:p-4">
          <div className="mb-3 sm:mb-4">
            <Label htmlFor={`description-${index}`}>Description</Label>
            <Input 
              id={`description-${index}`} 
              value={item.description} 
              placeholder="Web design services" 
              onChange={(e) => handleItemChange(index, 'description', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 mb-3 sm:mb-4">
            <div>
              <Label htmlFor={`quantity-${index}`}>Quantity</Label>
              <Input 
                id={`quantity-${index}`} 
                type="number" 
                min="1" 
                value={item.quantity.toString()} 
                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor={`price-${index}`}>Price (₦)</Label>
              <Input 
                id={`price-${index}`} 
                type="number" 
                min="0" 
                step="0.01" 
                value={item.price.toString()}
                placeholder="0.00" 
                onChange={(e) => handleItemChange(index, 'price', e.target.value)}
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor={`tax-${index}`}>Tax (%)</Label>
              <Input 
                id={`tax-${index}`} 
                type="number" 
                min="0" 
                max="100" 
                step="0.1" 
                value={item.tax.toString()}
                placeholder="0" 
                onChange={(e) => handleItemChange(index, 'tax', e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor={`total-${index}`}>Total</Label>
            <Input 
              id={`total-${index}`} 
              readOnly 
              value={`₦${(item.quantity * item.price).toFixed(2)}`}
            />
          </div>
        </div>
      ))}
      <Button 
        variant="outline" 
        className="text-green-500 border-green-500 hover:bg-green-50 w-full"
        onClick={addInvoiceItem}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add more
      </Button>
    </div>
  );
};

export default InvoiceItems;
