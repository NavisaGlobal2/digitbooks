
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import InvitationCard from "./InvitationCard";

const InvalidInvitation: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <InvitationCard title="Invalid Invitation">
      <p className="mb-6 text-center">This invitation link is invalid or has expired.</p>
      <Button onClick={() => navigate("/auth")} className="w-full">Go to Login</Button>
    </InvitationCard>
  );
};

export default InvalidInvitation;
