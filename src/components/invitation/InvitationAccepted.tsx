
export const InvitationAccepted = () => {
  return (
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
  );
};
