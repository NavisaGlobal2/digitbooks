
import { ArrowDown, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const TransactionsSection = () => {
  return (
    <Card className="p-6 border-none shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${i % 2 === 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                {i % 2 === 0 ? 
                  <ArrowDown className="h-5 w-5 text-green-600" /> : 
                  <ArrowUp className="h-5 w-5 text-red-600" />
                }
              </div>
              <div>
                <p className="font-medium">{i % 2 === 0 ? 'Income' : 'Expense'}</p>
                <p className="text-sm text-muted-foreground">May 10, 2023</p>
              </div>
            </div>
            <p className={`font-medium ${i % 2 === 0 ? 'text-green-600' : 'text-red-600'}`}>
              {i % 2 === 0 ? '+' : '-'}${(Math.floor(Math.random() * 1000) + 200).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
      <Button variant="ghost" className="w-full mt-4 text-primary">
        View all transactions
      </Button>
    </Card>
  );
};

export default TransactionsSection;
