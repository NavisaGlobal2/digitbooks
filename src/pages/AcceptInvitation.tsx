
import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import InvitationLoading from "@/components/auth/invitation/InvitationLoading";
import InvalidInvitation from "@/components/auth/invitation/InvalidInvitation";
import AcceptingInvitation from "@/components/auth/invitation/AcceptingInvitation";
import InvitationCard from "@/components/auth/invitation/InvitationCard";
import RegistrationForm from "@/components/auth/invitation/RegistrationForm";
import { useInvitation } from "@/hooks/useInvitation";
import { toast } from "sonner";

const AcceptInvitation = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { isAuthenticated, user } = useAuth();
  
  const {
    isLoading,
    isValid,
    invitation,
    isSubmitting,
    acceptInvitation,
    registerAccount
  } = useInvitation(token);

  // If already authenticated, check if it's the same user as the invitation
  useEffect(() => {
    if (isAuthenticated && user && invitation) {
      if (user.email === invitation.email) {
        acceptInvitation();
      } else {
        toast.warning("You're signed in with a different email address than the invitation", {
          description: "Please sign out and sign in with the email address in the invitation."
        });
      }
    }
  }, [isAuthenticated, user, invitation]);

  if (isLoading) {
    return <InvitationLoading />;
  }

  if (isAuthenticated && user && invitation && user.email === invitation.email) {
    return <AcceptingInvitation />;
  }

  if (!isValid || !invitation) {
    return <InvalidInvitation />;
  }

  return (
    <InvitationCard 
      title="Accept Team Invitation" 
      subtitle="Create your account to join the team"
    >
      <RegistrationForm 
        invitation={invitation}
        onSubmit={registerAccount}
        isSubmitting={isSubmitting}
      />
    </InvitationCard>
  );
};

export default AcceptInvitation;
