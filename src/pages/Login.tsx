
import React from 'react';
import { AuthForm } from "@/components/auth/AuthForm";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";

const Login = () => {
  const { session } = useAuth();
  
  // If user is already authenticated, redirect to dashboard
  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AuthForm mode="login" />
    </div>
  );
};

export default Login;
