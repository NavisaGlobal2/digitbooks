
import { ArrowDown, ArrowUp, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const TransactionsSection = () => {
  const transactions = [
    { type: "income", title: "Client Payment", date: "May 10, 2023", amount: 1280 },
    { type: "expense", title: "Software Subscription", date: "May 8, 2023", amount: 420 },
    { type: "income", title: "Consulting Fee", date: "May 5, 2023", amount: 850 },
    { type: "expense", title: "Office Supplies", date: "May 3, 2023", amount: 125 }
  ];

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6 px-6">
        <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-4">
        <div className="space-y-4">
          {transactions.map((transaction, index) => (
            <div key={index} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                  {transaction.type === 'income' ? 
                    <ArrowDown className="h-4 w-4 text-green-600" /> : 
                    <ArrowUp className="h-4 w-4 text-red-600" />
                  }
                </div>
                <div>
                  <p className="font-medium text-sm">{transaction.title}</p>
                  <p className="text-xs text-muted-foreground">{transaction.date}</p>
                </div>
              </div>
              <p className={`font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
        <Button variant="ghost" className="w-full mt-4 text-primary text-sm flex items-center justify-center gap-1">
          <span>View all transactions</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default TransactionsSection;
