
import React, { useState, useEffect } from "react";
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

  // Check for password reset or verification parameters in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const type = params.get('type');
    
    if (type === 'recovery' || type === 'signup') {
      // Handle password reset or email verification redirects from Supabase
      // This happens automatically with Supabase Auth
      console.log("Auth redirect detected:", type);
    }
  }, [location.search]);

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
        
        await signup(email, password, name);
        // Move to verification step after signup
        setVerificationStep(true);
      } else {
        await login(email, password);
        toast.success("Login successful!");
        
        // Navigate to dashboard or the page they were trying to access
        const from = location.state?.from?.pathname || "/dashboard";
        navigate(from, { replace: true });
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      // Error message is handled by the auth functions
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setVerificationStep(false);
    setMode('login');
  };

  // For verification code step
  if (verificationStep) {
    return (
      <VerificationForm
        email={email}
        onBack={handleBackToLogin}
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
