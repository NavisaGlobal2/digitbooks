
-- Function to accept a team invitation
CREATE OR REPLACE FUNCTION public.accept_team_invitation(p_token TEXT)
RETURNS VOID AS $$
DECLARE
  v_invitation RECORD;
BEGIN
  -- Get the invitation details
  SELECT * INTO v_invitation 
  FROM team_invitations 
  WHERE token = p_token AND status = 'pending';
  
  -- Check if invitation exists
  IF v_invitation.id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired invitation token';
  END IF;
  
  -- Update the invitation status
  UPDATE team_invitations 
  SET status = 'accepted', updated_at = now()
  WHERE id = v_invitation.id;
  
  -- Update the team member status
  UPDATE team_members
  SET status = 'active', user_id = auth.uid(), updated_at = now()
  WHERE email = v_invitation.email AND status = 'pending';
  
  -- If the update didn't affect any rows, the team member might have been deleted
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Team member record not found';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.accept_team_invitation(TEXT) TO authenticated;
