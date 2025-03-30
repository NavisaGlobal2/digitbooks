
import { useState } from "react";
import { createProcessingOptions } from "./utils/processingOptions";

export const useServerProcessing = () => {
  const [isWaitingForServer, setIsWaitingForServer] = useState(false);
  
  return {
    isWaitingForServer,
    setIsWaitingForServer,
    createProcessingOptions
  };
};
