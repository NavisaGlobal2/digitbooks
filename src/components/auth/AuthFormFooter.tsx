
import React from "react";

interface AuthFormFooterProps {
  mode: 'login' | 'signup';
  setMode: React.Dispatch<React.SetStateAction<'login' | 'signup'>>;
  isLoading: boolean;
}

const AuthFormFooter: React.FC<AuthFormFooterProps> = ({
  mode,
  setMode,
  isLoading
}) => {
  return (
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
  );
};

export default AuthFormFooter;
