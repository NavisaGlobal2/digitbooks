
import { fetchTeamMembers } from "./fetchTeamMembers";
import { inviteTeamMember } from "./inviteTeamMember";
import { updateTeamMember } from "./updateTeamMember";
import { removeTeamMember } from "./removeTeamMember";
import { addTeamMember } from "./addTeamMember";

export const useTeamMembers = () => {
  return {
    fetchTeamMembers,
    inviteTeamMember,
    updateTeamMember,
    removeTeamMember,
    addTeamMember
  };
};

export * from "./fetchTeamMembers";
export * from "./inviteTeamMember";
export * from "./updateTeamMember";
export * from "./removeTeamMember";
export * from "./addTeamMember";
