
import { AlertTriangle, TrendingUp, TrendingDown, DollarSign, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
        return <TrendingUp className="h-4 w-4 mr-2" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 mr-2" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 mr-2" />;
      case "info":
        return <DollarSign className="h-4 w-4 mr-2" />;
      default:
        return null;
    }
  };

  return (
    <Alert className={`flex items-center ${getBgColor()} border mb-2`}>
      <AlertDescription className="flex items-center text-sm">
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
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">AI Insights</h2>
      </div>
      <div className="bg-white p-5 rounded-lg border shadow-sm">
        {insights.map((insight, index) => (
          <Insight key={index} message={insight.message} type={insight.type} />
        ))}
      </div>
    </div>
  );
};

export default AIInsights;
