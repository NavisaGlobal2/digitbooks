
import { fetchTeamMembers } from "./team/fetchTeamMembers";
import { inviteTeamMember } from "./team/inviteTeamMember";
import { updateTeamMember } from "./team/updateTeamMember";
import { removeTeamMember } from "./team/removeTeamMember";

export const useTeamMembers = () => {
  return {
    fetchTeamMembers,
    inviteTeamMember,
    updateTeamMember,
    removeTeamMember
  };
};

export * from "./team/fetchTeamMembers";
export * from "./team/inviteTeamMember";
export * from "./team/updateTeamMember";
export * from "./team/removeTeamMember";
