
import { useState, useEffect } from 'react';
import { ChartData } from '@/utils/reports/types/reportTypes';

export const useCashflowData = (dateRange: { startDate: Date; endDate: Date } | null) => {
  const [cashflowData, setCashflowData] = useState<ChartData[]>([]);
  
  useEffect(() => {
    // This would ideally fetch real data from your API/database
    // For now, we'll generate sample data
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonth = new Date().getMonth();
    
    // Generate sample data for the last 6 months or for the date range if provided
    let startMonthIndex = currentMonth - 5;
    let endMonthIndex = currentMonth;
    
    if (dateRange) {
      startMonthIndex = dateRange.startDate.getMonth();
      endMonthIndex = dateRange.endDate.getMonth();
      
      // Handle year boundaries
      if (dateRange.endDate.getFullYear() > dateRange.startDate.getFullYear()) {
        endMonthIndex += (dateRange.endDate.getFullYear() - dateRange.startDate.getFullYear()) * 12;
      }
    }
    
    // Ensure we don't go out of bounds for the months array
    if (startMonthIndex < 0) startMonthIndex += 12;
    
    const numMonths = Math.min(6, endMonthIndex - startMonthIndex + 1);
    
    const data: ChartData[] = [];
    for (let i = 0; i < numMonths; i++) {
      const monthIndex = (startMonthIndex + i) % 12;
      const inflow = Math.floor(Math.random() * 10000) + 2000;
      const outflow = Math.floor(Math.random() * 8000) + 1000;
      
      data.push({
        name: months[monthIndex],
        inflow,
        outflow
      });
    }
    
    setCashflowData(data);
  }, [dateRange]);
  
  return { cashflowData };
};
