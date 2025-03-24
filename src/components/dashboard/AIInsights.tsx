
import { AlertTriangle, TrendingUp, TrendingDown, DollarSign, AlertCircle, Lightbulb } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface InsightProps {
  message: string;
  type: "success" | "warning" | "error" | "info";
}

const Insight = ({ message, type }: InsightProps) => {
  const getBgColor = () => {
    switch (type) {
      case "success":
        return "bg-success/10 border-success/30 text-success";
      case "warning":
        return "bg-warning/10 border-warning/30 text-warning";
      case "error":
        return "bg-error/10 border-error/30 text-error";
      case "info":
        return "bg-info/10 border-info/30 text-info";
      default:
        return "bg-muted/10 border-muted/30 text-muted-foreground";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <TrendingUp className="h-4 w-4 mr-2 flex-shrink-0" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />;
      case "info":
        return <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />;
      default:
        return null;
    }
  };

  return (
    <Alert className={`flex items-center ${getBgColor()} border mb-2 py-2`}>
      <AlertDescription className="flex items-center text-xs">
        {getIcon()}
        {message}
      </AlertDescription>
    </Alert>
  );
};

const AIInsights = () => {
  const insights = [
    {
      message: "Revenue increased by 15% this month.",
      type: "success" as const
    },
    {
      message: "Expenses are up 20% compared to last month.",
      type: "error" as const
    },
    {
      message: "Your cash flow is negative; consider reducing expenses.",
      type: "error" as const
    },
    {
      message: "Net profit margin dropped from 30% to 22%.",
      type: "warning" as const
    },
    {
      message: "You spent 10% more on software—review subscriptions.",
      type: "warning" as const
    }
  ];

  return (
    <Card className="border-none shadow-sm h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6 px-6">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="space-y-2">
          {insights.map((insight, index) => (
            <Insight key={index} message={insight.message} type={insight.type} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIInsights;
