
import React from "react";
import { Card } from "@/components/ui/card";

const AcceptingInvitation: React.FC = () => (
  <div className="h-screen flex items-center justify-center p-4">
    <Card className="p-8 max-w-md w-full">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Accepting Invitation</h1>
        <p className="mb-6">You're already signed in with the correct account. Finalizing your team membership...</p>
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
      </div>
    </Card>
  </div>
);

export default AcceptingInvitation;
