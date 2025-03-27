
-- Function to accept a team invitation with improved handling
CREATE OR REPLACE FUNCTION public.accept_team_invitation(p_token TEXT)
RETURNS VOID AS $$
DECLARE
  v_invitation RECORD;
  v_team_member_id UUID;
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
  
  -- Check if a team member record already exists
  SELECT id INTO v_team_member_id
  FROM team_members
  WHERE email = v_invitation.email AND status = 'pending';
  
  IF v_team_member_id IS NULL THEN
    -- If no team member record exists, create one
    INSERT INTO team_members (
      user_id,
      name,
      email,
      role,
      status,
      created_at,
      updated_at
    ) VALUES (
      auth.uid(),
      v_invitation.name,
      v_invitation.email,
      v_invitation.role,
      'active',
      now(),
      now()
    );
  ELSE
    -- If team member record exists, update it
    UPDATE team_members
    SET status = 'active', user_id = auth.uid(), updated_at = now()
    WHERE id = v_team_member_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.accept_team_invitation(TEXT) TO authenticated;
