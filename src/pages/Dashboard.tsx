/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Agent, Folder } from "@/types";
import { MoreVertical, Edit, Pin, Trash, Plus, FolderIcon } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from '@/hooks/useTheme';
import { useState, useEffect, useRef } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AgentDialog from '@/components/AgentDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { updateFolder, deleteFolder, getAgentsByFolders, createAgent   } from '@/services/api';
import { useSelectedWorkspace } from '@/hooks/useSelectedWorkspace';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useFolders } from '@/contexts/FolderContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import React from 'react';
import { useTranslation } from "react-i18next";
import { createAvatar } from '@dicebear/core';
import { adventurer  } from '@dicebear/collection';
import { useAgentsByFolders } from '@/hooks/useAgentsByFolders';
import { AgentCard } from "@/components/Agents/AgentCard";
import AgentsForFolderCard from "@/components/Agents/AgentsForFolder";
import AgentCardSkeleton from "@/components/skeletons/AgentCardSkeleton";

// Định nghĩa type cho response mới từ API by-folders
interface FolderWithAgents {
  id: string;
  name: string;
  agents: Agent[];
}

const Dashboard = () => {
  console.log('Dashboard rendered');
  const { theme } = useTheme();
  const { folders, loadingFolders, errorFolders, fetchFolders, setFolders } = useFolders();
  const { workspace } = useSelectedWorkspace();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [folderToRename, setFolderToRename] = useState<Folder | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [showAddFolderDialog, setShowAddFolderDialog] = useState(false);
  const [showAddAgentDialog, setShowAddAgentDialog] = useState(false);
  const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<Folder | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);



  const [editingFolder, setEditingFolder] = useState<string | null>(null);


  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>(undefined);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useTranslation();

  const folderIds = Array.isArray(folders) ? folders.map(f => f.id) : [];
  // Lấy hết agent một lần với page_size lớn
  const { data: agentsByFoldersData, isLoading: isLoadingAgents, error: agentsError } = useAgentsByFolders(folderIds, 1, 1000);
  let foldersWithAgents: FolderWithAgents[] = [];
  if (Array.isArray(agentsByFoldersData?.data) && agentsByFoldersData.data.length > 0 && Array.isArray(agentsByFoldersData.data[0].agents)) {
    foldersWithAgents = agentsByFoldersData.data as FolderWithAgents[];
  }

  // Lọc agents dựa trên folder được chọn và search query
  const filteredFoldersWithAgents = foldersWithAgents.map(folder => ({
    ...folder,
    agents: folder.agents.filter(agent => 
      (searchQuery === '' || 
      agent.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.role_description?.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (selectedFolder === null || folder.id === selectedFolder)
    )
  })).filter(folder => folder.agents.length > 0 || (searchQuery === '' && selectedFolder === folder.id));

  console.log("foldersWithAgents", foldersWithAgents);
  console.log("filteredFoldersWithAgents", filteredFoldersWithAgents);
  const AgentsForFolder: React.FC<{ folderName: string, agents: any[], navigate: any }> = React.memo(({ folderName, agents, navigate }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const { t } = useTranslation();
    if (isLoadingAgents) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="flex items-center p-2 rounded-md">
              <Skeleton className="w-12 h-12 mr-4 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      );
    }
    if (agentsError) {
      return <div className="text-sm text-red-500">{t('agent.errorLoadingAgents')}</div>;
    }
    if (!agents || agents.length === 0) {
      return <div className="text-muted-foreground text-center w-full">{t('agent.noAgents')}</div>;
    }
    return (
      <React.Fragment>
        {agents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
        
          />
        ))}
      </React.Fragment>
    );
    
  });

  // Xử lý đổi tên folder
  const handleRenameFolder = async () => {
    if (!folderToRename || !newFolderName.trim()) return;
    setIsRenaming(true);
    try {
      await updateFolder(folderToRename.id, { name: newFolderName.trim() });
      toast({
        title: t('common.success'),
        description: t('folderRenamed', { name: newFolderName.trim() }),
      });
      setShowRenameDialog(false);
      if (workspace?.id) fetchFolders(workspace.id);
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: t('folderRenameFailed', { name: newFolderName.trim() }),
        variant: 'destructive',
      });
    } finally {
      setIsRenaming(false);
    }
  };

  // Xử lý xóa folder
  const handleDeleteFolder = async () => {
    if (!folderToDelete) return;
    setIsDeleting(true);
    try {
      await deleteFolder(folderToDelete.id);
      toast({
        title: t('common.success'),
        description: t('folderDeleted', { name: folderToDelete.name }),
      });
      setShowConfirmDeleteDialog(false);
      if (workspace?.id) fetchFolders(workspace.id);
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: t('folderDeleteFailed', { name: folderToDelete.name }),
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddAgent = async (data: Partial<Agent> & { folder_id?: string }) => {
    await createAgent({
      name: data.name || '',
      workspace_id: workspace?.id || '',
      folder_id: data.folder_id || '',
      role_description: data.role_description || '',
      job_brief: data.job_brief || '',
      language: data.language || '',
      position: data.position || '',
      status: data.status || 'private',
      greeting_message: data.greeting_message || '',
      model_config: { webhook_url: data.model_config?.webhook_url || '' },
    });
    queryClient.invalidateQueries({ queryKey: ['agents'] });
    toast({
      title: t('common.success'),
      description: t('agent.agentCreated', { name: data.name }),
    });
    setShowAddAgentDialog(false);
  }

  return (
    <div className="space-y-6 text-foreground">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            {t('common.dashboardDescription')}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
          {user?.role !== 'user' && (
          <Button className={`flex ${theme === 'dark' ? 'button-gradient-dark' : 'button-gradient-light'} text-white items-center justify-center gap-2 w-full sm:w-auto`} onClick={() => setShowAddAgentDialog(true)}>
            <span className="text-lg">+</span> {t('agent.createAgent')}
          </Button>
          )}
         
        </div>
      </div>

      {/* Folder Chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge 
          variant={selectedFolder === null ? "default" : "outline"}
          className="cursor-pointer hover:bg-primary/80"
          onClick={() => setSelectedFolder(null)}
        >
          Tất cả
        </Badge>
        {folders?.map((folder) => (
          <Badge
            key={folder.id}
            variant={selectedFolder === folder.id ? "default" : "outline"}
            className="cursor-pointer hover:bg-primary/80"
            onClick={() => setSelectedFolder(folder.id)}
          >
            {folder.name}
          </Badge>
        ))}
      </div>

      {/* Search Input */}
      <SearchInput onSearchChange={setSearchQuery} />

      {/* Search Results Summary */}
      {searchQuery && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <span>
            {t('agent.searchResults', { 
              count: filteredFoldersWithAgents.reduce((total, folder) => total + folder.agents.length, 0),
              query: searchQuery 
            })}
          </span>
        </div>
      )}

      {/* Grid of Agents */}
        {isLoadingAgents ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <AgentCardSkeleton key={idx} />
            ))}
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFoldersWithAgents.map(folder => (
            <React.Fragment key={folder.id}>
              {folder.agents.map(agent => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </React.Fragment>
          ))}
        </div>
      )}

      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('folder.renameFolder')}</DialogTitle>
            <DialogDescription>
              {t('folder.renameFolderDescription', { name: folderToRename?.name })}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-folder-name" className="text-right">
                {t('folder.newFolderName')}
              </Label>
              <Input
                id="new-folder-name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="col-span-3"
                disabled={isRenaming}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRenameDialog(false)} disabled={isRenaming}>{t('common.cancel')}</Button>
            <Button onClick={handleRenameFolder} disabled={!newFolderName.trim() || isRenaming}>
              {isRenaming ? t('common.saving') : t('common.saveChanges')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AgentDialog open={showAddAgentDialog} onOpenChange={setShowAddAgentDialog} folderId={selectedFolderId} mode="add" onSave={handleAddAgent} onCancel={() => setShowAddAgentDialog(false)} />

      <Dialog open={showConfirmDeleteDialog} onOpenChange={setShowConfirmDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('folder.deleteFolder')}</DialogTitle>
            <DialogDescription>
              {t('folder.deleteFolderDescription', { name: folderToDelete?.name })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDeleteDialog(false)} disabled={isDeleting}>{t('common.cancel')}</Button>
            <Button variant="destructive" onClick={handleDeleteFolder} disabled={isDeleting}>
               {isDeleting ? t('common.deleting') : t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

// New component for Search Input
interface SearchInputProps {
  onSearchChange: (query: string) => void;
}

const SearchInput: React.FC<SearchInputProps> = React.memo(({ onSearchChange }) => {
  const [query, setQuery] = useState('');
  const { t } = useTranslation();

  // Debounce search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearchChange(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, onSearchChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
  };

  const handleClear = () => {
    setQuery('');
    onSearchChange('');
  };

  return (
    <div className="flex flex-col md:flex-row items-center gap-4">
      <div className="relative w-full md:w-96">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <Input
          type="search"
          placeholder={t('agent.searchAgents')}
          className="pl-9 pr-9"
          value={query}
          onChange={handleChange}
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
});

export default Dashboard;
