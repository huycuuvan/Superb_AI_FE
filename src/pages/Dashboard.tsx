/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
import { AddAgentDialog } from '@/components/AddAgentDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { updateFolder, deleteFolder, getAgentsByFolder } from '@/services/api';
import { useSelectedWorkspace } from '@/hooks/useSelectedWorkspace';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useFolders } from '@/contexts/FolderContext';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import React from 'react';
import { useLanguage } from "@/hooks/useLanguage";
import { useTranslation } from "react-i18next";
import { createAvatar } from '@dicebear/core';
import { adventurer  } from '@dicebear/collection';



const Dashboard = () => {
  console.log('Dashboard rendered');
  const { theme } = useTheme();
  const { folders, loadingFolders, errorFolders, fetchFolders, setFolders } = useFolders();
  const { workspace } = useSelectedWorkspace();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
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

  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useLanguage();

  useEffect(() => {
    if (workspace?.id) {
      console.log('useEffect fetchFolders running for workspace ID:', workspace.id);
      fetchFolders(workspace.id);
    } else {
      console.log('useEffect fetchFolders: workspace ID is not available.', workspace?.id);
    }
  }, [workspace?.id, fetchFolders]);

  useEffect(() => {
    if (editingFolder && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingFolder]);

  const handleRenameClick = (folder: Folder) => {
    setFolderToRename(folder);
    setNewFolderName(folder.name);
    setShowRenameDialog(true);
  };

  const handleRenameFolder = async () => {
    if (!folderToRename || !newFolderName.trim()) return;

    setIsRenaming(true);
    try {
      await updateFolder(folderToRename.id, { name: newFolderName.trim() });
      toast({
        title: t('common.success'),
        description: t('common.folderRenameSuccess', { name: newFolderName.trim() }),
      });
      if (workspace?.id) {
        fetchFolders(workspace.id);
      }
      setShowRenameDialog(false);
    } catch (error: any) {
      console.error('Lỗi khi đổi tên folder:', error);
      toast({
        title: t('common.error'),
        description: t('common.folderRenameFailed', { name: folderToRename.name }),
        variant: "destructive",
      });
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDeleteClick = (folder: Folder) => {
    setFolderToDelete(folder);
    setShowConfirmDeleteDialog(true);
  };

  const handleDeleteFolder = async () => {
    if (!folderToDelete) return;

    setIsDeleting(true);
    try {
      await deleteFolder(folderToDelete.id);
      toast({
        title: t('common.success'),
        description: t('common.folderDeleteSuccess', { name: folderToDelete.name }),
      });
      if (workspace?.id) {
        fetchFolders(workspace.id);
      }
      setShowConfirmDeleteDialog(false);
      if (navigate && location.pathname === `/dashboard/folder/${folderToDelete.id}`) {
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Lỗi khi xóa folder:', error);
      toast({
        title: t('common.error'),
        description: t('common.folderDeleteFailed', { name: folderToDelete.name }),
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };


  const handlePin = (name: string) => {
    setFolders(prev => {
      const idx = prev.findIndex(f => f.name === name);
      if (idx === -1) return prev;
      const pinned = prev[idx];
      return [pinned, ...prev.slice(0, idx), ...prev.slice(idx + 1)];
    });
  };

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

      {/* Separate Search Input Component */}
      <SearchInput onSearchChange={setSearchQuery} />

      <div className="grid gap-4">
        {loadingFolders ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <Skeleton className="h-6 w-40 mb-4" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {[...Array(4)].map((_, j) => (
                    <Skeleton key={j} className="h-32 w-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : errorFolders ? (
          <div className="text-sm text-red-500">Lỗi khi tải thư mục: {errorFolders.message}</div>
        ) : folders.length > 0 ? (
          folders.map((folder) => (
            <div key={folder.id} className="mb-8 md:mb-10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FolderIcon className="h-5 w-5 text-gradient" />
                  <h2 
                    className="text-lg md:text-xl font-bold cursor-pointer hover:underline"
                    onClick={() => navigate(`/dashboard/folder/${folder.id}`)}
                  >
                    {folder.name}
                  </h2>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="rounded-full p-1.5 focus:outline-none">
                      <MoreVertical className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleRenameClick(folder)}>
                      <Edit className="h-4 w-4 mr-2" /> {t('common.rename')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handlePin(folder.name)}>
                      <Pin className="h-4 w-4 mr-2" /> {t('common.pin')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeleteClick(folder)} className="text-destructive focus:text-destructive">
                      <Trash className="h-4 w-4 mr-2" /> {t('common.delete')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {user?.role !== 'user' && (
                <Card
                  className="flex flex-col items-center justify-center h-40 p-6 text-center border-dashed border-2 border-muted-foreground/50 cursor-pointer hover:border-primary transition-colors group"
                  onClick={() => {
                    setSelectedFolderId(folder.id);
                    setShowAddAgentDialog(true);
                  }}
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors bg-muted group-hover:bg-gradient-to-r from-primary-from to-primary-to text-primary-text">
                    <Plus className="h-6 w-6 text-primary " />
                  </div>
                  <p className="text-sm font-medium text-foreground">{t('agent.createAgent')}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t('agent.noAgents')}</p>
                </Card>
                )}
                {/* Render AgentsForFolder component for this folder */}
                <AgentsForFolder folderId={folder.id} navigate={navigate} />
              </div>
            </div>
          ))
        ) : (
          <div className="text-sm text-muted-foreground text-center py-10">{t('folder.noFolders')}</div>
        )}
      </div>

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
      <AddAgentDialog open={showAddAgentDialog} onOpenChange={setShowAddAgentDialog} folderId={selectedFolderId} />

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    onSearchChange(newQuery);
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
          className="pl-9"
          value={query}
          onChange={handleChange}
        />
      </div>
    </div>
  );
});

// New component to fetch and display agents for a folder
const AgentsForFolder: React.FC<{ folderId: string, navigate: any }> = React.memo(({ folderId, navigate }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { t } = useTranslation();
  const { data: agentsData, isLoading: isLoadingAgents, error: agentsError } = useQuery({
    queryKey: ['agentsByFolder', folderId],
    queryFn: () => {
      console.log('Fetching agents for folder:', folderId);
      return getAgentsByFolder(folderId);
    },
    enabled: !!folderId,
    staleTime: 300000, // Keep data fresh for 5 minutes
  });

  if (isLoadingAgents) {
    return <Skeleton className="h-32 w-full" />;
  }

  if (agentsError) {
    console.error('Lỗi khi tải agents cho folder', folderId, ':', agentsError);
    return <div className="text-sm text-red-500">{t('agent.errorLoadingAgents')}</div>;
  }

  const agents = agentsData?.data || [];

  // Hiển thị thông báo nếu không có agent nào trong thư mục
  if (agents.length === 0) {
    return <div className="text-muted-foreground text-center w-full">{t('agent.noAgents')}</div>;
  }

  return (
    <>
      {agents.map((agent: Agent) => (
        <Card
          key={agent.id}
          className={`flex items-center p-4 space-x-4 cursor-pointer hover:bg-primary/50 transition-colors h-40 card-gradient-white ${isDark ? 'hover:bg-blue-800/20' : 'hover:bg-purple-200/20'}`}
          onClick={() => navigate(`/dashboard/agents/${agent.id}`)}
        >
          <Avatar className="w-12 h-12">
            {agent.avatar ? (
              <div dangerouslySetInnerHTML={{ __html: agent.avatar }} style={{ width: 48, height: 48 }} />
            ) : (
              <div dangerouslySetInnerHTML={{ __html: createAvatar(adventurer , { seed: agent.name || 'Agent' }).toString() }} style={{ width: 48, height: 48 }} />
            )}
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <CardTitle className="text-lg truncate">{agent.name}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground line-clamp-2">{agent.role_description}</CardDescription>
          </div>
        </Card>
      ))}
    </>
  );
});

export default Dashboard;
