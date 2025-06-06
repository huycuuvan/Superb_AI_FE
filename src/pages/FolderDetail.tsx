import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelectedWorkspace } from '@/hooks/useSelectedWorkspace';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Folder, Search, MoreVertical, Edit, Pin, Trash, Plus } from 'lucide-react';
import { Agent } from '@/types'; // Import Agent type if needed for placeholder structure
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { AddAgentDialog } from '@/components/AddAgentDialog';
import { getFolderDetail, FolderDetailResponse, getAgentsByFolder } from '@/services/api';
import { useAuth } from '@/hooks/useAuth'; // Import useAuth

// Tạm thời định nghĩa kiểu FolderType cho hiển thị tên
interface FolderType {
  id: string;
  name: string;
  workspace_id: string;
  description?: string;
}

const FolderDetail = () => {
  const { folderId } = useParams<{ folderId: string }>();
  const { workspace, isLoading: isLoadingWorkspace } = useSelectedWorkspace();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [folder, setFolder] = useState<FolderType | null>(null);
  const [loadingFolderDetail, setLoadingFolderDetail] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [agents, setAgents] = useState<Agent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [showAddAgentDialog, setShowAddAgentDialog] = useState(false);
  const [selectedAgentFolderId, setSelectedAgentFolderId] = useState<string | undefined>(undefined);
  const { canCreateAgent } = useAuth(); // Lấy canCreateAgent từ useAuth

  // Logic fetch folder detail
  useEffect(() => {
    const fetchFolderDetail = async () => {
      if (folderId && workspace?.id) {
        setLoadingFolderDetail(true);
        setError(null);
        try {
          const data = await getFolderDetail(folderId, workspace.id);
          setFolder(data.data);
        } catch (err: unknown) {
          setError(err instanceof Error ? err.message : 'Lỗi khi lấy chi tiết folder');
        } finally {
          setLoadingFolderDetail(false);
        }
      } else if (!folderId) {
        setError('Không tìm thấy Folder ID.');
        setLoadingFolderDetail(false);
      } else if (!workspace?.id) {
        setError('Không tìm thấy Workspace ID.');
        setLoadingFolderDetail(false);
      }
    };

    if (!isLoadingWorkspace) {
      fetchFolderDetail();
    }
  }, [folderId, workspace?.id, isLoadingWorkspace]);

  // Logic fetch agents
  useEffect(() => {
    const fetchAgents = async () => {
      if (folderId) {
        setLoadingAgents(true);
        try {
          const response = await getAgentsByFolder(folderId);
          setAgents(response.data || []);
        } catch (err: unknown) {
          console.error('Error fetching agents:', err);
          setAgents([]);
        } finally {
          setLoadingAgents(false);
        }
      }
    };

    fetchAgents();
  }, [folderId]);

  // Filter agents based on search query
  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (agent.role_description && agent.role_description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loadingFolderDetail) {
     return (
       <div className="flex flex-col space-y-4 p-6">
         <Skeleton className="h-8 w-1/4" />
         <Skeleton className="h-6 w-1/3" />
         <Skeleton className="h-4 w-1/2" />
         <Skeleton className="h-10 w-full mt-4" />
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className={`h-32 md:h-40 rounded-xl ${theme === 'teampal-pink' ? 'bg-teampal-100' : theme === 'blue' ? 'bg-blue-100' : theme === 'purple' ? 'bg-purple-100' : 'bg-muted'}`}
            />
          ))}
         </div>
       </div>
     );
   }

   if (error) {
     return <div className="text-red-500 p-6">Error: {error}</div>;
   }

   if (!folder) {
     return <div className="text-muted-foreground p-6">Không tìm thấy chi tiết folder.</div>;
   }

  return (
    <div className="space-y-6 p-6 ">
      {/* Header Folder Detail */}
      <div className="flex items-center gap-2 mb-4">
        <Folder className="h-6 w-6 text-primary-text" />
        <h1 className="text-2xl font-bold text-primary-text">{folder.name}</h1> {/* Hiển thị tên folder từ API */}
        {/* Thêm Dropdown menu cho folder actions nếu cần */}
      </div>

      {/* Agents Section Header with Search and Create Button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
         <h2 className="text-xl font-semibold text-primary-text">Agents ({filteredAgents.length})</h2>
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
           {/* Thêm dropdown filter/sort nếu cần */}
           {/* <DropdownMenu>...</DropdownMenu> */}
            {/* Sử dụng canCreateAgent để điều kiện hiển thị button */}
            {canCreateAgent && (
              <Button
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-teampal-500 text-white font-medium hover:opacity-90 transition w-full sm:w-auto"
                 onClick={() => {
                  setSelectedAgentFolderId(folder?.id);
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
        {loadingAgents ? (
          // Loading skeletons
          Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className={`h-32 md:h-40 rounded-xl ${theme === 'teampal-pink' ? 'bg-teampal-100' : theme === 'blue' ? 'bg-blue-100' : theme === 'purple' ? 'bg-purple-100' : 'bg-muted'}`} />
          ))
        ) : filteredAgents.length === 0 ? (
          // Empty state
          <>
            {/* Sử dụng canCreateAgent để điều kiện hiển thị Card thêm agent */}
            {canCreateAgent && folder?.id && (
              <Card 
                className="bg-teampal-50/50 border-dashed border-2 border-teampal-200 rounded-xl hover:bg-gradient-to-r from-primary-from to-primary-to text-primary-text transition-colors cursor-pointer group"
                onClick={() => {
                  setSelectedAgentFolderId(folder.id);
                  setShowAddAgentDialog(true);
                }}
              >
                <CardContent className="flex flex-col items-center justify-center h-32 md:h-40 p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-from to-primary-to text-primary-text flex items-center justify-center mb-3 group-hover:bg-teampal-200 transition-colors">
                    <Plus className="h-6 w-6 text-teampal-500" />
                  </div>
                  <p className="text-sm text-teampal-600 font-medium">Thêm agent mới</p>
                  <p className="text-xs text-teampal-500 mt-1">Chưa có agent nào trong thư mục này.</p>
                </CardContent>
              </Card>
            )}
            {!canCreateAgent && (
               <div className="text-muted-foreground text-center w-full col-span-full">Không có agent nào trong thư mục này.</div>
            )}
          </>
        ) : (
          // Agent cards
          filteredAgents.map((agent) => (
            <Card 
              key={agent.id} 
              className=" border-none rounded-xl shadow-sm hover:shadow-md hover:bg-gradient-to-r from-primary-from to-primary-to text-primary-text transition-shadow cursor-pointer"
              onClick={() => navigate(`/dashboard/agents/${agent.id}`)}
            >
              <CardHeader className="pb-2 md:pb-3 ">
                <div className="flex items-center gap-2 md:gap-3">
                  <Avatar className="h-10 w-10 md:h-12 md:w-12 rounded-full overflow-hidden border bg-gradient-to-r from-primary-from to-primary-to text-primary-text flex items-center justify-center">
                    <AvatarImage
                      src={agent.avatar}
                      alt={agent.name}
                    />
                    <AvatarFallback className=" font-bold text-lg md:text-xl bg-gradient-to-r from-primary-from to-primary-to text-primary-text">
                      {agent.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base md:text-lg font-semibold">{agent.name}</CardTitle>
                    {agent.role_description && (
                      <CardDescription className="text-xs md:text-sm text-muted-foreground mt-1 line-clamp-2">
                        {agent.role_description}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              {/* Có thể thêm CardContent cho agent details nếu cần */}
            </Card>
          ))
        )}
      </div>

      {/* Add Agent Dialog */}
      <AddAgentDialog 
        open={showAddAgentDialog} 
        onOpenChange={setShowAddAgentDialog} 
        folderId={selectedAgentFolderId}
      />
    </div>
  );
};

export default FolderDetail; 