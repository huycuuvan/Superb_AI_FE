import { useQuery } from "@tanstack/react-query";
import { getWorkspace, WorkspaceResponse } from "@/services/api";

export const useSelectedWorkspace = () => {
  const selectedWorkspaceId =
    typeof window !== "undefined"
      ? localStorage.getItem("selectedWorkspace")
      : null;

  console.log(
    "Hook: useSelectedWorkspace - Reading selectedWorkspaceId from localStorage",
    selectedWorkspaceId
  );

  // Sử dụng useQuery với cùng key của danh sách workspaces để truy cập cache
  // Hook này chỉ tìm kiếm trong dữ liệu đã fetch bởi query ['workspaces']
  const {
    data: workspacesData,
    isLoading: isWorkspacesLoading,
    error: workspacesError,
  } = useQuery<WorkspaceResponse | null>({
    queryKey: ["workspaces"], // Cùng key với fetch danh sách workspace
    queryFn: getWorkspace, // Vẫn cần queryFn dù có thể không fetch nếu cache có
    enabled: true, // Fetch nếu cache không có hoặc stale
    staleTime: 5 * 60 * 1000, // Giữ data tươi trong cache
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 1,
  });

  console.log("Hook: useSelectedWorkspace - useQuery ['workspaces'] state", {
    isLoading: isWorkspacesLoading,
    error: workspacesError,
    data: workspacesData,
  });

  // Tìm workspace đang chọn từ dữ liệu danh sách
  const workspaces =
    workspacesData && workspacesData.data
      ? Array.isArray(workspacesData.data)
        ? workspacesData.data
        : [workspacesData.data]
      : [];
  const workspace =
    workspaces.find((ws) => ws.id === selectedWorkspaceId) || null;

  console.log(
    "Hook: useSelectedWorkspace - Extracted selected workspace object",
    workspace
  );

  // Trả về thông tin workspace đang chọn và trạng thái loading/error từ query danh sách
  return { workspace, isLoading: isWorkspacesLoading, error: workspacesError };
};
