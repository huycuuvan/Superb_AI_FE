import { WorkspaceRole, WorkspacePermission } from "../types";

const ROLE_PERMISSIONS: Record<WorkspaceRole, string[]> = {
  owner: [
    "manage_members",
    "manage_settings",
    "manage_profile",
    "view_workspace",
    "manage_documents",
    "view_documents",
    "manage_folders",
  ],
  admin: [
    "manage_members",
    "manage_settings",
    "view_workspace",
    "manage_documents",
    "view_documents",
    "manage_folders",
  ],
  member: ["view_workspace", "view_documents", "view_folders"],
};

export const hasPermission = (
  userRole: WorkspaceRole,
  requiredPermission: keyof WorkspacePermission
): boolean => {
  return ROLE_PERMISSIONS[userRole]?.includes(requiredPermission) ?? false;
};

export const getRoleLabel = (role: WorkspaceRole): string => {
  const labels: Record<WorkspaceRole, string> = {
    owner: "Chủ sở hữu",
    admin: "Quản trị viên",
    member: "Thành viên",
  };
  return labels[role];
};

export const canInviteWithRole = (
  userRole: WorkspaceRole,
  inviteRole: WorkspaceRole
): boolean => {
  if (userRole === "owner") {
    return inviteRole === "admin" || inviteRole === "member";
  }
  if (userRole === "admin") {
    return inviteRole === "member";
  }
  return false;
};

export const canRemoveMember = (
  userRole: WorkspaceRole,
  targetRole: WorkspaceRole
): boolean => {
  if (userRole === "owner") {
    return true; // Owner can remove anyone except themselves (handled in component)
  }
  if (userRole === "admin") {
    return targetRole === "member"; // Admin can only remove regular members
  }
  return false;
};
