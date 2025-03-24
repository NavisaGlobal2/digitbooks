import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useExpenses } from "@/contexts/ExpenseContext";
import { toast } from "sonner";
import { ExpenseCategory } from "@/types/expense";
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from "@/utils/expenseCategories";

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddExpenseDialog = ({ open, onOpenChange }: AddExpenseDialogProps) => {
  const { addExpense } = useExpenses();
  
  // Form states
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<ExpenseCategory | "">("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0]);
    }
  };
  
  const clearForm = () => {
    setDescription("");
    setAmount("");
    setDate(new Date().toISOString().split('T')[0]);
    setCategory("");
    setPaymentMethod("");
    setReceiptFile(null);
  };
  
  const handleClose = () => {
    clearForm();
    onOpenChange(false);
  };
  
  const handleSave = () => {
    if (!description) {
      toast.error("Please enter an expense name");
      return;
    }
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    if (!date) {
      toast.error("Please select a date");
      return;
    }
    
    if (!category) {
      toast.error("Please select a category");
      return;
    }
    
    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }
    
    let receiptUrl;
    if (receiptFile) {
      const reader = new FileReader();
      reader.readAsDataURL(receiptFile);
      reader.onload = () => {
        receiptUrl = reader.result as string;
        
        addExpense({
          description,
          amount: Number(amount),
          date: new Date(date),
          category: category as ExpenseCategory,
          status: "pending",
          paymentMethod: paymentMethod as "cash" | "card" | "bank transfer" | "other",
          vendor: "Unknown",
          receiptUrl
        });
        
        toast.success("Expense added successfully");
        handleClose();
      };
    } else {
      addExpense({
        description,
        amount: Number(amount),
        date: new Date(date),
        category: category as ExpenseCategory,
        status: "pending",
        paymentMethod: paymentMethod as "cash" | "card" | "bank transfer" | "other",
        vendor: "Unknown"
      });
      
      toast.success("Expense added successfully");
      handleClose();
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0">
        <div className="flex items-center justify-between p-4 border-b">
          <DialogTitle className="text-xl font-medium">Add expense</DialogTitle>
          <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-4 space-y-4">
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
          
          <div>
            <label htmlFor="expense-category" className="block text-sm font-medium mb-1">
              Category
            </label>
            <Select value={category} onValueChange={(value) => setCategory(value as ExpenseCategory)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="mt-1">
              <Button variant="link" className="p-0 h-auto text-sm text-green-500">
                Manage categories
              </Button>
            </div>
          </div>
          
          <div>
            <label htmlFor="payment-method" className="block text-sm font-medium mb-1">
              Payment method
            </label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Upload receipt (optional)
            </label>
            <div className="border rounded-md p-6 text-center">
              <div className="flex flex-col items-center justify-center">
                <div className="mb-2 text-gray-400 border rounded-full p-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 22H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 18V2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M18 8L12 2L6 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="text-sm text-gray-500">Drag & drop receipt</p>
                <p className="text-sm text-gray-400">or</p>
                <label className="cursor-pointer">
                  <span className="text-sm text-green-500">Browse files</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex p-4 border-t space-x-3">
          <Button 
            className="flex-1 bg-green-500 hover:bg-green-600 text-white" 
            onClick={handleSave}
          >
            Save expense
          </Button>
          <Button 
            className="flex-1" 
            variant="outline" 
            onClick={handleClose}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddExpenseDialog;
