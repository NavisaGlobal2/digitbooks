
import { useState } from "react";
import { Calendar, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import CashflowChart from "@/components/dashboard/CashflowChart";

const CashflowSection = () => {
  const [filterPeriod, setFilterPeriod] = useState("Last six month");

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 pt-3 sm:pt-4 md:pt-6 px-3 sm:px-4 md:px-6">
        <CardTitle className="text-lg sm:text-xl font-semibold mb-2 sm:mb-0">Cashflow Analysis</CardTitle>
        <div className="flex flex-wrap w-full sm:w-auto items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs sm:text-sm h-8 sm:h-9 gap-2 w-full sm:w-auto">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="truncate">{filterPeriod}</span>
          </Button>
          <Button variant="outline" size="sm" className="text-xs sm:text-sm h-8 sm:h-9 w-8 sm:w-9 p-0 ml-auto sm:ml-0">
            <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4">
        <div className="h-[200px] sm:h-[260px] md:h-[320px]">
          <CashflowChart />
        </div>
      </CardContent>
    </Card>
  );
};

export default CashflowSection;
