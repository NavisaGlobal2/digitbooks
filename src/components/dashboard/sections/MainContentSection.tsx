
import { ReactNode } from "react";

interface MainContentSectionProps {
  leftContent: ReactNode;
  rightContent: ReactNode;
  bottomContent?: ReactNode;
}

const MainContentSection = ({ leftContent, rightContent, bottomContent }: MainContentSectionProps) => {
  return (
    <div className="space-y-2 sm:space-y-3 md:space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3 md:gap-5">
        <div className="col-span-1 md:col-span-2 space-y-2 sm:space-y-3 md:space-y-4">
          {leftContent}
        </div>
        
        <div className="col-span-1 space-y-2 sm:space-y-3 md:space-y-4">
          {rightContent}
        </div>
      </div>
      
      {bottomContent && (
        <div className="w-full">
          {bottomContent}
        </div>
      )}
    </div>
  );
};

export default MainContentSection;
