
import React, { ReactNode } from "react";

interface PageContentProps {
  children: ReactNode;
}

const PageContent = ({ children }: PageContentProps) => {
  return (
    <div className="flex-1 overflow-auto p-2 sm:p-4 md:p-6 bg-background/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto space-y-3 sm:space-y-4 md:space-y-6 w-full">
        {children}
      </div>
    </div>
  );
};

export default PageContent;
