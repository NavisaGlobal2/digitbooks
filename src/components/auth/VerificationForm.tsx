
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { resendVerificationEmail } from "@/contexts/auth/authActions";
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";

interface VerificationFormProps {
  email: string;
  onBack: () => void;
}

const VerificationForm: React.FC<VerificationFormProps> = ({
  email,
  onBack,
}) => {
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { verifyOtp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.length !== 6) {
      toast.error("Please enter a valid verification code");
      return;
    }
    
    setIsLoading(true);
    try {
      await verifyOtp(email, verificationCode);
      toast.success("Email verified successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Verification error:", error);
      toast.error(error.message || "Invalid verification code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    try {
      await resendVerificationEmail(email);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full max-w-sm px-4">
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          Verify your email
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          We've sent a verification email to {email}
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium">Two options to verify:</p>
            <ol className="list-decimal ml-5 mt-1 space-y-1">
              <li>Click the link in the verification email we sent you</li>
              <li>Or enter the 6-digit code from the email below</li>
            </ol>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="space-y-2">
          <div className="flex justify-center mb-4 overflow-x-auto py-2">
            <InputOTP value={verificationCode} onChange={setVerificationCode} maxLength={6}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          
          <p className="text-xs sm:text-sm text-center text-muted-foreground mt-4">
            Didn't receive a code? <button type="button" onClick={handleResendCode} disabled={isResending} className="text-green-500 hover:text-green-600 font-medium">
              {isResending ? "Sending..." : "Resend"}
            </button>
          </p>
        </div>

        <Button 
          type="submit" 
          className="w-full h-10 sm:h-12 bg-green-500 hover:bg-green-600 text-white transition-all duration-300 transform hover:translate-y-[-2px] hover:shadow-lg text-sm sm:text-base"
          disabled={isLoading || verificationCode.length !== 6}
        >
          {isLoading ? 'Verifying...' : 'Verify Email'}
        </Button>
        
        <Button 
          type="button"
          variant="ghost"
          onClick={onBack}
          className="w-full text-sm sm:text-base"
          disabled={isLoading}
        >
          Back to login
        </Button>
      </form>
    </div>
  );
};

export default VerificationForm;
