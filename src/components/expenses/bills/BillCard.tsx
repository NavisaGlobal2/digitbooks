
import { formatNaira } from "@/utils/invoice/formatters";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface BillCardProps {
  id: string;
  title: string;
  amount: number;
  daysLeft: number;
  icon: LucideIcon;
  onPayBill?: () => void;
}

const BillCard = ({ id, title, amount, daysLeft, icon: Icon, onPayBill }: BillCardProps) => {
  return (
    <Card key={id} className="border border-border hover:border-primary/20 transition-all">
      <CardContent className="p-4">
        <div className="flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-3">
            <Icon className="h-5 w-5 text-purple-600" />
          </div>
          <p className="font-medium text-sm mb-1">{title}</p>
          <p className="text-xs text-muted-foreground mb-2">
            {daysLeft > 0 ? `Due in ${daysLeft} days` : 'Due today'}
          </p>
          <p className="font-bold text-base break-words">{formatNaira(amount)}</p>
          <Button 
            variant="ghost" 
            size="sm" 
            className="mt-2 text-green-500 text-xs"
            onClick={onPayBill}
          >
            Pay bill
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BillCard;
