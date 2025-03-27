
import { DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface TaggingDialogHeaderProps {
  selectedCount: number;
  debitCount: number;
  taggedCount: number;
}

const TaggingDialogHeader = ({ 
  selectedCount, 
  debitCount, 
  taggedCount 
}: TaggingDialogHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <DialogTitle className="text-xl font-semibold">
        Tag Transactions
      </DialogTitle>
      <div className="flex items-center space-x-2 text-sm">
        <Badge variant="outline" className="bg-gray-100">
          {selectedCount} of {debitCount} transactions selected
        </Badge>
        <Badge variant="outline" className="bg-green-100 text-green-700">
          {taggedCount} transactions tagged
        </Badge>
      </div>
    </div>
  );
};

export default TaggingDialogHeader;
