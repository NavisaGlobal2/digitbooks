
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RotateCcw, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { getConnectionStats, resetConnectionStats, ConnectionStats } from '../parsers/edge-function';
import { format } from 'date-fns';

interface ConnectionStatsProps {
  className?: string;
  onReset?: () => void;
}

export function ConnectionStats({ className, onReset }: ConnectionStatsProps) {
  const [stats, setStats] = useState<ConnectionStats>(getConnectionStats());
  const [expanded, setExpanded] = useState(false);
  
  useEffect(() => {
    // Update stats every 5 seconds if the component is mounted
    const interval = setInterval(() => {
      setStats(getConnectionStats());
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleReset = () => {
    resetConnectionStats();
    setStats(getConnectionStats());
    if (onReset) onReset();
  };
  
  // If no stats are available yet, don't render anything
  if (stats.successCount === 0 && stats.failCount === 0) {
    return null;
  }
  
  const totalRequests = stats.successCount + stats.failCount;
  
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">AI Service Connection Statistics</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleReset}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset Stats
        </Button>
      </div>
      
      {stats.corsErrorDetected && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>CORS Error Detected</AlertTitle>
          <AlertDescription>
            There appears to be a cross-origin resource sharing issue connecting to the AI service.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 p-4 rounded-lg">
          <div className="text-sm text-muted-foreground">Total Requests</div>
          <div className="text-2xl font-bold">{totalRequests}</div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm text-muted-foreground">Success Rate</div>
          <div className="text-2xl font-bold text-green-700">{stats.successRate?.toFixed(0)}%</div>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-sm text-muted-foreground">Failure Rate</div>
          <div className="text-2xl font-bold text-red-700">{stats.failureRate?.toFixed(0)}%</div>
        </div>
        
        <div className="bg-slate-50 p-4 rounded-lg">
          <div className="text-sm text-muted-foreground">Endpoint</div>
          <div className="text-sm font-medium truncate" title={stats.endpoint}>
            {stats.endpoint ? (stats.endpoint.length > 30 ? `...${stats.endpoint.slice(-30)}` : stats.endpoint) : "N/A"}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.lastSuccess && (
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
              <div className="text-sm text-muted-foreground">Last Successful Request</div>
            </div>
            <div className="text-sm font-medium">
              {format(new Date(stats.lastSuccess), 'MMM d, yyyy HH:mm:ss')}
            </div>
          </div>
        )}
        
        {stats.lastFail && (
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center">
              <XCircle className="h-4 w-4 text-red-600 mr-2" />
              <div className="text-sm text-muted-foreground">Last Failed Request</div>
            </div>
            <div className="text-sm font-medium">
              {format(new Date(stats.lastFail), 'MMM d, yyyy HH:mm:ss')}
            </div>
          </div>
        )}
      </div>
      
      {(stats.failureReasons && Object.keys(stats.failureReasons).length > 0) && (
        <div className="bg-slate-50 p-4 rounded-lg">
          <div className="text-sm font-medium mb-2">Failure Reasons</div>
          <div className="space-y-1">
            {Object.entries(stats.failureReasons).map(([reason, count]) => (
              <div key={reason} className="flex justify-between items-center text-sm">
                <span className="capitalize">{reason.replace('_', ' ')}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {stats.corsErrorDetected && (
        <div className="text-sm text-gray-500 mt-2">
          <p>
            CORS errors typically occur when the browser blocks requests to different domains for security reasons. 
            This may indicate an issue with the server configuration.
          </p>
        </div>
      )}
      
      {expanded && stats.errors.length > 0 && (
        <div className="bg-slate-50 p-4 rounded-lg">
          <div className="text-sm font-medium mb-2">Recent Errors</div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {stats.errors.map((error, index) => (
              <div key={index} className="text-xs p-2 bg-slate-100 rounded">
                {error}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {stats.errors.length > 0 && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setExpanded(!expanded)} 
          className="w-full text-sm"
        >
          {expanded ? "Hide Detailed Errors" : "Show Detailed Errors"}
        </Button>
      )}
    </div>
  );
}
