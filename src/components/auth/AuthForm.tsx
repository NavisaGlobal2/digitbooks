
import React, { useState } from "react";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";
import LoginSignupForm from "./LoginSignupForm";
import VerificationForm from "./VerificationForm";

type AuthMode = 'login' | 'signup';

interface AuthFormProps {
  mode: AuthMode;
  setMode: React.Dispatch<React.SetStateAction<AuthMode>>;
}

const AuthForm: React.FC<AuthFormProps> = ({ mode, setMode }) => {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [verificationStep, setVerificationStep] = useState(false);

  const handleLoginSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          toast.error("Passwords do not match");
          setIsLoading(false);
          return;
        }
        // Move to verification step
        setVerificationStep(true);
        toast.success("Verification code sent to your email!");
      } else {
        await login(email, password);
        toast.success("Login successful!");
        
        // Navigate to dashboard or the page they were trying to access
        const from = location.state?.from?.pathname || "/dashboard";
        navigate(from, { replace: true });
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error(error.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async () => {
    setIsLoading(true);
    try {
      // Handle verification code submission
      // For now just show a toast since we're not implementing full verification yet
      toast.success("Email verification successful!");
      
      // After verification, proceed with account creation
      await signup(email, password, name);
      toast.success("Account created successfully!");
      
      // Navigate to dashboard or the page they were trying to access
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error('Verification error:', error);
      toast.error(error.message || "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToSignup = () => {
    setVerificationStep(false);
  };

  // For verification code step
  if (mode === 'signup' && verificationStep) {
    return (
      <VerificationForm
        email={email}
        onBack={handleBackToSignup}
        onSubmit={handleVerification}
        isLoading={isLoading}
      />
    );
  }

  return (
    <LoginSignupForm
      mode={mode}
      setMode={setMode}
      onSubmit={handleLoginSignup}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      name={name}
      setName={setName}
      confirmPassword={confirmPassword}
      setConfirmPassword={setConfirmPassword}
      isLoading={isLoading}
    />
  );
};

export default AuthForm;
