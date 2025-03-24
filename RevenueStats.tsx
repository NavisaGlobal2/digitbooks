import { Card, CardContent } from "@/components/ui/card";
import { formatNaira } from "@/utils/invoice";

interface RevenueStatsProps {
  totalReceivables: number;
  outstandingReceivables: number;
}

export const RevenueStats = ({ totalReceivables, outstandingReceivables }: RevenueStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-sm font-medium text-muted-foreground">Total receivables</h3>
          <p className="text-2xl font-bold mt-2">{formatNaira(totalReceivables)}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-sm font-medium text-muted-foreground">Outstanding receivables</h3>
          <p className="text-2xl font-bold mt-2">{formatNaira(outstandingReceivables)}</p>
        </CardContent>
      </Card>
    </div>
  );
};