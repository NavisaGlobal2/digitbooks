
import { getConnectionStats } from "../parsers/edge-function";
import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Server, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Component to display connection statistics for edge function calls
 */
export const ConnectionStats = () => {
  const [stats, setStats] = useState(getConnectionStats());
  const [expanded, setExpanded] = useState(false);
  
  const updateStats = () => {
    setStats(getConnectionStats());
  };
  
  // Update stats every 5 seconds
  useEffect(() => {
    const interval = setInterval(updateStats, 5000);
    return () => clearInterval(interval);
  }, []);
  
  const hasFailures = stats.failureCount > 0;
  
  return (
    <Card className={hasFailures ? "border-orange-300" : "border-green-300"}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center">
            {hasFailures ? 
              <WifiOff className="w-4 h-4 text-orange-500 mr-2" /> : 
              <Server className="w-4 h-4 text-green-500 mr-2" />
            }
            Server Connection Status
          </div>
          <Button
            variant="ghost" 
            size="sm" 
            onClick={updateStats}
            className="h-6 w-6 p-0"
            title="Refresh connection stats"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm pt-0">
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Success rate:</span>
            <span 
              className={
                stats.failureRate > 20 
                  ? "text-red-500 font-medium" 
                  : stats.failureRate > 5 
                    ? "text-orange-500 font-medium" 
                    : "text-green-500 font-medium"
              }
            >
              {100 - stats.failureRate}%
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Total attempts:</span>
            <span>{stats.total}</span>
          </div>
          
          {hasFailures && (
            <>
              <div className="flex justify-between">
                <span>Failed attempts:</span>
                <span className="text-orange-500">{stats.failureCount}</span>
              </div>
              
              {stats.lastFailure && (
                <div className="flex justify-between">
                  <span>Last failure:</span>
                  <span>{new Date(stats.lastFailure).toLocaleTimeString()}</span>
                </div>
              )}
              
              {expanded && Object.keys(stats.failureReasons).length > 0 && (
                <div className="mt-2 border-t pt-2">
                  <p className="font-medium mb-1">Failure reasons:</p>
                  <ul className="text-xs space-y-1">
                    {Object.entries(stats.failureReasons).map(([reason, count]) => (
                      <li key={reason} className="flex justify-between">
                        <span>{reason.replace(/_/g, ' ')}:</span>
                        <span>{count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                className="text-xs w-full mt-1"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? "Show less" : "Show details"}
              </Button>
              
              {!expanded && (
                <div className="text-xs text-amber-600 mt-1">
                  <p>Tips:</p>
                  <ul className="list-disc pl-4">
                    <li>Try using a CSV file format instead</li>
                    <li>Check your internet connection</li>
                    <li>Try disabling any VPN or proxy</li>
                    <li>The server might be temporarily unavailable</li>
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectionStats;
