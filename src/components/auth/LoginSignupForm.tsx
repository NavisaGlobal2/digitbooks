
import React from "react";
import { Button } from "@/components/ui/button";
import SocialLoginButton from "./SocialLoginButton";
import PasswordField from "./PasswordField";
import EmailField from "./EmailField";
import NameField from "./NameField";
import FormDivider from "./FormDivider";
import AuthFormFooter from "./AuthFormFooter";

type AuthMode = 'login' | 'signup';

interface LoginSignupFormProps {
  mode: AuthMode;
  setMode: React.Dispatch<React.SetStateAction<AuthMode>>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  confirmPassword: string;
  setConfirmPassword: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
}

const LoginSignupForm: React.FC<LoginSignupFormProps> = ({
  mode,
  setMode,
  onSubmit,
  email,
  setEmail,
  password,
  setPassword,
  name,
  setName,
  confirmPassword,
  setConfirmPassword,
  isLoading
}) => {
  const handleSocialLogin = () => {
    // Social login implementation will go here
    console.log("Social login clicked");
  };

  return (
    <div className="w-full max-w-sm px-4">
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          {mode === 'signup' ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          {mode === 'signup' ? 'Get started with DigitBooks' : 'Sign in to continue to your account'}
        </p>
      </div>

      <div className="mb-6 sm:mb-8">
        <SocialLoginButton 
          icon="https://www.google.com/favicon.ico"
          altText="Google"
          provider="Google"
          isLoading={isLoading}
          onClick={handleSocialLogin}
        />
      </div>

      <FormDivider text="or continue with email" />

      <form onSubmit={onSubmit} className="space-y-3 sm:space-y-4">
        {mode === 'signup' && (
          <NameField 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            disabled={isLoading} 
          />
        )}

        <EmailField 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          disabled={isLoading} 
        />

        <PasswordField 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={mode === 'signup' ? "Create password" : "Enter password"}
          disabled={isLoading}
        />

        {mode === 'signup' && (
          <PasswordField 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter password"
            disabled={isLoading}
          />
        )}

        <Button 
          type="submit" 
          className="w-full h-10 sm:h-12 bg-green-500 hover:bg-green-600 text-white transition-all duration-300 transform hover:translate-y-[-2px] hover:shadow-lg text-sm sm:text-base"
          disabled={isLoading}
        >
          {isLoading ? 'Please wait...' : (mode === 'signup' ? 'Create Account' : 'Sign in')}
        </Button>
      </form>

      <AuthFormFooter 
        mode={mode} 
        setMode={setMode} 
        isLoading={isLoading} 
      />
    </div>
  );
};

export default LoginSignupForm;
