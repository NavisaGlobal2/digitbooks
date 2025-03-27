
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const InvalidInvitation = () => {
  const navigate = useNavigate();
  
  return (
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
  );
};
