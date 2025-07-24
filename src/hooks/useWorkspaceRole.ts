import { useAuth } from "./useAuth";
import { WorkspaceRole } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useSelectedWorkspace } from "./useSelectedWorkspace";
import { API_BASE_URL } from "@/config/api";

interface WorkspaceMemberResponse {
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  joined_at: string;
}

export const useWorkspaceRole = (): WorkspaceRole => {
  const { user } = useAuth();
  const { workspace } = useSelectedWorkspace();

  // Luôn gọi useQuery, không đặt trong điều kiện
  const { data: membersData } = useQuery({
    queryKey: ["workspaceMembers", workspace?.id],
    queryFn: async () => {
      if (!workspace?.id) return { data: [] };
      const response = await fetch(
        `${API_BASE_URL}/workspaces/${workspace.id}/members`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch workspace members");
      }
      return response.json();
    },
    // Không cần enabled vì đã check trong queryFn
  });

  // Fallback role dựa trên system role
  const fallbackRole: WorkspaceRole =
    user?.role === "super_admin" || user?.role === "admin" ? "owner" : "member";

  // Nếu không có data hoặc không tìm thấy user trong members, trả về fallback role
  if (!membersData?.data || !Array.isArray(membersData.data)) {
    return fallbackRole;
  }

  const currentUserMember = membersData.data.find(
    (member: WorkspaceMemberResponse) => member.user_id === user?.id
  );

  return currentUserMember?.role || fallbackRole;
};
