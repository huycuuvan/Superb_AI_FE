import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
import { getFolderDetail, FolderDetailResponse } from '@/services/api';

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

  const [folder, setFolder] = useState<FolderType | null>(null);
  const [loadingFolderDetail, setLoadingFolderDetail] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tạm thời dùng state rỗng cho agents
  const [agents] = useState<Agent[]>([]); // Danh sách agents trống

  const [showAddAgentDialog, setShowAddAgentDialog] = useState(false);
  const [selectedAgentFolderId, setSelectedAgentFolderId] = useState<string | undefined>(undefined);

  // Logic fetch folder detail
  useEffect(() => {
    const fetchFolderDetail = async () => {
      if (folderId && workspace?.id) {
        setLoadingFolderDetail(true);
        setError(null);
        try {
          const data = await getFolderDetail(folderId, workspace.id);
          setFolder(data.data);
        } catch (err: any) {
          setError(err.message || 'Lỗi khi lấy chi tiết folder');
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

  // Không có logic fetch agents ở đây lúc này
  const loadingAgents = false; // Tạm tắt loading agents

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
    <div className="space-y-6 p-6">
      {/* Header Folder Detail */}
      <div className="flex items-center gap-2 mb-4">
        <Folder className="h-6 w-6 text-teampal-500" />
        <h1 className="text-2xl font-bold">{folder.name}</h1> {/* Hiển thị tên folder từ API */}
        {/* Thêm Dropdown menu cho folder actions nếu cần */}
      </div>

      {/* Agents Section Header with Search and Create Button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
         <h2 className="text-xl font-semibold">Agents ({agents.length})</h2> {/* agents.length luôn là 0 */}
         <div className="flex flex-col sm:flex-row gap-4">
           <div className="relative w-full sm:w-64">
             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input
               type="search"
               placeholder="Find agent in this folder"
               className="pl-8 bg-muted/50"
             />
           </div>
           {/* Thêm dropdown filter/sort nếu cần */}
           {/* <DropdownMenu>...</DropdownMenu> */}
            <Button
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-teampal-500 text-white font-medium hover:opacity-90 transition w-full sm:w-auto"
               onClick={() => {
                setSelectedAgentFolderId(folder.id);
                setShowAddAgentDialog(true);
               }}
            >
              <span className="text-lg">+</span> Create agent
            </Button>
         </div>
      </div>

      {/* Agents List Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {/* Hiển thị card placeholder khi không có agent nào (hoặc loading agents) */}
        {(loadingAgents || agents.length === 0) ? (
           <Card 
             className="bg-teampal-50/50 border-dashed border-2 border-teampal-200 rounded-xl hover:border-teampal-300 transition-colors cursor-pointer group"
             onClick={() => {
               setSelectedAgentFolderId(folder.id);
               setShowAddAgentDialog(true);
             }}
           >
             <CardContent className="flex flex-col items-center justify-center h-32 md:h-40 p-6 text-center">
               <div className="w-12 h-12 rounded-full bg-teampal-100 flex items-center justify-center mb-3 group-hover:bg-teampal-200 transition-colors">
                 <Plus className="h-6 w-6 text-teampal-500" />
               </div>
               <p className="text-sm text-teampal-600 font-medium">Thêm agent mới</p>
               <p className="text-xs text-teampal-500 mt-1">Chưa có agent nào trong thư mục này.</p>
             </CardContent>
           </Card>
        ) : (
          // Phần này sẽ hiển thị danh sách agents nếu có data (hiện tại luôn rỗng)
          agents.map((agent) => (
             <Card key={agent.id} className="bg-teampal-50 border-none rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
               <CardHeader className="pb-2 md:pb-3">
                 <div className="flex items-center gap-2 md:gap-3">
                   <Avatar className="h-10 w-10 md:h-12 md:w-12 rounded-full overflow-hidden border bg-white flex items-center justify-center">
                     <AvatarImage
                       src={agent.avatar}
                       alt={agent.name}
                     />
                     <AvatarFallback className="text-teampal-500 font-bold text-lg md:text-xl">
                       {agent.name.charAt(0)}
                     </AvatarFallback>
                   </Avatar>
                   <div>
                     <CardTitle className="text-sm md:text-base font-semibold">{agent.name}</CardTitle>
                     <p className="text-xs text-muted-foreground">{agent.type}</p>
                   </div>
                 </div>
               </CardHeader>
               <CardContent>
                 <CardDescription className="line-clamp-2 text-xs md:text-sm text-foreground/80">
                   {agent.description || "Chưa có mô tả cho agent này."}
                 </CardDescription>
               </CardContent>
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