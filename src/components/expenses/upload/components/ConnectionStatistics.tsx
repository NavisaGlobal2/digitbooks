
import { Button } from "@/components/ui/button";
import { getConnectionStats } from "../parsers/edgeFunctionParser";
import { useState, useEffect } from "react";
import { RefreshCw, ServerOff } from "lucide-react";

const ConnectionStatistics = () => {
  const [stats, setStats] = useState(getConnectionStats());
  const [showStats, setShowStats] = useState(false);

  const refreshStats = () => {
    setStats(getConnectionStats());
  };

  useEffect(() => {
    // Refresh stats every 10 seconds if visible
    if (showStats) {
      const interval = setInterval(refreshStats, 10000);
      return () => clearInterval(interval);
    }
  }, [showStats]);

  if (stats.attempts === 0 && !showStats) {
    return null;
  }

  return (
    <div className="mt-4">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setShowStats(!showStats)}
        className="flex items-center gap-2 text-xs"
      >
        <ServerOff className="w-3 h-3" />
        {showStats ? "Hide" : "Show"} Connection Statistics
        {stats.failures > 0 && <span className="bg-red-500 text-white px-1.5 rounded-full text-xs">{stats.failures}</span>}
      </Button>
      
      {showStats && (
        <div className="mt-2 p-4 border rounded-md bg-slate-50 text-sm">
          <div className="flex justify-between mb-2">
            <h3 className="font-medium">Edge Function Connection Statistics</h3>
            <Button variant="ghost" size="sm" onClick={refreshStats} className="h-6 w-6 p-0">
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <div>Total connection attempts:</div>
            <div className="font-mono">{stats.attempts}</div>
            
            <div>Failed connections:</div>
            <div className="font-mono text-red-500">{stats.failures}</div>
            
            <div>Failure rate:</div>
            <div className="font-mono">{stats.failureRate}%</div>
            
            <div>Last failure:</div>
            <div className="font-mono">{stats.lastFailure ? new Date(stats.lastFailure).toLocaleString() : 'N/A'}</div>
          </div>
          
          {Object.keys(stats.failureReasons).length > 0 && (
            <>
              <h4 className="font-medium mt-3 mb-1">Failure Reasons:</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {Object.entries(stats.failureReasons).sort((a, b) => b[1] - a[1]).map(([reason, count]) => (
                  <>
                    <div>{reason.replace(/_/g, ' ')}:</div>
                    <div className="font-mono">{count}</div>
                  </>
                ))}
              </div>
            </>
          )}
          
          <div className="mt-3 text-xs text-gray-500">
            <p>Alternatives to Edge Functions:</p>
            <ul className="list-disc pl-5 mt-1">
              <li>Use client-side processing for CSV files</li>
              <li>Host a dedicated API server (e.g., Express.js on a VPS)</li>
              <li>Use AWS Lambda or Google Cloud Functions for better scaling</li>
              <li>Consider Firebase Functions as an alternative</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatistics;
