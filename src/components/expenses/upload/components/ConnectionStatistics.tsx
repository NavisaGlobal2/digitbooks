
import React from 'react';
import { getConnectionStats } from '../parsers/edge-function';
import { formatDistanceToNow } from 'date-fns';

export const ConnectionStatistics = () => {
  const stats = getConnectionStats();
  const totalAttempts = stats.successCount + stats.failCount;
  
  // Calculate success rate
  const successRate = totalAttempts > 0 
    ? Math.round((stats.successCount / totalAttempts) * 100) 
    : 0;
  
  return (
    <div className="mt-4 p-3 border rounded-md bg-gray-50">
      <h4 className="text-sm font-medium mb-2">Connection Statistics</h4>
      <div className="text-xs space-y-1">
        <p>
          <span className="font-medium">Total requests:</span> {totalAttempts}
        </p>
        <p>
          <span className="font-medium">Successful:</span> {stats.successCount}
        </p>
        <p>
          <span className="font-medium">Failed:</span> {stats.failCount}
        </p>
        
        {stats.lastSuccess && (
          <p>
            <span className="font-medium">Last success:</span> {formatDistanceToNow(stats.lastSuccess, { addSuffix: true })}
          </p>
        )}
        
        <p>
          <span className="font-medium">Success rate:</span> {successRate}%
          <span className="ml-2 inline-block w-20 h-2 bg-gray-200 rounded-full">
            <span 
              className={`block h-2 rounded-full ${successRate > 50 ? 'bg-green-500' : 'bg-orange-500'}`}
              style={{ width: `${successRate}%` }}
            />
          </span>
        </p>
        
        {stats.failCount > 0 && (
          <div>
            <p className="font-medium mt-1">Recent errors:</p>
            <ul className="list-disc list-inside">
              {stats.errors.slice(0, 3).map((error, index) => (
                <li key={index} className="text-red-600 truncate">{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
