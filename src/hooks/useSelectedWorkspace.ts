import { useQuery } from "@tanstack/react-query";
import { getWorkspace, WorkspaceResponse } from "@/services/api";
import React from "react";

export const useSelectedWorkspace = () => {
  const selectedWorkspaceId =
    typeof window !== "undefined"
      ? localStorage.getItem("selectedWorkspace")
      : null;

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

  // Tìm workspace đang chọn từ dữ liệu danh sách
  const workspaces =
    workspacesData && workspacesData.data
      ? Array.isArray(workspacesData.data)
        ? workspacesData.data
        : [workspacesData.data]
      : [];
  const workspace =
    workspaces.find((ws) => ws.id === selectedWorkspaceId) || null;

  // Memoize the returned value to prevent unnecessary re-renders
  const memoizedValue = React.useMemo(
    () => ({
      workspace,
      isLoading: isWorkspacesLoading,
      error: workspacesError,
    }),
    [workspace, isWorkspacesLoading, workspacesError]
  );

  // Trả về thông tin workspace đang chọn và trạng thái loading/error từ query danh sách
  return memoizedValue;
};
