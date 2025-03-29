
import { useEffect, useState } from "react";
import { getConnectionStats } from "../parsers/edge-function";

/**
 * Component to display connection statistics for edge function
 */
const ConnectionStatistics = () => {
  const [stats, setStats] = useState(() => getConnectionStats());
  
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
  if (stats.failureCount === 0 && stats.successCount > 0) {
    return null;
  }
  
  return (
    <div className="mt-2 text-xs text-gray-500">
      <p className={stats.failureCount > 0 ? "text-amber-600" : "text-green-600"}>
        Edge function status: 
        {stats.failureCount > 0 ? " Limited connectivity" : " Connected"}
        {stats.total > 0 && ` (${stats.successRate}% success rate)`}
      </p>
      {stats.failureCount > 0 && (
        <p className="text-xs text-gray-500 mt-1">
          If upload fails, try using a CSV file for more reliable processing.
        </p>
      )}
    </div>
  );
};

export default ConnectionStatistics;
