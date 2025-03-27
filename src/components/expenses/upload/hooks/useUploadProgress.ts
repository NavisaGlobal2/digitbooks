
import { useState, useRef, useCallback } from "react";

/**
 * Custom hook to manage file upload progress state and animations
 */
export const useUploadProgress = () => {
  // Progress state variables
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState("");
  const [isCancelled, setIsCancelled] = useState(false);
  const [isWaitingForServer, setIsWaitingForServer] = useState(false);
  const animationFrame = useRef<number | null>(null);

  /**
   * Reset all progress state and cancel animations
   */
  const resetProgress = useCallback(() => {
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = null;
    }
    setProgress(0);
    setStep("");
    setIsCancelled(false);
    setIsWaitingForServer(false);
  }, []);

  /**
   * Cancel ongoing progress and animations
   */
  const cancelProgress = useCallback(() => {
    setIsCancelled(true);
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = null;
    }
    setProgress(0);
    setStep("");
    setIsWaitingForServer(false);
  }, []);

  /**
   * Complete the progress animation
   */
  const completeProgress = useCallback(() => {
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = null;
    }
    setProgress(100);
    setStep("Complete");
    setIsWaitingForServer(false);
  }, []);

  /**
   * Update progress with a new value and step description
   */
  const updateProgress = useCallback((newProgress: number, newStep: string) => {
    setProgress(newProgress);
    setStep(newStep);
  }, []);

  /**
   * Get a specific step description based on progress percentage
   */
  const getStepDescription = useCallback((currentProgress: number): string => {
    if (currentProgress < 20) return "Reading file...";
    if (currentProgress < 40) return "Validating file...";
    if (currentProgress < 60) return "Extracting data...";
    if (currentProgress < 80) return "Processing transactions...";
    if (currentProgress < 90) return "Finalizing...";
    return "Waiting for server...";
  }, []);

  /**
   * Animate progress from 0 to 90% (leaving the last 10% for server response)
   */
  const animateProgress = useCallback((currentProgress: number, timePerStep: number) => {
    if (isCancelled) {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
        animationFrame.current = null;
      }
      return;
    }

    const newProgress = currentProgress + 1;
    const newStep = getStepDescription(newProgress);
    
    setProgress(newProgress);
    setStep(newStep);
    
    if (newProgress === 90) {
      setIsWaitingForServer(true);
      
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
        animationFrame.current = null;
      }
      return;
    }
    
    if (newProgress < 90) {
      const nextUpdate = () => {
        animationFrame.current = requestAnimationFrame(() => 
          animateProgress(newProgress, timePerStep)
        );
      };
      setTimeout(nextUpdate, timePerStep);
    }
  }, [isCancelled, getStepDescription]);

  /**
   * Start the progress animation from 0 to 90%
   */
  const startProgress = useCallback(() => {
    const timePerStep = 50; // milliseconds
    setStep("Reading file...");
    
    // Start animation
    animationFrame.current = requestAnimationFrame(() => 
      animateProgress(0, timePerStep)
    );
    
    // Return function to stop animation
    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
        animationFrame.current = null;
      }
    };
  }, [animateProgress]);

  return {
    // State variables
    progress,
    step,
    isCancelled,
    isWaitingForServer,
    setIsWaitingForServer,
    
    // Control functions
    startProgress,
    resetProgress,
    completeProgress,
    cancelProgress,
    updateProgress
  };
};
