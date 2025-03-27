
import { Button } from "@/components/ui/button";
import { TeamMember } from "@/types/teamMember";
import { useNavigate } from "react-router-dom";

interface InvitationDetailsProps {
  invitationDetails: TeamMember;
  onAccept: () => void;
  isVerifying: boolean;
}

export const InvitationDetails = ({ 
  invitationDetails, 
  onAccept, 
  isVerifying 
}: InvitationDetailsProps) => {
  const navigate = useNavigate();

  return (
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
          onClick={onAccept} 
          className="w-full"
          disabled={isVerifying}
        >
          {isVerifying ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-current"></div>
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
  );
};
