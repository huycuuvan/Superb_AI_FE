/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Agent, Folder } from "@/types";

import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from '@/hooks/useTheme';
import { useState, useEffect, useRef } from 'react';
import {

} from '@/components/ui/dropdown-menu';
import AgentDialog from '@/components/AgentDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { updateFolder, deleteFolder, createAgent   } from '@/services/api';
import { useSelectedWorkspace } from '@/hooks/useSelectedWorkspace';
import { useToast } from '@/components/ui/use-toast';
import { useFolders } from '@/contexts/FolderContext';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import React from 'react';
import { useTranslation } from "react-i18next";

import { useAgentsByFolders } from '@/hooks/useAgentsByFolders';
import { AgentCard } from "@/components/Agents/AgentCard";
import AgentCardSkeleton from "@/components/skeletons/AgentCardSkeleton";


interface FolderWithAgents {
  id: string;
  name: string;
  agents: Agent[];
}

const Dashboard = () => {
  const { theme } = useTheme();
  const { folders, loadingFolders, errorFolders, fetchFolders, setFolders } = useFolders();
  const { workspace } = useSelectedWorkspace();
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
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>('all');

  const { t } = useTranslation();

  const folderIds = Array.isArray(folders) ? folders.map(f => f.id) : [];
  const { data: agentsByFoldersData, isLoading: isLoadingAgents, error: agentsError } = useAgentsByFolders(folderIds, 1, 1000);
  let foldersWithAgents: FolderWithAgents[] = [];
  if (Array.isArray(agentsByFoldersData?.data) && agentsByFoldersData.data.length > 0 && Array.isArray(agentsByFoldersData.data[0].agents)) {
    foldersWithAgents = agentsByFoldersData.data as FolderWithAgents[];
  }
  useEffect(() => {
    if (folders && folders.length > 0) {
      const allAgentsFolder = folders.find(f => f.name === 'All Agents' || f.id === 'all');
      if (allAgentsFolder) {
        setSelectedFolderId(allAgentsFolder.id);
      }
    }
  }, [folders]);


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
        {folders?.map(folder => (
          <Badge
            key={folder.id}
            variant={selectedFolderId === folder.id ? 'default' : 'outline'}
            className="cursor-pointer hover:bg-primary/80"
            onClick={() => setSelectedFolderId(folder.id)}
          >
            {folder.name}
          </Badge>
        ))}
      </div>

      <div>
  {/* Skeleton khi loading */}
  {isLoadingAgents ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, idx) => (
        <AgentCardSkeleton key={idx} />
      ))}
    </div>
  ) : (
    foldersWithAgents.length === 0 ? (
      <div className="text-muted-foreground text-center w-full">{t('agent.noAgents')}</div>
    ) : (
      (selectedFolderId == null
        ? foldersWithAgents
        : foldersWithAgents.filter(folder => folder.id === selectedFolderId)
      ).map(folder => (
        <div key={folder.id} className="mb-8">
          <h2 className="text-xl font-semibold mb-2">{folder.name}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {folder.agents.length === 0 ? (
              <div className="text-muted-foreground col-span-full">{t('agent.noAgents')}</div>
            ) : (
              folder.agents.map(agent => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  runningCount={agent.running_count}
                  successfulRuns={agent.successful_runs}
                  totalJobs={agent.total_runs}
                  isRunning={agent.is_running}
                  isScheduled={agent.is_scheduled}
                />
              ))
            )}
          </div>
        </div>
      ))
    )
  )}
</div>


      {/* Dialogs giữ nguyên */}
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
            <Button disabled={!newFolderName.trim() || isRenaming}>
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
            <Button variant="destructive" disabled={isDeleting}>
               {isDeleting ? t('common.deleting') : t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};



export default Dashboard;
