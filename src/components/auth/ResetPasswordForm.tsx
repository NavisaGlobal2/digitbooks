
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ResetPasswordFormProps {
  onBack: () => void;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onBack }) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?type=recovery`,
      });

      if (error) throw error;
      
      setResetSent(true);
      toast.success("Password reset instructions sent to your email.");
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast.error(error.message || "Failed to send reset instructions.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm px-4">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          Reset your password
        </h1>
        <p className="text-sm text-muted-foreground">
          {resetSent 
            ? "Check your email for password reset instructions" 
            : "Enter your email address to receive reset instructions"}
        </p>
      </div>

      {!resetSent ? (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="h-11 transition-all duration-300 focus:ring-2 focus:ring-green-500/20"
          />

          <Button 
            type="submit" 
            className="w-full h-11 bg-green-500 hover:bg-green-600 text-white transition-all duration-300"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Reset Instructions'}
          </Button>
          
          <p className="text-center mt-4">
            <button
              onClick={onBack}
              type="button"
              className="text-green-500 hover:text-green-600 text-sm font-medium"
            >
              Back to login
            </button>
          </p>
        </form>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-center text-muted-foreground mb-4">
            We've sent an email with password reset instructions to <strong>{email}</strong>.
            Please check your inbox and follow the instructions to reset your password.
          </p>
          
          <Button 
            onClick={onBack}
            className="w-full h-11 bg-green-500 hover:bg-green-600 text-white transition-all duration-300"
          >
            Return to login
          </Button>
        </div>
      )}
    </div>
  );
};

export default ResetPasswordForm;
