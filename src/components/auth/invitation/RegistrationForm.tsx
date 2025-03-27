
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface RegistrationFormProps {
  invitation: {
    email: string;
    name: string;
    role: string;
  };
  onSubmit: (password: string) => Promise<void>;
  isSubmitting: boolean;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({
  invitation,
  onSubmit,
  isSubmitting
}) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    await onSubmit(password);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-2">
        <p className="text-sm text-green-800">
          <span className="font-semibold">You've been invited as:</span> {invitation.role}
        </p>
        <p className="text-sm text-green-800 mt-1">
          <span className="font-semibold">Email:</span> {invitation.email}
        </p>
      </div>
      
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
  );
};

export default RegistrationForm;
