
import { ReactNode } from "react";

interface InvitationLayoutProps {
  children: ReactNode;
}

export const InvitationLayout = ({ children }: InvitationLayoutProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      {children}
    </div>
  );
};
