/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Agent, ModelConfig } from "@/types";
import { useNavigate } from "react-router-dom";
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from '@/hooks/useTheme';
import { getAgents } from '@/services/api';
import { useSelectedWorkspace } from '@/hooks/useSelectedWorkspace';
import { AddAgentDialog } from '@/components/AddAgentDialog';
import { MoreVertical, Edit, Trash } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { updateAgent, deleteAgent } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type AgentStatus = 'private' | 'system_public' | 'workspace_shared';

export const Agents = () => {
  const [searchQuery, setSearchQuery] = useState("");
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
  const [editedTemperature, setEditedTemperature] = useState('0.8');

  const { data, isLoading, error } = useQuery({
    queryKey: ['agents', workspace?.id],
    queryFn: () => getAgents(workspace?.id || ''),
    enabled: !!workspace?.id, // Only fetch if workspaceId is available
  });

  // Ensure data.data is an array before processing
  const agentsData: Agent[] = Array.isArray(data?.data) ? data?.data : [];

  // Group agents by category
  const categories = Array.from(new Set(agentsData.map(agent => agent.category || 'Other')));
  
  // Filter agents based on search query
  const filteredAgents = agentsData.filter(agent => 
    agent.name?.toLowerCase().includes(searchQuery.toLowerCase()) || // Use ?. for optional chaining
    agent.type?.toLowerCase().includes(searchQuery.toLowerCase()) || // Use ?. for optional chaining
    (agent.role_description && agent.role_description.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];
  
  const getAgentsByCategory = (category: string) => {
    return filteredAgents.filter(agent => (agent.category || 'Other') === category);
  };

  // Function to handle dialog close and potentially refresh agents
  const handleAddAgentDialogClose = (shouldRefresh?: boolean) => {
    setShowAddAgentDialog(false);
    // useQuery will automatically refetch if the cache is invalidated, so no explicit fetchAgents call needed here
  };

  const handleEditClick = (agent: Agent) => {
    setAgentToEdit(agent);
    setEditedAgentData({
      name: agent.name || '',
      role_description: agent.role_description || '',
      instructions: agent.instructions || '',
      job_brief: agent.job_brief || '',
      language: agent.language || 'Tiếng Việt',
      position: agent.position || '',
      greeting_message: agent.greeting_message || '',
      status: agent.status || 'private',
      model_config: {
        model: agent.model_config?.model || 'gpt-4',
        temperature: agent.model_config?.temperature ?? 0.8,
        webhook_url: agent.model_config?.webhook_url || '',
        build_prompt_webhook_url: '',
      },
    });
    setEditedTemperature(String(agent.model_config?.temperature ?? 0.8));
    setShowEditAgentDialog(true);
  };

  const handleSaveAgentEdit = async () => {
    if (!agentToEdit || Object.keys(editedAgentData).length === 0) return;

    setIsSavingEdit(true);
    try {
      const modelConfigToSend: ModelConfig = {
        model: editedAgentData.model_config?.model || 'gpt-4',
        temperature: parseFloat(editedTemperature || '0.8'), // Chuyển đổi ngược lại thành số
        webhook_url: editedAgentData.model_config?.webhook_url || '',
        build_prompt_webhook_url: '',
      };

      const dataToSend: Partial<Agent> = {
        ...editedAgentData,
        model_config: modelConfigToSend,
      };

      await updateAgent(agentToEdit.id, dataToSend);
      toast({
        title: "Thành công!",
        description: `Đã cập nhật agent "${agentToEdit.name}".`,
      });
      queryClient.invalidateQueries({ queryKey: ['agents'] }); // Invalidate cache to trigger refetch
      setShowEditAgentDialog(false);
      setAgentToEdit(null);
      setEditedAgentData({});
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
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Agents</h1>
          <p className="text-muted-foreground">Manage and interact with your AI agents</p>
        </div>
        {canCreateAgent && (
          <Button className={`${theme === 'dark' ? 'button-gradient-dark' : 'button-gradient-light'} text-white`} onClick={() => setShowAddAgentDialog(true)}>
            Create agent
          </Button>
        )}
      </div>
      
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
            placeholder="Search agents..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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

      {/* Add Agent Dialog */}
      <AddAgentDialog 
        open={showAddAgentDialog} 
        onOpenChange={setShowAddAgentDialog}
        // No need for onSuccess here, useQuery handles refetch
      />

      {/* Edit Agent Dialog */}
      <Dialog open={showEditAgentDialog} onOpenChange={setShowEditAgentDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa Agent</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin cho agent "{agentToEdit?.name}".
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2 no-scrollbar">
            <div className="grid gap-4 py-4">
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-agent-name" className="text-right">Tên</Label>
              <Input 
                id="edit-agent-name"
                className="col-span-3"
                value={editedAgentData.name || ''}
                onChange={(e) => setEditedAgentData({ ...editedAgentData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-agent-role" className="text-right">Mô tả vai trò</Label>
              <Input 
                id="edit-agent-role"
                className="col-span-3"
                value={editedAgentData.role_description || ''}
                onChange={(e) => setEditedAgentData({ ...editedAgentData, role_description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-agent-instructions" className="text-right">Instructions</Label>
              <Textarea 
                id="edit-agent-instructions"
                className="col-span-3"
                value={editedAgentData.instructions || ''}
                onChange={(e) => setEditedAgentData({ ...editedAgentData, instructions: e.target.value })}
                rows={4}
              />
            </div>

            {/* Thông tin cơ bản */} 
            <div className="space-y-4">
              <h3 className="font-medium">Thông tin cơ bản</h3>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-agent-job-brief" className="text-right">
                  Mô tả công việc
                </Label>
                <Textarea
                  id="edit-agent-job-brief"
                  className="col-span-3"
                  value={editedAgentData.job_brief || ''}
                  onChange={(e) => setEditedAgentData({ ...editedAgentData, job_brief: e.target.value })} rows={3} placeholder="Nhập mô tả công việc của agent" />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-agent-language" className="text-right">
                  Ngôn ngữ
                </Label>
                <Input
                  id="edit-agent-language"
                  className="col-span-3"
                  value={editedAgentData.language || ''}
                  onChange={(e) => setEditedAgentData({ ...editedAgentData, language: e.target.value })} placeholder="Nhập ngôn ngữ" />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-agent-position" className="text-right">
                  Vị trí phòng ban
                </Label>
                <Input
                  id="edit-agent-position"
                  className="col-span-3"
                  value={editedAgentData.position || ''}
                  onChange={(e) => setEditedAgentData({ ...editedAgentData, position: e.target.value })} placeholder="Ví dụ: Phòng Kinh doanh, Phòng Kỹ thuật, Phòng Marketing..." />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-agent-greeting-message" className="text-right">
                  Lời chào
                </Label>
                <Textarea
                  id="edit-agent-greeting-message"
                  className="col-span-3"
                  value={editedAgentData.greeting_message || ''}
                  onChange={(e) => setEditedAgentData({ ...editedAgentData, greeting_message: e.target.value })} placeholder="Nhập lời chào mở đầu khi người dùng bắt đầu chat với agent" rows={3} />
              </div>
            </div>

            {/* Cấu hình Model */} 
            <div className="space-y-4">
              <h3 className="font-medium">Cấu hình Model</h3>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-agent-model" className="text-right">
                  Model
                </Label>
                <Select value={editedAgentData.model_config?.model || 'gpt-4'} onValueChange={(value) => setEditedAgentData({ ...editedAgentData, model_config: { ...editedAgentData.model_config, model: value } })}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Chọn model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-agent-temperature" className="text-right">
                  Temperature
                </Label>
                <Input
                  id="edit-agent-temperature"
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  className="col-span-3"
                  value={editedTemperature}
                  onChange={(e) => setEditedTemperature(e.target.value)} />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-agent-webhook-url" className="text-right">
                  Webhook URL
                </Label>
                <Input
                  id="edit-agent-webhook-url"
                  className="col-span-3"
                  value={editedAgentData.model_config?.webhook_url || ''}
                  onChange={(e) => setEditedAgentData({ ...editedAgentData, model_config: { ...editedAgentData.model_config, webhook_url: e.target.value } })} placeholder="Nhập webhook URL" />
              </div>
            </div>

            {/* Cấu hình khác */} 
            <div className="space-y-4">
              <h3 className="font-medium">Cấu hình khác</h3>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-agent-status" className="text-right">
                  Trạng thái
                </Label>
                <Select value={editedAgentData.status || 'private'} onValueChange={(value: AgentStatus) => setEditedAgentData({ ...editedAgentData, status: value })}> 
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Use availableStatuses from AddAgentDialog for consistency if needed, or define locally */} 
                    {[{ value: 'private', label: 'Riêng tư' }, { value: 'workspace_shared', label: 'Chia sẻ workspace' }, { value: 'system_public', label: 'Công khai hệ thống' }].map((statusOption) => ( // Simplified for now, can be made dynamic based on user role
                      <SelectItem key={statusOption.value} value={statusOption.value}>
                        {statusOption.label}
                      </SelectItem>
                    ))} 
                  </SelectContent>
                </Select>
              </div>
            </div>
             {/* Add other fields for editing if needed */} 
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditAgentDialog(false)} disabled={isSavingEdit}>Hủy</Button>
            <Button onClick={handleSaveAgentEdit} disabled={isSavingEdit || !editedAgentData.name}>
              {isSavingEdit ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {agents.map((agent: Agent) => (
        <Card key={agent.id} className="relative">
          <CardHeader>
            <CardTitle>{agent.name}</CardTitle>
            <CardDescription>{agent.type}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{agent.role_description}</p>
            <div className="flex justify-between items-center">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate(`/dashboard/agents/${agent.id}?fromProfile=true`)}
                className="hover:bg-gradient-to-r from-purple-600 to-indigo-600 dark:hover:from-cyan-500 dark:hover:to-blue-600 hover:text-white"
              >
                Chat
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate(`/dashboard/agents/${agent.id}/profile`)} className="hover:bg-gradient-to-r from-purple-600 to-indigo-600 dark:hover:from-cyan-500 dark:hover:to-blue-600 hover:text-white">View Profile</Button>
            </div>
          </CardContent>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="absolute top-2 right-2">
                <MoreVertical className="h-4 w-4 hover:text-primary" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(agent)}>
                <Edit className="mr-2 h-4 w-4 hover:text-primary" /> Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(agent)}>
                <Trash className="mr-2 h-4 w-4 text-destructive" /> Xóa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Card>
      ))}
    </div>
  );
};
