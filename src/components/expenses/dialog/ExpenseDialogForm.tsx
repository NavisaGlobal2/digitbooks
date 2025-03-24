
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
  date: string;
  setDate: (value: string) => void;
  category: ExpenseCategory | "";
  setCategory: (value: ExpenseCategory | "") => void;
  paymentMethod: string;
  setPaymentMethod: (value: string) => void;
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
    <div className="p-4 space-y-4">
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
