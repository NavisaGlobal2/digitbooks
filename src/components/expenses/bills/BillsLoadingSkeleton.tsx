
import { Card, CardContent } from "@/components/ui/card";

const BillsLoadingSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((_, index) => (
        <Card key={index} className="border border-border animate-pulse">
          <CardContent className="p-4 h-[140px]">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-gray-200"></div>
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
              <div className="h-3 w-20 bg-gray-200 rounded"></div>
              <div className="h-5 w-16 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default BillsLoadingSkeleton;
