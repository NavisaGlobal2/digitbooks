
import React from 'react';
import { Progress } from "@/components/ui/progress";

export interface ProgressIndicatorProps {
  progress: number;
  step: string;
  isVisible: boolean;
}

const ProgressIndicator = ({ progress, step, isVisible }: ProgressIndicatorProps) => {
  if (!isVisible) return null;
  
  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between">
        <p className="text-sm text-muted-foreground">{step}</p>
        <p className="text-sm text-muted-foreground">{Math.round(progress)}%</p>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
};

export default ProgressIndicator;
