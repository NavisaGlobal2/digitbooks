
import { useState, useRef } from "react";

export const useProcessingState = () => {
  const [processingInProgress, setProcessingInProgress] = useState(false);
  const [uploading, setUploading] = useState(false);
  const processingFileRef = useRef<string | null>(null);

  const startProcessing = (file: File) => {
    setUploading(true);
    setProcessingInProgress(true);
    processingFileRef.current = `${file.name}-${file.size}-${file.lastModified}`;
  };

  const stopProcessing = () => {
    setUploading(false);
    setProcessingInProgress(false);
    processingFileRef.current = null;
  };

  const isProcessingFile = (file: File): boolean => {
    return processingFileRef.current === `${file.name}-${file.size}-${file.lastModified}`;
  };

  return {
    uploading,
    processingInProgress,
    processingFileRef,
    startProcessing,
    stopProcessing,
    isProcessingFile
  };
};
