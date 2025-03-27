
import React from "react";

const InvitationLoading: React.FC = () => (
  <div className="h-screen flex items-center justify-center">
    <div className="text-center">
      <p className="text-xl mb-2">Validating invitation...</p>
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
    </div>
  </div>
);

export default InvitationLoading;
