
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const Invitation = () => {
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [invitationDetails, setInvitationDetails] = useState<{
    id: string;
    name: string;
    email: string;
    role: string;
  } | null>(null);
  const navigate = useNavigate();
  const token = searchParams.get("token");

  useEffect(() => {
    const verifyInvitation = async () => {
      if (!token) {
        toast.error("Invalid invitation link");
        return;
      }

      try {
        setIsVerifying(true);
        // Fetch the invitation details
        const { data, error } = await supabase
          .from("team_members")
          .select("*")
          .eq("id", token)
          .eq("status", "pending")
          .single();

        if (error || !data) {
          console.error("Error fetching invitation:", error);
          toast.error("Invitation not found or has expired");
          return;
        }

        setInvitationDetails({
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role
        });
      } catch (error) {
        console.error("Error verifying invitation:", error);
        toast.error("Failed to verify invitation");
      } finally {
        setIsVerifying(false);
      }
    };

    verifyInvitation();
  }, [token]);

  const acceptInvitation = async () => {
    if (!token || !invitationDetails) return;
    
    try {
      setIsVerifying(true);
      
      // Here you would typically:
      // 1. Create a user account if they don't have one
      // 2. Update the team_member status to 'active'
      // 3. Associate the user_id with the team_member
      
      // For now, we'll just update the status to simulate acceptance
      const { error } = await supabase
        .from("team_members")
        .update({ status: "active" })
        .eq("id", token);

      if (error) {
        throw error;
      }

      setIsAccepted(true);
      toast.success("Invitation accepted! You're now part of the team.");
      
      // In a real implementation, redirect to onboarding or login
      setTimeout(() => {
        navigate("/auth");
      }, 2000);
    } catch (error) {
      console.error("Error accepting invitation:", error);
      toast.error("Failed to accept invitation");
    } finally {
      setIsVerifying(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
          <div className="flex flex-col items-center space-y-3">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <h1 className="text-xl font-semibold text-center">Verifying invitation...</h1>
          </div>
        </div>
      </div>
    );
  }

  if (!invitationDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
          <div className="flex flex-col items-center space-y-3">
            <h1 className="text-xl font-semibold text-center text-red-500">Invalid Invitation</h1>
            <p className="text-center text-gray-600">
              This invitation is invalid or has expired.
            </p>
            <Button onClick={() => navigate("/")} className="mt-4">
              Go to Homepage
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isAccepted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
          <div className="flex flex-col items-center space-y-3 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold">Invitation Accepted!</h1>
            <p className="text-gray-600">
              You have successfully joined the team. Redirecting you to login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">Team Invitation</h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">You've been invited to join as:</p>
            <p className="font-medium">{invitationDetails.role}</p>
          </div>
          
          <div>
            <h2 className="text-lg font-medium">Invitation Details</h2>
            <ul className="mt-2 space-y-2">
              <li className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{invitationDetails.name}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{invitationDetails.email}</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-4">
          <Button 
            onClick={acceptInvitation} 
            className="w-full"
            disabled={isVerifying}
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Accept Invitation"
            )}
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full mt-2"
            onClick={() => navigate("/")}
          >
            Decline
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Invitation;
