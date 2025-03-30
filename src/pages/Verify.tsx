
import React from 'react';
import { VerificationForm } from "@/components/auth/VerificationForm";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";

const Verify = () => {
  const { session } = useAuth();
  const location = useLocation();
  const email = location.state?.email || "";
  
  // If user is already authenticated, redirect to dashboard
  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <VerificationForm email={email} />
    </div>
  );
};

export default Verify;
