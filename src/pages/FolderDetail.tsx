import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelectedWorkspace } from '@/hooks/useSelectedWorkspace';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Folder, Search, Plus } from 'lucide-react';
import { Agent } from '@/types';
import { Button } from '@/components/ui/button';
import AgentDialog from '@/components/AgentDialog';
import { createAgent } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { useAgentsByFolders } from '@/hooks/useAgentsByFolders';
import { useQueryClient } from '@tanstack/react-query';
import { AgentCard } from '@/components/Agents/AgentCard';
import { useTheme } from '@/hooks/useTheme';

interface Pagination {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

interface FolderWithAgents {
  id: string;
  name: string;
  workspace_id: string;
  agents: Agent[];
  pagination: Pagination;
}

interface AgentsByFoldersResponse {
  data: FolderWithAgents[];
}

const PAGE_SIZE = 12;

const FolderDetail = () => {
  const { folderId } = useParams<{ folderId: string }>();
  const { workspace } = useSelectedWorkspace();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddAgentDialog, setShowAddAgentDialog] = useState(false);
  const [selectedAgentFolderId, setSelectedAgentFolderId] = useState<string | undefined>(undefined);
  const { canCreateAgent } = useAuth();

  const [page, setPage] = useState(1);
  const [allAgents, setAllAgents] = useState<Agent[]>([]);
  const loaderRef = useRef(null);

  // Fetch agents by folder
  const folderIds = folderId ? [folderId] : [];
  const { data: agentsByFoldersData, isLoading: loadingAgents } = useAgentsByFolders(folderIds, page, PAGE_SIZE);
  
  // Get folder info from agentsByFoldersData
  const folderInfo = agentsByFoldersData?.data?.[0];
  const agents = folderInfo?.agents || [];
  const pagination = folderInfo?.pagination;

  // Gộp dữ liệu các trang và kiểm tra có trang tiếp theo
  useEffect(() => {
    if (page === 1) {
      setAllAgents(agents);
    } else if (agents && agents.length > 0) {
      setAllAgents(prev => {
        const ids = new Set(prev.map(a => a.id));
        const newAgents = [...prev, ...agents.filter(a => !ids.has(a.id))];
        return newAgents;
      });
    }
  }, [agents, page]);

  // Reset khi folderId đổi
  useEffect(() => {
    setPage(1);
  }, [folderId]);

  // Intersection Observer để load thêm agent khi cuộn tới cuối
  useEffect(() => {
    if (!loaderRef.current) return;
    const observer = new window.IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loadingAgents && pagination?.has_next) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 1 }
    );
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loadingAgents, pagination]);

  // Filter agents based on search query
  const filteredAgents = allAgents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.role_description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.job_brief?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.position?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  console.log('Debug FolderDetail:', {
    folderIds,
    agentsByFoldersData,
    folderInfo,
    agents,
    allAgents,
    filteredAgents
  });

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
    queryClient.invalidateQueries({ queryKey: ['agents', 'agents-by-folders'] });
    setShowAddAgentDialog(false);
  }

  if (loadingAgents && allAgents.length === 0) {
    return (
      <div className="flex flex-col space-y-4 p-6">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-10 w-full mt-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className={`h-32 md:h-40 rounded-xl ${theme === 'teampal-pink' ? 'bg-teampal-100' : theme === 'blue' ? 'bg-blue-100' : theme === 'purple' ? 'bg-purple-100' : 'bg-muted'}`} />
          ))}
        </div>
      </div>
    );
  }

  if (!folderInfo) {
    return <div className="text-muted-foreground p-6">Không tìm thấy thông tin folder.</div>;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header Folder Detail */}
      <div className="flex items-center gap-2 mb-4">
        <Folder className="h-6 w-6 text-primary-text" />
        <h1 className="text-2xl font-bold text-primary-text">{folderInfo.name}</h1>
      </div>

      {/* Agents Section Header with Search and Create Button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-xl font-semibold text-primary-text">
          Agents ({pagination?.total || filteredAgents.length})
        </h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Find agent in this folder"
              className="pl-8 bg-muted/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {canCreateAgent && (
            <Button
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-teampal-500 text-white font-medium hover:opacity-90 transition w-full sm:w-auto"
              onClick={() => {
                setSelectedAgentFolderId(folderInfo?.id);
                setShowAddAgentDialog(true);
              }}
            >
              <span className="text-lg">+</span> Create agent
            </Button>
          )}
        </div>
      </div>

      {/* Agents List Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {loadingAgents && allAgents.length === 0 ? (
          // Loading skeletons
          Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className={`h-32 md:h-40 rounded-xl ${theme === 'teampal-pink' ? 'bg-teampal-100' : theme === 'blue' ? 'bg-blue-100' : theme === 'purple' ? 'bg-purple-100' : 'bg-muted'}`} />
          ))
        ) : filteredAgents.length === 0 ? (
          // Empty state
          <>
            {canCreateAgent && folderInfo?.id && (
              <Card 
                className="bg-card/50 border-2 border-dashed border-primary/20 rounded-xl cursor-pointer hover:border-primary/40 hover:bg-card/80"
                onClick={() => {
                  setSelectedAgentFolderId(folderInfo.id);
                  setShowAddAgentDialog(true);
                }}
              >
                <CardContent className="flex flex-col items-center justify-center h-32 md:h-40 p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:bg-primary/20">
                    <Plus className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Thêm agent mới</p>
                  <p className="text-xs text-muted-foreground mt-1">Chưa có agent nào trong thư mục này.</p>
                </CardContent>
              </Card>
            )}
            {!canCreateAgent && (
              <div className="text-muted-foreground text-center w-full col-span-full">Không có agent nào trong thư mục này.</div>
            )}
          </>
        ) :
          // Agent cards
          filteredAgents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))
        }
        {/* Loader để IntersectionObserver quan sát */}
        <div ref={loaderRef} style={{ height: 40 }} />
        {loadingAgents && allAgents.length > 0 && <div className="col-span-full text-center py-2">Đang tải thêm...</div>}
      </div>

      {/* Add Agent Dialog */}
      <AgentDialog 
        open={showAddAgentDialog} 
        onOpenChange={setShowAddAgentDialog} 
        folderId={selectedAgentFolderId}
        mode="add"
        onSave={handleAddAgent}
        onCancel={() => setShowAddAgentDialog(false)}
      />
    </div>
  );
};

export default FolderDetail; 