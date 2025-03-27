
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const AcceptInvitation = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [invitation, setInvitation] = useState<{ email: string; name: string; role: string } | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        toast.error("Invalid invitation link");
        navigate("/auth");
        return;
      }

      try {
        setIsLoading(true);
        
        // Validate the token with Supabase
        const { data, error } = await supabase
          .from('team_invitations')
          .select('email, name, role, status')
          .eq('token', token)
          .single();
        
        if (error || !data || data.status !== 'pending') {
          console.error("Invalid or expired invitation:", error || "Status is not pending");
          toast.error("This invitation is invalid or has expired");
          navigate("/auth");
          return;
        }
        
        setInvitation({
          email: data.email,
          name: data.name,
          role: data.role
        });
        setIsValid(true);
      } catch (error) {
        console.error("Error validating invitation:", error);
        toast.error("Error validating invitation");
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, [token, navigate]);

  // If already authenticated, check if it's the same user as the invitation
  useEffect(() => {
    if (isAuthenticated && user && invitation) {
      if (user.email === invitation.email) {
        handleAcceptInvitation();
      } else {
        toast.warning("You're signed in with a different email address than the invitation", {
          description: "Please sign out and sign in with the email address in the invitation."
        });
      }
    }
  }, [isAuthenticated, user, invitation]);

  const handleAcceptInvitation = async () => {
    if (!token || !isValid || !invitation) return;
    
    try {
      setIsSubmitting(true);
      
      // Accept the invitation in the database
      const { error } = await supabase.rpc('accept_team_invitation', {
        p_token: token
      });
      
      if (error) {
        throw error;
      }
      
      toast.success("Invitation accepted successfully!");
      
      // Redirect to dashboard
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error: any) {
      console.error("Error accepting invitation:", error);
      toast.error(error.message || "Failed to accept invitation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!invitation) return;
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Register with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: invitation.email,
        password,
        options: {
          data: {
            name: invitation.name,
            onboardingCompleted: true
          }
        }
      });
      
      if (error) throw error;
      
      // Accept the invitation automatically after successful registration
      if (data) {
        handleAcceptInvitation();
      }
    } catch (error: any) {
      console.error("Error registering account:", error);
      
      if (error.message.includes("already registered")) {
        toast.error("This email is already registered", {
          description: "Please sign in instead"
        });
        navigate("/auth");
      } else {
        toast.error(error.message || "Failed to create account");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-2">Validating invitation...</p>
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user && invitation && user.email === invitation.email) {
    return (
      <div className="h-screen flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Accepting Invitation</h1>
            <p className="mb-6">You're already signed in with the correct account. Finalizing your team membership...</p>
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          </div>
        </Card>
      </div>
    );
  }

  if (!isValid || !invitation) {
    return (
      <div className="h-screen flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Invitation</h1>
          <p className="mb-6">This invitation link is invalid or has expired.</p>
          <Button onClick={() => navigate("/auth")} className="w-full">Go to Login</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Accept Team Invitation</h1>
          <p className="text-muted-foreground mt-2">Create your account to join the team</p>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
          <p className="text-sm text-green-800">
            <span className="font-semibold">You've been invited as:</span> {invitation.role}
          </p>
          <p className="text-sm text-green-800 mt-1">
            <span className="font-semibold">Email:</span> {invitation.email}
          </p>
        </div>
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">Create Password</label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full"
              placeholder="Enter a secure password"
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">Confirm Password</label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full"
              placeholder="Confirm your password"
              disabled={isSubmitting}
            />
          </div>
          
          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
            {isSubmitting ? "Creating Account..." : "Accept Invitation & Create Account"}
          </Button>
          
          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <a href="/auth" className="text-primary hover:underline font-medium">
                Sign in
              </a>
            </p>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AcceptInvitation;
