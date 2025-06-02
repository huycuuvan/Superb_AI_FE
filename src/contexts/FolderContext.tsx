/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getFolders } from '@/services/api';
import { useSelectedWorkspace } from '@/hooks/useSelectedWorkspace';

interface FolderType {
  id: string;
  name: string;
  workspace_id: string;
}

interface FolderContextType {
  folders: FolderType[];
  loadingFolders: boolean;
  fetchFolders: (workspaceId: string) => Promise<void>;
  setFolders: React.Dispatch<React.SetStateAction<FolderType[]>>;
}

const FolderContext = createContext<FolderContextType | undefined>(undefined);

export const FolderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(true);
  const { workspace } = useSelectedWorkspace();

  const fetchFolders = useCallback(async (workspaceId: string) => {
    setLoadingFolders(true);
    try {
      const data = await getFolders(workspaceId);
      setFolders(data.data);
    } catch (error: any) {
      console.error('Lỗi khi lấy danh sách folder:', error);
      setFolders([]);
    } finally {
      setLoadingFolders(false);
    }
  }, []);

  useEffect(() => {
    if (workspace?.id) {
      fetchFolders(workspace.id);
    }
  }, [workspace?.id, fetchFolders]);

  return (
    <FolderContext.Provider value={{ folders, loadingFolders, fetchFolders, setFolders }}>
      {children}
    </FolderContext.Provider>
  );
};

export const useFolders = () => {
  const context = useContext(FolderContext);
  if (context === undefined) {
    throw new Error('useFolders must be used within a FolderProvider');
  }
  return context;
}; 