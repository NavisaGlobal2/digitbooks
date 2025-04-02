
import { fetchTeamMembers } from "./team/fetchTeamMembers";
import { inviteTeamMember } from "./team/inviteTeamMember";
import { updateTeamMember } from "./team/updateTeamMember";
import { removeTeamMember } from "./team/removeTeamMember";
import { addTeamMember } from "./team/addTeamMember";

export const useTeamMembers = () => {
  return {
    fetchTeamMembers,
    inviteTeamMember,
    updateTeamMember,
    removeTeamMember,
    addTeamMember
  };
};

export * from "./team/fetchTeamMembers";
export * from "./team/inviteTeamMember";
export * from "./team/updateTeamMember";
export * from "./team/removeTeamMember";
export * from "./team/addTeamMember";
