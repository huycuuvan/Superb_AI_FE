/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Agent } from "@/types";
import { useNavigate } from "react-router-dom";
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from '@/hooks/useTheme';
import { createAgent, getAgents } from '@/services/api';
import { useSelectedWorkspace } from '@/hooks/useSelectedWorkspace';
import { AgentDialog } from '@/components/AgentDialog';
import { MoreVertical, Edit, Trash } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { updateAgent, deleteAgent } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { createAvatar } from '@dicebear/core';
import { adventurer  } from '@dicebear/collection';
import { AgentCard } from "@/components/Agents/AgentCard";
import { useDebounce } from "@uidotdev/usehooks";
import ReactPaginate from 'react-paginate';

type AgentStatus = 'private' | 'system_public' | 'workspace_shared';


export const Agents = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const { theme } = useTheme();
  const { workspace, isLoading: isLoadingWorkspace } = useSelectedWorkspace();
  const [showAddAgentDialog, setShowAddAgentDialog] = useState(false);
  const [showEditAgentDialog, setShowEditAgentDialog] = useState(false);
  const [agentToEdit, setAgentToEdit] = useState<Agent | null>(null);
  const [editedAgentData, setEditedAgentData] = useState<Partial<Agent>>({});
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { canCreateAgent } = useAuth();
  const queryClient = useQueryClient();
  // State cho phân trang
  const [page, setPage] = useState(1);

  console.log('debouncedSearchQuery:', debouncedSearchQuery);
  const { data, isLoading, error } = useQuery({
    queryKey: ['agents', workspace?.id, page, debouncedSearchQuery],
    queryFn: () => getAgents(page, 12, debouncedSearchQuery),
    enabled: !!workspace?.id,
  });

  // Lấy agents từ data.data.data (BE trả về dạng phân trang)
  let agentsData: Agent[] = [];
  let pagination: any = undefined;
  if (data && typeof data === 'object' && data.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
    agentsData = Array.isArray(data.data.data) ? data.data.data : [];
    pagination = data.data.pagination;
  }
  
  // Group agents by category
  const categories = Array.from(new Set(agentsData.map(agent => agent.category || 'Other')));
  
  // Không filter FE nữa, chỉ dùng filter BE
  const filteredAgents = agentsData;
  
  const getAgentsByCategory = (category: string) => {
    return filteredAgents.filter(agent => (agent.category || 'Other') === category);
  };

  const handleEditClick = (agent: Agent) => {
    setAgentToEdit(agent);
    setEditedAgentData({
      name: agent.name || '',
      role_description: agent.role_description || '',
      job_brief: agent.job_brief || '',
      language: agent.language || 'Tiếng Việt',
      position: agent.position || '',
      greeting_message: agent.greeting_message || '',
      status: agent.status || 'private',
      model_config: {
        webhook_url: agent.model_config?.webhook_url || '',
      },
    });
    setShowEditAgentDialog(true);
  };

const handleSaveAgentEdit = async (dataFromDialog: Partial<Agent>) => { 
  if (!agentToEdit) return;

  setIsSavingEdit(true);
  try {
    await updateAgent(agentToEdit.id, dataFromDialog); 

    toast({
      title: "Thành công!",
      description: `Đã cập nhật agent "${dataFromDialog.name || agentToEdit.name}".`,
    });
    queryClient.invalidateQueries({ queryKey: ['agents'] });
    setShowEditAgentDialog(false);
    setAgentToEdit(null);
  } catch (error: any) {
    console.error('Lỗi khi cập nhật agent:', error);
    toast({
      title: "Lỗi!",
      description: `Không thể cập nhật agent: ${error.message}`,
      variant: "destructive",
    });
  } finally {
    setIsSavingEdit(false);
  }
};

  const handleDeleteClick = (agent: Agent) => {
    setAgentToDelete(agent);
    setShowConfirmDeleteDialog(true);
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
      title: "Thành công!",
      description: `Đã tạo agent "${data.name}".`,
    });
      setShowAddAgentDialog(false);
  }

  const handleDeleteAgent = async () => {
    if (!agentToDelete) return;

    setIsDeleting(true);
    try {
      await deleteAgent(agentToDelete.id);
      toast({
        title: "Thành công!",
        description: `Đã xóa agent "${agentToDelete.name}".`,
      });
      queryClient.invalidateQueries({ queryKey: ['agents'] }); // Invalidate cache to trigger refetch
      setShowConfirmDeleteDialog(false);
      setAgentToDelete(null);
    } catch (error: any) {
      console.error('Lỗi khi xóa agent:', error);
      toast({
        title: "Lỗi!",
        description: `Không thể xóa agent: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading || isLoadingWorkspace) {
     return (
       <div className="flex flex-col space-y-4 p-6">
         <Skeleton className="h-8 w-1/4" />
         <Skeleton className="h-6 w-1/3" />
         <Skeleton className="h-4 w-1/2" />
         <Skeleton className="h-10 w-full mt-4" />
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className={`h-40 rounded-xl ${theme === 'teampal-pink' ? 'bg-teampal-100' : theme === 'blue' ? 'bg-blue-100' : theme === 'purple' ? 'bg-purple-100' : 'bg-muted'}`}
            />
          ))}
         </div>
       </div>
     );
   }

   if (error) {
     return <div className="text-red-500 p-6">Error: {(error as Error).message}</div>;
   }

  return (
    <div className="space-y-6 p-6 background-gradient-white ">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Agents</h1>
          <p className="text-muted-foreground">Manage and interact with your AI agents</p>
        </div>
        {canCreateAgent && (
          <Button variant="outline" onClick={() => setShowAddAgentDialog(true)}>
            Create agent
          </Button>
        )}
      </div>
      
      <div className="flex flex-col md:flex-row items-center gap-4  ">
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
            placeholder="Tìm kiếm agent..."
            className="pl-9"
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setPage(1); // Reset về trang 1 khi search mới
            }}
          />
        </div>
      </div>
      
      {/* Only render tabs if there are agents */}
      {categories.length > 0 ? (
        <Tabs defaultValue={categories[0]} className="w-full">
          <TabsList className="mb-4 w-full md:w-auto">
            {categories.map(category => (
              <TabsTrigger key={category} value={category} className="flex-1 md:flex-none">
                {category} <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded-full">{getAgentsByCategory(category).length}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          {categories.map(category => (
            <TabsContent key={category} value={category} className="mt-0">
              <AgentGrid agents={getAgentsByCategory(category)} onEdit={handleEditClick} onDelete={handleDeleteClick} />
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="text-center py-10 text-muted-foreground">
          {searchQuery ? 'Không tìm thấy agent nào' : 'Chưa có agent nào trong workspace này'}
        </div>
      )}

      {/* Pagination with react-paginate */}
      {pagination && (
        <div className="flex justify-center mt-8">
          <ReactPaginate
            previousLabel={"< Previous"}
            nextLabel={"Next >"}
            breakLabel={"..."}
            pageCount={pagination.total_pages}
            forcePage={page - 1}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            onPageChange={({ selected }) => setPage(selected + 1)}
            containerClassName={"flex gap-2"}
            pageClassName={"px-3 py-1 rounded bg-muted text-foreground cursor-pointer"}
            activeClassName={"bg-primary text-white"}
            previousClassName={"px-3 py-1 rounded bg-muted text-foreground cursor-pointer"}
            nextClassName={"px-3 py-1 rounded bg-muted text-foreground cursor-pointer"}
            breakClassName={"px-3 py-1 rounded bg-muted text-foreground"}
            disabledClassName={"opacity-50 cursor-not-allowed"}
          />
        </div>
      )}

      {/* Add Agent Dialog */}
      <AgentDialog 
        open={showAddAgentDialog} 
        onOpenChange={setShowAddAgentDialog}
        mode="add"
        onSave={handleAddAgent}
        onCancel={() => setShowAddAgentDialog(false)}
      />

      {/* Edit Agent Dialog */}
      <AgentDialog 
        open={showEditAgentDialog} 
        onOpenChange={setShowEditAgentDialog}
        mode="edit"
        agentData={agentToEdit}
        isSaving={isSavingEdit}
        onSave={handleSaveAgentEdit}
        onCancel={() => setShowEditAgentDialog(false)}
      />

      {/* Confirm Delete Dialog */}
      <Dialog open={showConfirmDeleteDialog} onOpenChange={setShowConfirmDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa Agent</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa agent "{agentToDelete?.name}" không? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDeleteDialog(false)} disabled={isDeleting}>Hủy</Button>
            <Button variant="destructive" onClick={handleDeleteAgent} disabled={isDeleting}>
              {isDeleting ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

// Separate component for displaying the agent grid
const AgentGrid = ({ agents, onEdit, onDelete }: { agents: Agent[], onEdit: (agent: Agent) => void, onDelete: (agent: Agent) => void }) => {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {agents.map((agent) => (
        <AgentCard
          key={agent.id}
          agent={agent}
          onEdit={onEdit}
          onDelete={onDelete}
          runningCount={agent.running_count !== undefined ? agent.running_count : undefined}
          successfulRuns={agent.successful_runs}
          totalJobs={agent.total_runs}
          isRunning={agent.is_running}
          isScheduled={agent.is_scheduled}
        />
      ))}
    </div>
  );
};
