
import React, { useState, useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AuthHeader from '@/components/auth/AuthHeader';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const location = useLocation();

  // Extract reset token from URL
  const hash = location.hash.substring(1);
  const params = new URLSearchParams(hash);
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  const type = params.get('type');
  
  const isValidReset = type === 'recovery' && accessToken;

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    
    try {
      // Update user's password
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) throw error;
      
      toast.success("Password has been reset successfully");
      setResetComplete(true);
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast.error(error.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  // If not a valid reset attempt, redirect to the login page
  if (!isValidReset) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col p-4 sm:p-6 bg-gradient-to-b from-white to-gray-50">
      <AuthHeader />
      
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-sm bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          {!resetComplete ? (
            <>
              <h1 className="text-2xl font-bold mb-2 text-center">Set New Password</h1>
              <p className="text-sm text-muted-foreground mb-6 text-center">
                Create a new password for your account
              </p>
              
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">New Password</label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    className="h-11"
                    disabled={isLoading}
                    minLength={6}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    className="h-11"
                    disabled={isLoading}
                    minLength={6}
                  />
                </div>
                
                <Button 
                  type="submit"
                  className="w-full h-11 bg-green-500 hover:bg-green-600 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Reset Password"}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">Password Reset Complete</h1>
              <p className="text-sm text-muted-foreground mb-6">
                Your password has been reset successfully
              </p>
              <Button 
                onClick={() => window.location.href = '/auth'}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                Sign In with New Password
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
