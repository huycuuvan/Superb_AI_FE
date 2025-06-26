import { useQuery } from "@tanstack/react-query";
import { getAgentsByFolders } from "@/services/api";

export function useAgentsByFolders(folderIds: string[]) {
  return useQuery({
    queryKey: ["agents-by-folders", folderIds],
    queryFn: () =>
      folderIds.length > 0
        ? getAgentsByFolders(folderIds)
        : Promise.resolve({ data: [] }),
    enabled: folderIds.length > 0,
  });
}
