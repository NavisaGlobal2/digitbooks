
import { ReactNode } from "react";

interface MainContentSectionProps {
  leftContent: ReactNode;
  rightContent: ReactNode;
}

const MainContentSection = ({ leftContent, rightContent }: MainContentSectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      <div className="col-span-1 md:col-span-2 space-y-4 md:space-y-6">
        {leftContent}
      </div>
      
      <div className="col-span-1 space-y-4 md:space-y-6">
        {rightContent}
      </div>
    </div>
  );
};

export default MainContentSection;
