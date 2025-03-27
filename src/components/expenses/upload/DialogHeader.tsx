
import { DialogTitle } from "@/components/ui/dialog";

interface DialogHeaderProps {
  title: string;
}

const DialogHeader = ({ title }: DialogHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <DialogTitle className="text-xl font-semibold mb-0">
        {title}
      </DialogTitle>
    </div>
  );
};

export default DialogHeader;
