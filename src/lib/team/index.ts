
import { fetchTeamMembers } from "./fetchTeamMembers";
import { inviteTeamMember } from "./inviteTeamMember";
import { updateTeamMember } from "./updateTeamMember";
import { removeTeamMember } from "./removeTeamMember";

export const useTeamMembers = () => {
  return {
    fetchTeamMembers,
    inviteTeamMember,
    updateTeamMember,
    removeTeamMember
  };
};

export * from "./fetchTeamMembers";
export * from "./inviteTeamMember";
export * from "./updateTeamMember";
export * from "./removeTeamMember";
