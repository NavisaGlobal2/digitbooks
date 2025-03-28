
import { LucideIcon } from "lucide-react";

interface VendorInfoItemProps {
  icon: LucideIcon;
  label: string;
  value: string;
  iconColorClass?: string;
}

const VendorInfoItem = ({ 
  icon: Icon, 
  label, 
  value, 
  iconColorClass = "text-blue-600" 
}: VendorInfoItemProps) => {
  return (
    <div className="flex gap-3">
      <div className={`h-10 w-10 rounded-full bg-${iconColorClass.replace('text-', '')}-100 flex items-center justify-center`}>
        <Icon className={`h-5 w-5 ${iconColorClass}`} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
};

export default VendorInfoItem;
