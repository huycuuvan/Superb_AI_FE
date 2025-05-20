import { useState, useEffect } from "react";
import { getWorkspace } from "@/services/api";
import { Workspace } from "@/types";

export const useWorkspace = () => {
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkspace = async () => {
      const selectedWorkspaceId = localStorage.getItem("selectedWorkspace");
      if (!selectedWorkspaceId) {
        setLoading(false);
        return;
      }

      try {
        const response = await getWorkspace();
        const workspaces = Array.isArray(response.data)
          ? response.data
          : [response.data];
        const workspace = workspaces.find(
          (ws) => ws.id === selectedWorkspaceId
        );
        if (workspace) {
          setCurrentWorkspace(workspace);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Lỗi khi tải workspace");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspace();
  }, []);

  const selectWorkspace = (workspace: Workspace) => {
    localStorage.setItem("selectedWorkspace", workspace.id);
    setCurrentWorkspace(workspace);
  };

  return {
    currentWorkspace,
    loading,
    error,
    selectWorkspace,
  };
};
