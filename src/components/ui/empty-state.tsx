
import { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <div className="bg-gray-100 p-6 rounded-full mb-6 flex items-center justify-center">
        {icon}
      </div>
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-muted-foreground mb-8 max-w-md">{description}</p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        {primaryAction && (
          <button
            onClick={primaryAction.onClick}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-md transition-colors"
          >
            {primaryAction.label}
          </button>
        )}
        
        {secondaryAction && (
          <button
            onClick={secondaryAction.onClick}
            className="border border-gray-300 hover:bg-gray-50 px-6 py-2.5 rounded-md transition-colors"
          >
            {secondaryAction.label}
          </button>
        )}
      </div>
    </div>
  );
}
