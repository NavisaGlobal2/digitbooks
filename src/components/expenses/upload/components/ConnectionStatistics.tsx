
import React from 'react';
import { getConnectionStats, getTechnicalErrorDetails } from '../parsers/edge-function';
import { formatDistanceToNow } from 'date-fns';

export const ConnectionStatistics = () => {
  const stats = getConnectionStats();
  const technicalDetails = getTechnicalErrorDetails();
  const totalAttempts = stats.successCount + stats.failCount;
  
  // Calculate success rate
  const successRate = totalAttempts > 0 
    ? Math.round((stats.successCount / totalAttempts) * 100) 
    : 0;
  
  // Check for OCR.space configuration errors
  const hasOcrConfigError = stats.errors && stats.errors.some(error => 
    error.includes('OCR.space API key is not configured')
  );
  
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
        
        {hasOcrConfigError && (
          <div className="mt-2 p-2 border border-amber-200 bg-amber-50 rounded text-amber-800">
            <p className="font-medium">OCR.space Configuration Issue</p>
            <p className="mt-1">
              The OCR.space API key needs to be configured in your Supabase project.
              Set the <code className="bg-amber-100 p-1 rounded">OCR_SPACE_API_KEY</code> environment variable 
              in your Supabase Edge Function settings.
            </p>
            <p className="mt-1">
              You can get a free OCR.space API key at <a href="https://ocr.space/ocrapi" target="_blank" rel="noopener noreferrer" className="underline text-blue-600">ocr.space</a>.
            </p>
          </div>
        )}
        
        {stats.failCount > 0 && stats.errors && stats.errors.length > 0 && !hasOcrConfigError && (
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

export default ConnectionStatistics;
