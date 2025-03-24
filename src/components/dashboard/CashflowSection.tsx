
import { useState } from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import CashflowChart from "@/components/dashboard/CashflowChart";

const CashflowSection = () => {
  const [filterPeriod, setFilterPeriod] = useState("Last six month");

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Cashflow Analysis</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="text-sm">
            {filterPeriod}
            <Filter className="h-4 w-4 ml-2 text-muted-foreground" />
          </Button>
        </div>
      </div>
      <Card className="p-6 border-none shadow-sm">
        <div className="h-[350px]">
          <CashflowChart />
        </div>
      </Card>
    </div>
  );
};

export default CashflowSection;
