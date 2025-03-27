
import { ParsedTransaction } from "./parsers/types";
import { ExpenseCategory } from "@/types/expense";
import { useTagSelection } from "./tagging/useTagSelection";
import { useCategoryAssignment } from "./tagging/useCategoryAssignment";
import { useTransactionValidation } from "./tagging/useTransactionValidation";

export const useTransactionTagging = (initialTransactions: ParsedTransaction[]) => {
  const {
    taggedTransactions,
    setTaggedTransactions,
    selectAll,
    selectedCount,
    debitCount,
    handleSelectAll,
    handleSelectTransaction
  } = useTagSelection(initialTransactions);

  const {
    taggedCount,
    handleSetCategory,
    handleSetCategoryForAll
  } = useCategoryAssignment(taggedTransactions, setTaggedTransactions);

  const { isReadyToSave } = useTransactionValidation(taggedTransactions);

  return {
    taggedTransactions,
    selectAll,
    isReadyToSave,
    selectedCount,
    debitCount,
    taggedCount,
    handleSelectAll,
    handleSelectTransaction,
    handleSetCategory,
    handleSetCategoryForAll
  };
};
