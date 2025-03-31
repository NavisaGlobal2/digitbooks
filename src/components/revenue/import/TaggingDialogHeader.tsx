
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface TaggingDialogHeaderProps {
  selectedCount: number;
  creditCount: number;
  taggedCount: number;
}

const TaggingDialogHeader = ({ selectedCount, creditCount, taggedCount }: TaggingDialogHeaderProps) => {
  return (
    <DialogHeader className="py-4 px-6 bg-green-50 border-b border-green-100">
      <DialogTitle className="text-xl font-semibold text-green-700">
        Import Revenue Transactions
      </DialogTitle>
      <div className="text-sm text-gray-600 mt-1">
        <p>
          Found <span className="font-medium">{creditCount}</span> revenue transactions. 
          Selected <span className="font-medium">{selectedCount}</span> of which{" "}
          <span className="font-medium">{taggedCount}</span> have sources assigned.
        </p>
      </div>
    </DialogHeader>
  );
};

export default TaggingDialogHeader;
