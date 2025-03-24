
import { ReactNode } from "react";

interface MainContentSectionProps {
  leftContent: ReactNode;
  rightContent: ReactNode;
}

const MainContentSection = ({ leftContent, rightContent }: MainContentSectionProps) => {
  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 space-y-6">
        {leftContent}
      </div>
      
      <div className="space-y-6">
        {rightContent}
      </div>
    </div>
  );
};

export default MainContentSection;
