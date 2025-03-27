
import { useState } from "react";

export interface UploadProgressState {
  progress: number;
  step: string;
  isCancelled: boolean;
}

export const useUploadProgress = () => {
  const [progressState, setProgressState] = useState<UploadProgressState>({
    progress: 0,
    step: "",
    isCancelled: false
  });

  const startProgress = () => {
    setProgressState({
      progress: 0,
      step: "Preparing file...",
      isCancelled: false
    });
    
    const interval = setInterval(() => {
      setProgressState((prev) => {
        // Don't update if processing was cancelled
        if (prev.isCancelled) {
          clearInterval(interval);
          return prev;
        }
        
        // Increment progress, but never reach 100% until the actual process completes
        if (prev.progress < 90) {
          // Update the processing step based on progress
          let newStep = prev.step;
          if (prev.progress === 15) newStep = "Uploading file...";
          if (prev.progress === 35) newStep = "Parsing transactions...";
          if (prev.progress === 60) newStep = "Processing data...";
          if (prev.progress === 80) newStep = "Finalizing...";
          
          return {
            ...prev,
            progress: prev.progress + 5,
            step: newStep
          };
        }
        return prev;
      });
    }, 800);
    
    // Return cleanup function
    return () => {
      clearInterval(interval);
    };
  };

  const resetProgress = () => {
    setProgressState({
      progress: 0,
      step: "",
      isCancelled: false
    });
  };

  const completeProgress = () => {
    setProgressState(prev => ({
      ...prev,
      progress: 100,
      step: "Complete!"
    }));
  };

  const cancelProgress = () => {
    setProgressState(prev => ({
      ...prev,
      isCancelled: true
    }));
    resetProgress();
  };

  const updateProgress = (progress: number, step: string) => {
    setProgressState(prev => ({
      ...prev,
      progress,
      step
    }));
  };

  return {
    ...progressState,
    startProgress,
    resetProgress,
    completeProgress,
    cancelProgress,
    updateProgress
  };
};
