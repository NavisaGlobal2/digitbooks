
import { AlertTriangle, TrendingUp, TrendingDown, DollarSign, AlertCircle, Lightbulb, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAIInsights } from "@/hooks/useAIInsights";

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
  const { insights, isLoading, error, refreshInsights, isRefreshing } = useAIInsights();

  return (
    <Card className="border-none shadow-sm h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 md:pt-6 px-4 md:px-6">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          AI Insights
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm"
          onClick={refreshInsights}
          disabled={isLoading || isRefreshing}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="sr-only">Refresh insights</span>
        </Button>
      </CardHeader>
      <CardContent className="px-4 md:px-6 pb-6">
        <div className="space-y-2">
          {isLoading || isRefreshing ? (
            // Loading skeleton
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center mb-2">
                <Skeleton className="h-4 w-4 mr-2 rounded-full" />
                <Skeleton className="h-4 flex-1 rounded-md" />
              </div>
            ))
          ) : error ? (
            // Error state
            <Alert className="bg-error/10 border-error/30 text-error border mb-2">
              <AlertDescription className="flex items-center text-xs">
                <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                Failed to load insights. Please try again later.
              </AlertDescription>
            </Alert>
          ) : insights.length > 0 ? (
            // Insights list
            insights.map((insight, index) => (
              <Insight key={index} message={insight.message} type={insight.type} />
            ))
          ) : (
            // Empty state
            <div className="text-center py-4">
              <p className="text-muted-foreground text-sm">No insights available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIInsights;
