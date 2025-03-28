
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface TaggingDialogHeaderProps {
  selectedCount: number;
  creditCount: number;
  taggedCount: number;
}

const TaggingDialogHeader = ({
  selectedCount,
  creditCount,
  taggedCount
}: TaggingDialogHeaderProps) => {
  return (
    <DialogHeader className="p-6 pb-2">
      <DialogTitle className="text-xl">Tag Revenue Sources</DialogTitle>
      <p className="text-sm text-muted-foreground mt-1">
        {selectedCount} of {creditCount} income transactions selected
        ({taggedCount} tagged)
      </p>
    </DialogHeader>
  );
};

export default TaggingDialogHeader;
