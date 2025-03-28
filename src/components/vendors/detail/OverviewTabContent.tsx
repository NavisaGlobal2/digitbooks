
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNaira } from "@/utils/invoice/formatters";

interface OverviewTabContentProps {
  vendorName: string;
  transactionCount: number;
  totalSpent: number;
}

const OverviewTabContent = ({ vendorName, transactionCount, totalSpent }: OverviewTabContentProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500">
          {vendorName} has been involved in {transactionCount} transactions 
          totaling {formatNaira(totalSpent)}.
        </p>
      </CardContent>
    </Card>
  );
};

export default OverviewTabContent;
