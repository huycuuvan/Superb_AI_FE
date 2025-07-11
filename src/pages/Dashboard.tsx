/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Agent, Folder } from "@/types";

import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from '@/hooks/useTheme';
import { useState, useEffect, useRef } from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination';
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

import { usePublicAgents, useAgentsByFolders } from '@/hooks/useAgentsByFolders';
import { AgentCard } from "@/components/Agents/AgentCard";
import AgentCardSkeleton from "@/components/skeletons/AgentCardSkeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDebounce } from 'use-debounce';


const Dashboard = () => {
  const { theme } = useTheme();
  const { folders } = useFolders();
  const { workspace } = useSelectedWorkspace();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [folderToRename, setFolderToRename] = useState<Folder | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [showAddAgentDialog, setShowAddAgentDialog] = useState(false);
  const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<Folder | null>(null);
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 400);
  const [filterPosition, setFilterPosition] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12); // 4 cột x 3 hàng, có thể chỉnh nếu muốn

  const { t } = useTranslation();
  // State để lưu agents và phân trang
  const isAllAgents = selectedFolderId === 'all' || selectedFolderId == null;
  const {
    data: publicAgentsData,
    isLoading: isLoadingPublicAgents,
    error: errorPublicAgents
  } = usePublicAgents(page, pageSize, debouncedSearchTerm);
  const {
    data: byFoldersData,
    isLoading: isLoadingByFolders,
    error: errorByFolders
  } = useAgentsByFolders(
    isAllAgents ? [] : [selectedFolderId!],
    page,
    pageSize,
    debouncedSearchTerm ? { search: debouncedSearchTerm } : undefined
  );

  // Lấy agents và phân trang phù hợp
  let agents: Agent[] = [];
  let pagination: any = undefined;
  let isLoadingAgents = false;
  if (isAllAgents) {
    agents = Array.isArray(publicAgentsData?.data?.data) ? (publicAgentsData.data.data as Agent[]) : [];
    pagination = publicAgentsData?.data?.pagination;
    isLoadingAgents = isLoadingPublicAgents;
  } else {
    // byFoldersData.data là mảng các folder, mỗi folder có agents
    const folderAgents = Array.isArray(byFoldersData?.data)
      ? byFoldersData.data.find((f: any) => f.id === selectedFolderId)
      : undefined;
    agents = Array.isArray(folderAgents?.agents) ? folderAgents.agents : [];
    // Lấy pagination đúng từ folderAgents
    pagination = folderAgents?.pagination;
    isLoadingAgents = isLoadingByFolders;
  }
  const totalPages = pagination?.total_pages || 1;
  const currentPage = pagination?.page || page;


  // Reset về trang 1 khi searchTerm thay đổi
  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm]);


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

 

  // Lấy tất cả các vị trí (position) có trong agents để làm filter
  const allPositions = React.useMemo(() => {
    const positions = new Set<string>();
    agents.forEach(agent => {
      if (agent.position) positions.add(agent.position);
    });
    return Array.from(positions);
  }, [agents]);

  // Không cần filter FE nữa, BE đã trả về đúng kết quả

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
      {/* Search & Filter UI */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <Input
          placeholder="Tìm kiếm agent..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="sm:w-64"
        />
  
      </div>

      {/* Folder Chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge
          key="all"
          variant={isAllAgents ? 'default' : 'outline'}
          className="cursor-pointer hover:bg-primary/80"
          onClick={() => { setSelectedFolderId('all'); setPage(1); }}
        >
          {t('common.all')}
        </Badge>
        {folders?.map(folder => (
          <Badge
            key={folder.id}
            variant={selectedFolderId === folder.id ? 'default' : 'outline'}
            className="cursor-pointer hover:bg-primary/80"
            onClick={() => { setSelectedFolderId(folder.id); setPage(1); }}
          >
            {folder.name}
          </Badge>
        ))}
      </div>

      <div>
  {/* Skeleton khi loading */}
  {isLoadingAgents ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: pageSize }).map((_, idx) => (
        <AgentCardSkeleton key={idx} />
      ))}
    </div>
  ) : (
    agents.length === 0 ? (
      <div className="text-muted-foreground text-center w-full">{t('agent.noAgents')}</div>
    ) : (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {(selectedFolderId == null
            ? agents
            : agents // agent public không có folder_id, luôn trả về toàn bộ
          ).map(agent => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination className="mt-6">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={e => { e.preventDefault(); if (currentPage > 1) setPage(currentPage - 1); }}
                  aria-disabled={currentPage === 1}
                  className={currentPage === 1 ? 'opacity-50 pointer-events-none' : ''}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }).map((_, idx) => (
                <PaginationItem key={idx}>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === idx + 1}
                    className={currentPage === idx + 1 ? 'bg-indigo-600 text-white border-indigo-600' : ''}
                    onClick={e => { e.preventDefault(); setPage(idx + 1); }}
                  >
                    {idx + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={e => { e.preventDefault(); if (currentPage < totalPages) setPage(currentPage + 1); }}
                  aria-disabled={currentPage === totalPages}
                  className={currentPage === totalPages ? 'opacity-50 pointer-events-none' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </>
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
