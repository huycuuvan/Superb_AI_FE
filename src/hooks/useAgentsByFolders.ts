import { useQuery } from "@tanstack/react-query";
import { getAgentsByFolders } from "@/services/api";

export function useAgentsByFolders(
  folderIds: string[],
  page: number = 1,
  pageSize: number = 10
) {
  return useQuery({
    queryKey: ["agents-by-folders", folderIds, page, pageSize],
    queryFn: () =>
      folderIds.length > 0
        ? getAgentsByFolders(folderIds, page, pageSize)
        : Promise.resolve({ data: [] }),
    enabled: folderIds.length > 0,
  });
}
