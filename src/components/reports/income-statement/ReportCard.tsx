
import React, { forwardRef } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ReportCardProps {
  children?: React.ReactNode;
  isLoading?: boolean;
}

export const ReportCard = forwardRef<HTMLDivElement, ReportCardProps>(
  ({ children, isLoading = false }, ref) => {
    if (isLoading) {
      return (
        <Card className="p-6">
          <Skeleton className="h-8 w-1/3 mb-6" />
          <Skeleton className="h-6 w-full mb-4" />
          <div className="space-y-2">
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </Card>
      );
    }

    return <Card className="p-6" ref={ref}>{children}</Card>;
  }
);

ReportCard.displayName = "ReportCard";
