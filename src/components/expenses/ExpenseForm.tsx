
import { FormEvent } from "react";
import { useExpenseForm } from "@/hooks/useExpenseForm";
import ExpenseDescriptionField from "./form/ExpenseDescriptionField";
import ExpenseAmountDateFields from "./form/ExpenseAmountDateFields";
import ExpenseCategoryFields from "./form/ExpenseCategoryFields";
import ExpenseVendorField from "./form/ExpenseVendorField";
import ExpenseNotesField from "./form/ExpenseNotesField";
import ExpenseReceiptUpload from "./form/ExpenseReceiptUpload";
import ExpenseFormActions from "./form/ExpenseFormActions";

interface ExpenseFormProps {
  onCancel: () => void;
}

const ExpenseForm = ({ onCancel }: ExpenseFormProps) => {
  const {
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
    vendor,
    setVendor,
    notes,
    setNotes,
    receiptFile,
    setReceiptFile,
    receiptPreview,
    setReceiptPreview,
    handleSubmit
  } = useExpenseForm(onCancel);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <ExpenseDescriptionField 
          description={description} 
          setDescription={setDescription} 
        />
        
        <ExpenseAmountDateFields 
          amount={amount}
          setAmount={setAmount}
          date={date}
          setDate={setDate}
        />
        
        <ExpenseCategoryFields 
          category={category}
          setCategory={setCategory}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
        />
        
        <ExpenseVendorField 
          vendor={vendor}
          setVendor={setVendor}
        />
        
        <ExpenseNotesField 
          notes={notes}
          setNotes={setNotes}
        />
        
        <ExpenseReceiptUpload 
          receiptFile={receiptFile}
          setReceiptFile={setReceiptFile}
          receiptPreview={receiptPreview}
          setReceiptPreview={setReceiptPreview}
        />
      </div>
      
      <ExpenseFormActions onCancel={onCancel} />
    </form>
  );
};

export default ExpenseForm;
