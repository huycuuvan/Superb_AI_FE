import { useState, useEffect } from "react";
import {
  getGroups,
  getGroupMembers,
  addGroupMember,
  removeGroupMember,
  transferGroupOwner,
  updateGroupMemberRole,
  createGroup,
  Group,
  GroupMember,
  getWorkspaceMembers,
} from "@/services/api";

export const useGroups = (workspaceId: string | null) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);

  // Fetch groups when workspaceId changes
  useEffect(() => {
    if (!workspaceId) return;
    setLoading(true);
    getGroups(workspaceId)
      .then((res) => setGroups(res.data || []))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Lỗi khi tải group")
      )
      .finally(() => setLoading(false));
  }, [workspaceId]);

  // Fetch members of selected group
  const fetchMembers = (groupId: string) => {
    setMembersLoading(true);
    getGroupMembers(groupId)
      .then((res) => setMembers(res.data || []))
      .catch((err) =>
        setMembersError(
          err instanceof Error ? err.message : "Lỗi khi tải thành viên group"
        )
      )
      .finally(() => setMembersLoading(false));
  };

  // Group actions
  const handleAddMember = async (
    groupId: string,
    user_id: string,
    role: "admin" | "member"
  ) => {
    // Kiểm tra user có phải thành viên workspace không
    if (!workspaceId) throw new Error("Không xác định được workspace");
    const wsMembersRes = await getWorkspaceMembers(workspaceId);
    const isMember = wsMembersRes.data.some(
      (m) =>
        m.user_id === user_id ||
        (m.user_email &&
          m.user_email.toLowerCase().trim() === user_id.toLowerCase().trim()) ||
        (m.email &&
          m.email.toLowerCase().trim() === user_id.toLowerCase().trim())
    );
    if (!isMember) {
      throw new Error(
        "User must be a member of workspace to be added to group"
      );
    }
    await addGroupMember(groupId, { user_id, role });
    fetchMembers(groupId);
  };

  const handleRemoveMember = async (groupId: string, userId: string) => {
    await removeGroupMember(groupId, userId);
    fetchMembers(groupId);
  };

  const handleTransferOwner = async (groupId: string, new_owner_id: string) => {
    await transferGroupOwner(groupId, new_owner_id);
    fetchMembers(groupId);
  };

  const handleUpdateRole = async (
    groupId: string,
    userId: string,
    role: "admin" | "member"
  ) => {
    await updateGroupMemberRole(groupId, userId, role);
    fetchMembers(groupId);
  };

  const handleCreateGroup = async (data: {
    workspace_id: string;
    name: string;
    description?: string;
  }) => {
    const res = await createGroup(data);
    setGroups((prev) => [...prev, res.data]);
    return res.data;
  };

  return {
    groups,
    loading,
    error,
    selectedGroup,
    setSelectedGroup,
    members,
    membersLoading,
    membersError,
    fetchMembers,
    handleAddMember,
    handleRemoveMember,
    handleTransferOwner,
    handleUpdateRole,
    handleCreateGroup,
  };
};
