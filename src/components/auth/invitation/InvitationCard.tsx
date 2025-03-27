
import React from "react";
import { Card } from "@/components/ui/card";

interface InvitationCardProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const InvitationCard: React.FC<InvitationCardProps> = ({ 
  children, 
  title, 
  subtitle 
}) => (
  <div className="h-screen flex items-center justify-center p-4 bg-gray-50">
    <Card className="p-8 max-w-md w-full">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
      </div>
      {children}
    </Card>
  </div>
);

export default InvitationCard;
