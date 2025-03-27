
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
  return (
    <div className="p-4 border-t flex justify-between items-center">
      <div className="text-sm text-gray-500">
        {!isReadyToSave && selectedCount > 0 && (
          <span className="text-red-500">
            Please categorize all selected transactions
          </span>
        )}
        {selectedCount === 0 && (
          <span className="text-yellow-600">
            No transactions selected
          </span>
        )}
      </div>
      
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button 
          className="bg-green-500 hover:bg-green-600 text-white"
          disabled={!isReadyToSave}
          onClick={onSave}
        >
          Save {taggedCount} Expense{taggedCount !== 1 ? 's' : ''}
        </Button>
      </div>
    </div>
  );
};

export default TaggingDialogFooter;
