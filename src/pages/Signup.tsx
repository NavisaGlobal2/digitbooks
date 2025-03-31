
import React from 'react';
import AuthForm from "@/components/auth/AuthForm";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";

const Signup = () => {
  const { user, isAuthenticated } = useAuth();
  
  // If user is already authenticated, redirect to dashboard
  if (isAuthenticated && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AuthForm mode="signup" />
    </div>
  );
};

export default Signup;
