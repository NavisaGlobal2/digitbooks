
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const Invitation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setError("Invalid invitation link. No token provided.");
      setLoading(false);
      return;
    }

    const fetchInvitation = async () => {
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('*')
          .eq('id', token)
          .eq('status', 'pending')
          .single();

        if (error) {
          throw error;
        }

        if (!data) {
          throw new Error("Invitation not found or has already been accepted.");
        }

        setInvitation(data);
      } catch (err: any) {
        console.error("Error fetching invitation:", err);
        setError(err.message || "Failed to load invitation details.");
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [searchParams]);

  const acceptInvitation = async () => {
    if (!invitation) return;
    
    setLoading(true);
    
    try {
      // Check if the user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // If not logged in, redirect to login page with return URL
        const returnUrl = `/invitation?token=${searchParams.get('token')}`;
        navigate(`/auth?returnUrl=${encodeURIComponent(returnUrl)}`);
        return;
      }
      
      // Update the team member status to 'active'
      const { error } = await supabase
        .from('team_members')
        .update({ status: 'active', updated_at: new Date().toISOString() })
        .eq('id', invitation.id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Invitation accepted!",
        description: "You have successfully joined the team.",
      });
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      console.error("Error accepting invitation:", err);
      toast({
        variant: "destructive",
        title: "Error accepting invitation",
        description: err.message || "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-500">Invitation Error</CardTitle>
            <CardDescription className="text-center">
              We couldn't process your invitation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">{error}</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => navigate('/')}>Go to Homepage</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Team Invitation</CardTitle>
          <CardDescription className="text-center">
            You've been invited to join a team
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">Team Role</p>
            <p className="font-semibold">{invitation?.role}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Your Email</p>
            <p>{invitation?.email}</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={acceptInvitation} disabled={loading}>
            {loading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Processing...
              </>
            ) : (
              "Accept Invitation"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Invitation;
