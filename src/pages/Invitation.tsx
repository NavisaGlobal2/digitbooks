
import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useInvitationVerification } from "@/hooks/useInvitationVerification";
import { InvitationLayout } from "@/components/invitation/InvitationLayout";
import { LoadingState } from "@/components/invitation/LoadingState";
import { InvalidInvitation } from "@/components/invitation/InvalidInvitation";
import { InvitationDetails } from "@/components/invitation/InvitationDetails";
import { InvitationAccepted } from "@/components/invitation/InvitationAccepted";

const Invitation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const {
    isVerifying,
    isAccepted,
    invitationDetails,
    acceptInvitation
  } = useInvitationVerification(token);

  useEffect(() => {
    if (isAccepted) {
      // Redirect to login after a short delay
      const timer = setTimeout(() => {
        navigate("/auth");
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isAccepted, navigate]);

  return (
    <InvitationLayout>
      {isVerifying && <LoadingState />}
      
      {!isVerifying && !invitationDetails && <InvalidInvitation />}
      
      {!isVerifying && invitationDetails && !isAccepted && (
        <InvitationDetails 
          invitationDetails={invitationDetails}
          onAccept={acceptInvitation}
          isVerifying={isVerifying}
        />
      )}
      
      {isAccepted && <InvitationAccepted />}
    </InvitationLayout>
  );
};

export default Invitation;
