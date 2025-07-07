import { useAgentsByFolders } from "./useAgentsByFolders";
import { useFolders } from "@/contexts/FolderContext";
import { useMemo } from "react";

export function useUniqueAgentsByFolders() {
  const { folders } = useFolders();
  const folderIds = Array.isArray(folders) ? folders.map((f) => f.id) : [];
  const { data: agentsData, isLoading, error } = useAgentsByFolders(folderIds);

  // Xử lý gộp agent duy nhất
  const agents = useMemo(() => {
    if (!Array.isArray(agentsData?.data)) return [];
    return Array.from(
      new Map(
        agentsData.data
          .flatMap((folder) =>
            Array.isArray(folder.agents)
              ? folder.agents.map((agent) => ({
                  ...agent,
                  folderName: folder.name,
                  folderId: folder.id,
                }))
              : []
          )
          .filter((agent) => agent && agent.id)
          .map((agent) => [agent.id, agent])
      ).values()
    );
  }, [agentsData]);

  return { agents, isLoading, error };
}
