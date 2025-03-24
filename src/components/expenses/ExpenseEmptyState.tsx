
import { Receipt } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

interface ExpenseEmptyStateProps {
  onAddExpense: () => void;
  onConnectBank: () => void;
}

const ExpenseEmptyState = ({ onAddExpense, onConnectBank }: ExpenseEmptyStateProps) => {
  return (
    <EmptyState
      icon={<Receipt className="w-20 h-20 text-gray-400" strokeWidth={1.5} />}
      title="No expenses tracked yet"
      description="Begin by connecting your bank account so we can do the rest. Also you can manually add expenses made."
      primaryAction={{
        label: "Connect bank account",
        onClick: onConnectBank,
      }}
      secondaryAction={{
        label: "Add expense",
        onClick: onAddExpense,
      }}
    />
  );
};

export default ExpenseEmptyState;
