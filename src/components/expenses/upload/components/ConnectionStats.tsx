
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowDownCircle, ExternalLink, RefreshCw, StopCircle, XCircle } from "lucide-react";
import { getTechnicalErrorDetails, getConnectionStats, resetStats } from "../parsers/edge-function/connectionStats";

const ConnectionStats = ({ isVisible = true }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  
  if (!isVisible) return null;
  
  const stats = getConnectionStats();
  const technicalDetails = getTechnicalErrorDetails();
  
  const statusColor = stats.failCount > 0 
    ? "bg-red-100 text-red-800" 
    : stats.successCount > 0 
      ? "bg-green-100 text-green-800" 
      : "bg-gray-100 text-gray-800";
  
  const resetStatsHandler = () => {
    resetStats();
    setShowDetails(false);
    setShowTechnicalDetails(false);
  };
  
  return (
    <div className="mt-4 rounded-md border p-4 text-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="font-medium">Edge function connection status:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
            {stats.corsErrorDetected ? "CORS Error" : 
              stats.failCount > 0 ? "Connection Issues" : 
              stats.successCount > 0 ? "Connected" : "No Connections"}
          </span>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? "Hide Details" : "Show Details"}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetStatsHandler}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Reset Stats
          </Button>
        </div>
      </div>
      
      {showDetails && (
        <div className="mt-3 p-3 bg-gray-50 rounded-md">
          <h4 className="font-medium mb-2">Connection Statistics</h4>
          <ul className="space-y-1">
            <li><span className="font-medium">Success:</span> {stats.successCount} ({stats.successRate}%)</li>
            <li><span className="font-medium">Failures:</span> {stats.failCount} ({stats.failureRate}%)</li>
            <li>
              <span className="font-medium">Endpoint:</span> {stats.endpoint || "Not available"}
              {stats.endpoint && (
                <button 
                  className="ml-1 text-blue-600 hover:text-blue-800"
                  onClick={() => navigator.clipboard.writeText(stats.endpoint || "")}
                >
                  (Copy)
                </button>
              )}
            </li>
            
            {stats.lastFail && (
              <li><span className="font-medium">Last failure:</span> {new Date(stats.lastFail).toLocaleString()}</li>
            )}
            
            {stats.failCount > 0 && (
              <li>
                <span className="font-medium">Failure reasons:</span> 
                <ul className="ml-4 list-disc">
                  {Object.entries(stats.failureReasons || {}).map(([reason, count]) => (
                    <li key={reason}>{reason}: {count as number}</li>
                  ))}
                </ul>
              </li>
            )}
            
            {stats.corsErrorDetected && (
              <li className="text-red-600">
                <span className="font-medium">CORS error detected!</span> 
                <p className="mt-1 text-xs">
                  CORS issues are usually server-side configuration problems. This happens when the server doesn't allow cross-origin requests from your browser.
                </p>
              </li>
            )}
            
            <li className="mt-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              >
                {showTechnicalDetails ? "Hide Technical Details" : "Show Technical Details"}
              </Button>
            </li>
            
            {showTechnicalDetails && (
              <div className="mt-2 p-3 bg-gray-100 rounded-md overflow-x-auto">
                <h5 className="font-medium mb-1 text-xs">Technical Details:</h5>
                <pre className="text-xs whitespace-pre-wrap">
                  {JSON.stringify(technicalDetails, null, 2)}
                </pre>
              </div>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ConnectionStats;
