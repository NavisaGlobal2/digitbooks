
import { useState, useRef } from "react";

export const useUploadProgress = () => {
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState("");
  const [isCancelled, setIsCancelled] = useState(false);
  const [isWaitingForServer, setIsWaitingForServer] = useState(false);
  const animationFrame = useRef<number | null>(null);

  const resetProgress = () => {
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = null;
    }
    setProgress(0);
    setStep("");
    setIsCancelled(false);
    setIsWaitingForServer(false);
  };

  const cancelProgress = () => {
    setIsCancelled(true);
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = null;
    }
    setProgress(0);
    setStep("");
    setIsWaitingForServer(false);
  };

  const completeProgress = () => {
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = null;
    }
    setProgress(100);
    setStep("Complete");
    setIsWaitingForServer(false);
  };

  const updateProgress = (newProgress: number, newStep: string) => {
    setProgress(newProgress);
    setStep(newStep);
  };

  // Run the progress animation
  const startProgress = () => {
    let currentProgress = 0;
    const totalSteps = 90; // Only go up to 90%, leave 90-100% for server response
    const timePerStep = 50; // milliseconds
    
    // Start with file reading
    setStep("Reading file...");
    
    const animateProgress = () => {
      if (isCancelled) {
        if (animationFrame.current) {
          cancelAnimationFrame(animationFrame.current);
          animationFrame.current = null;
        }
        return;
      }
      
      currentProgress += 1;
      
      // Change step description at different stages
      if (currentProgress === 20) {
        setStep("Validating file...");
      } else if (currentProgress === 40) {
        setStep("Extracting data...");
      } else if (currentProgress === 60) {
        setStep("Processing transactions...");
      } else if (currentProgress === 80) {
        setStep("Finalizing...");
      } else if (currentProgress === 90) {
        setStep("Waiting for server...");
        setIsWaitingForServer(true);
        
        // Stop at 90% and wait for server response
        if (animationFrame.current) {
          cancelAnimationFrame(animationFrame.current);
          animationFrame.current = null;
        }
        return;
      }
      
      setProgress(currentProgress);
      
      if (currentProgress < totalSteps) {
        // Schedule next frame based on timePerStep
        const nextUpdate = () => {
          animationFrame.current = requestAnimationFrame(animateProgress);
        };
        setTimeout(nextUpdate, timePerStep);
      }
    };
    
    // Start animation
    animationFrame.current = requestAnimationFrame(animateProgress);
    
    // Return function to stop animation
    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
        animationFrame.current = null;
      }
    };
  };

  return {
    progress,
    step,
    isCancelled,
    isWaitingForServer,
    setIsWaitingForServer,
    startProgress,
    resetProgress,
    completeProgress,
    cancelProgress,
    updateProgress
  };
};
