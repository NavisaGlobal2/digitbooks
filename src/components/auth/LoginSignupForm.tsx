
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        <Button 
          variant="outline" 
          className="w-full h-10 sm:h-12 relative hover:bg-gray-50 transition-all duration-300 text-sm sm:text-base"
          disabled={isLoading}
        >
          <img 
            src="https://www.google.com/favicon.ico" 
            alt="Google" 
            className="w-4 sm:w-5 h-4 sm:h-5 absolute left-3 sm:left-4"
          />
          Continue with Google
        </Button>
      </div>

      <div className="relative mb-6 sm:mb-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t"></div>
        </div>
        <div className="relative flex justify-center text-xs sm:text-sm">
          <span className="bg-gradient-to-b from-white to-gray-50 px-2 text-muted-foreground">
            or continue with email
          </span>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-3 sm:space-y-4">
        {mode === 'signup' && (
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
              className="h-10 sm:h-12 transition-all duration-300 focus:ring-2 focus:ring-green-500/20 text-sm sm:text-base"
            />
          </div>
        )}

        <div className="space-y-2">
          <Input
            type="email"
            placeholder="Enter your work or personal email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="h-10 sm:h-12 transition-all duration-300 focus:ring-2 focus:ring-green-500/20 text-sm sm:text-base"
          />
        </div>

        <div className="relative space-y-2">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder={mode === 'signup' ? "Create password" : "Enter password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            className="h-10 sm:h-12 transition-all duration-300 focus:ring-2 focus:ring-green-500/20 text-sm sm:text-base"
            minLength={8}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 sm:top-3.5 text-gray-500 hover:text-gray-700 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {mode === 'signup' && (
          <div className="relative space-y-2">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
              className="h-10 sm:h-12 transition-all duration-300 focus:ring-2 focus:ring-green-500/20 text-sm sm:text-base"
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-2.5 sm:top-3.5 text-gray-500 hover:text-gray-700 transition-colors"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        )}

        <Button 
          type="submit" 
          className="w-full h-10 sm:h-12 bg-green-500 hover:bg-green-600 text-white transition-all duration-300 transform hover:translate-y-[-2px] hover:shadow-lg text-sm sm:text-base"
          disabled={isLoading}
        >
          {isLoading ? 'Please wait...' : (mode === 'signup' ? 'Create Account' : 'Sign in')}
        </Button>
      </form>

      <p className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-muted-foreground">
        {mode === 'signup' ? (
          <>
            Already have an account?{' '}
            <button
              onClick={() => setMode('login')}
              className="text-green-500 hover:text-green-600 font-medium transition-colors"
              disabled={isLoading}
            >
              Login
            </button>
          </>
        ) : (
          <>
            Don't have an account?{' '}
            <button
              onClick={() => setMode('signup')}
              className="text-green-500 hover:text-green-600 font-medium transition-colors"
              disabled={isLoading}
            >
              Sign up
            </button>
          </>
        )}
      </p>
    </div>
  );
};

export default LoginSignupForm;
