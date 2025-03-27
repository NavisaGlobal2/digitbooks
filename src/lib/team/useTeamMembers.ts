
import { 
  fetchTeamMembers, 
  updateTeamMember, 
  removeTeamMember 
} from './teamMembersApi';
import { inviteTeamMember } from './invitationService';

/**
 * Hook for managing team members
 */
export const useTeamMembers = () => {
  return {
    fetchTeamMembers,
    inviteTeamMember,
    updateTeamMember,
    removeTeamMember
  };
};
