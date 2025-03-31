
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
    <div className="p-4 border-t sticky bottom-0 bg-white flex justify-between items-center">
      <div className="text-sm text-gray-500">
        {selectedCount > 0 ? (
          <span>
            {selectedCount} transaction{selectedCount !== 1 ? "s" : ""} selected, {taggedCount} with source assigned
          </span>
        ) : (
          <span>No transactions selected</span>
        )}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={onSave}
          disabled={!isReadyToSave}
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          Import {selectedCount} Transaction{selectedCount !== 1 ? "s" : ""}
        </Button>
      </div>
    </div>
  );
};

export default TaggingDialogFooter;
