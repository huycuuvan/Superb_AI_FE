/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getFolders } from '@/services/api';
import { useSelectedWorkspace } from '@/hooks/useSelectedWorkspace';
import { Folder } from '@/types';

interface FolderContextType {
  folders: Folder[];
  loadingFolders: boolean;
  errorFolders: Error | null;
  fetchFolders: (workspaceId: string) => Promise<void>;
  setFolders: React.Dispatch<React.SetStateAction<Folder[]>>;
}

const FolderContext = createContext<FolderContextType | undefined>(undefined);

export const FolderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [errorFolders, setErrorFolders] = useState<Error | null>(null);
  const { workspace } = useSelectedWorkspace();

  const fetchFolders = useCallback(async (workspaceId: string) => {
    setLoadingFolders(true);
    setErrorFolders(null);
    try {
      const response = await getFolders(workspaceId);
      if (response?.data) {
        setFolders(response.data);
      } else {
        setFolders([]);
      }
    } catch (error: any) {
      console.error('Error fetching folders:', error);
      setErrorFolders(error);
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
    <FolderContext.Provider value={{ folders, loadingFolders, errorFolders, fetchFolders, setFolders }}>
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