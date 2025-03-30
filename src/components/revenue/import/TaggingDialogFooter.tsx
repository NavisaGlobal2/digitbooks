
import { Button } from "@/components/ui/button";

interface TaggingDialogFooterProps {
  isReadyToSave: boolean;
  selectedCount: number;
  taggedCount: number;
  onCancel: () => void;
  onSave: () => void;
}

const TaggingDialogFooter = ({
  isReadyToSave,
  selectedCount,
  taggedCount,
  onCancel,
  onSave
}: TaggingDialogFooterProps) => {
  const footerText = !isReadyToSave && selectedCount > 0
    ? `Please assign sources to all selected transactions (${taggedCount}/${selectedCount} tagged)`
    : selectedCount === 0
      ? "Please select at least one income transaction"
      : `${selectedCount} transactions ready to import`;

  return (
    <div className="p-4 bg-gray-50 border-t mt-auto flex flex-col gap-4">
      <p className={`text-sm ${isReadyToSave ? "text-green-600" : "text-amber-600"}`}>
        {footerText}
      </p>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          disabled={!isReadyToSave} 
          onClick={onSave}
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          Save {selectedCount} Transactions
        </Button>
      </div>
    </div>
  );
};

export default TaggingDialogFooter;
