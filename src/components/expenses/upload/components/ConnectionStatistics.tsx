
import { useEffect, useState } from "react";
import { getConnectionStats } from "../parsers/edge-function";
import type { ConnectionStats } from "../parsers/edge-function/connectionStats";

/**
 * Component to display connection statistics for edge function
 */
const ConnectionStatistics = () => {
  const [stats, setStats] = useState<ConnectionStats>(() => getConnectionStats());
  
  useEffect(() => {
    // Update stats every 3 seconds
    const interval = setInterval(() => {
      setStats(getConnectionStats());
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Don't show anything if no connections have been attempted
  if (stats.total === 0) {
    return null;
  }
  
  // Don't show status if everything is working well
  if (stats.failCount === 0 && stats.successCount > 0) {
    return null;
  }
  
  return (
    <div className="mt-2 text-xs text-gray-500">
      <p className={stats.failCount > 0 ? "text-amber-600" : "text-green-600"}>
        Edge function status: 
        {stats.failCount > 0 ? " Limited connectivity" : " Connected"}
        {stats.total > 0 && ` (${stats.successRate}% success rate)`}
      </p>
      {stats.failCount > 0 && (
        <p className="text-xs text-gray-500 mt-1">
          If upload fails, try using a CSV file for more reliable processing.
        </p>
      )}
    </div>
  );
};

export default ConnectionStatistics;
