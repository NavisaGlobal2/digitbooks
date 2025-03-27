
import { ExpenseCategory } from "@/types/expense";
import ExpenseDialogDescriptionField from "./form/ExpenseDialogDescriptionField";
import ExpenseDialogAmountDateFields from "./form/ExpenseDialogAmountDateFields";
import ExpenseDialogCategoryFields from "./form/ExpenseDialogCategoryFields";
import ExpenseDialogReceiptUpload from "./form/ExpenseDialogReceiptUpload";

interface ExpenseDialogFormProps {
  description: string;
  setDescription: (value: string) => void;
  amount: string;
  setAmount: (value: string) => void;
  date: Date | undefined;
  setDate: (value: Date | undefined) => void;
  category: ExpenseCategory | "";
  setCategory: (value: ExpenseCategory) => void;
  paymentMethod: "cash" | "card" | "bank transfer" | "other";
  setPaymentMethod: (value: "cash" | "card" | "bank transfer" | "other") => void;
  vendor?: string;
  setVendor?: (value: string) => void;
  notes?: string;
  setNotes?: (value: string) => void;
  receiptFile: File | null;
  setReceiptFile: (file: File | null) => void;
}

const ExpenseDialogForm = ({
  description,
  setDescription,
  amount,
  setAmount,
  date,
  setDate,
  category,
  setCategory,
  paymentMethod,
  setPaymentMethod,
  receiptFile,
  setReceiptFile
}: ExpenseDialogFormProps) => {
  return (
    <div className="p-4 space-y-5 max-h-[calc(70vh-130px)] overflow-y-auto">
      <ExpenseDialogDescriptionField 
        description={description} 
        setDescription={setDescription} 
      />
      
      <ExpenseDialogAmountDateFields 
        amount={amount} 
        setAmount={setAmount} 
        date={date} 
        setDate={setDate} 
      />
      
      <ExpenseDialogCategoryFields 
        category={category} 
        setCategory={setCategory} 
        paymentMethod={paymentMethod} 
        setPaymentMethod={setPaymentMethod} 
      />
      
      <ExpenseDialogReceiptUpload 
        receiptFile={receiptFile} 
        setReceiptFile={setReceiptFile} 
      />
    </div>
  );
};

export default ExpenseDialogForm;
