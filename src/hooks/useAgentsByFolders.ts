import { useQuery } from "@tanstack/react-query";
import { getAgentsByFolders } from "@/services/api";
export interface AgentsByFoldersFilters {
  search?: string; // Tìm kiếm theo tên, role, position (không phân biệt hoa thường)
  status?: string; // Trạng thái agent (vd: 'private', 'public', ...)
  position?: string; // Chức vụ (role) của agent (vd: 'Manager', 'Staff', ...)
  is_running?: boolean; // Agent đang thực thi
  is_scheduled?: boolean; // Agent đã lên lịch
  model?: string; // Lọc theo model AI (vd: 'gpt-4', 'claude', ...)
  created_from?: string; // ISO date string hoặc 'YYYY-MM-DD' (ngày bắt đầu)
  created_to?: string; // ISO date string hoặc 'YYYY-MM-DD' (ngày kết thúc)
}
export function useAgentsByFolders(
  folderIds: string[],
  page: number = 1,
  pageSize: number = 10,
  filters?: AgentsByFoldersFilters
) {
  return useQuery({
    queryKey: [
      "agents-by-folders",
      folderIds,
      page,
      pageSize,
      filters, // Đảm bảo object filter đưa vào key để cache/phân biệt truy vấn
    ],
    queryFn: () =>
      folderIds.length > 0
        ? getAgentsByFolders(folderIds, page, pageSize, filters)
        : Promise.resolve({ data: [] }),
    enabled: folderIds.length > 0,
  });
}
