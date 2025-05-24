/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { agents } from "@/services/mockData";
import { Agent } from "@/types";
import { Folder, MoreVertical, Edit, Pin, Trash, Plus } from 'lucide-react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getFolders, updateFolder, deleteFolder, getAgentsByFolder } from '@/services/api';
import { useSelectedWorkspace } from '@/hooks/useSelectedWorkspace';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useFolders } from '@/contexts/FolderContext';
import { useQuery } from '@tanstack/react-query';

interface FolderType {
  id: string;
  name: string;
  workspace_id: string;
}

const Dashboard = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const { folders, loadingFolders, fetchFolders, setFolders } = useFolders();
  const { workspace } = useSelectedWorkspace();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [folderToRename, setFolderToRename] = useState<FolderType | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);

  const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<FolderType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const agentsByCategory = agents.reduce((acc, agent) => {
    const category = agent.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(agent);
    return acc;
  }, {} as Record<string, Agent[]>);

  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const [showAddAgentDialog, setShowAddAgentDialog] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (workspace?.id) {
      // fetchFolders(workspace.id); // Remove this line
    }
  }, [workspace?.id, fetchFolders]);

  useEffect(() => {
    if (editingFolder && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingFolder]);

  const handleRenameClick = (folder: FolderType) => {
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
        title: "Thành công!",
        description: `Đã đổi tên folder thành "${newFolderName.trim()}".`,
      });
      if (workspace?.id) {
        fetchFolders(workspace.id);
      }
      setShowRenameDialog(false);
    } catch (error: any) {
      console.error('Lỗi khi đổi tên folder:', error);
      toast({
        title: "Lỗi!",
        description: `Không thể đổi tên folder: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDeleteClick = (folder: FolderType) => {
    setFolderToDelete(folder);
    setShowConfirmDeleteDialog(true);
  };

  const handleDeleteFolder = async () => {
    if (!folderToDelete) return;

    setIsDeleting(true);
    try {
      await deleteFolder(folderToDelete.id);
      toast({
        title: "Thành công!",
        description: `Đã xóa folder "${folderToDelete.name}".`,
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
        title: "Lỗi!",
        description: `Không thể xóa folder: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const recentChats = [
    {
      id: '1',
      title: 'Create a mood board for a new product',
      agentId: 'agent-2',
      agentName: 'Web',
      agentAvatar: 'https://api.dicebear.com/7.x/personas/svg?seed=Web',
      lastUpdate: '2025/05/13 - 15:38',
    },
  ];

  const handlePin = (name: string) => {
    setFolders(prev => {
      const idx = prev.findIndex(f => f.name === name);
      if (idx === -1) return prev;
      const pinned = prev[idx];
      return [pinned, ...prev.slice(0, idx), ...prev.slice(idx + 1)];
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Welcome to your Superb AI dashboard. Manage your AI agents and tasks.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
          <button
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-teampal-500 text-white font-medium hover:opacity-90 transition w-full sm:w-auto"
            onClick={() => setShowAddAgentDialog(true)}
          >
            <span className="text-lg">+</span> Create agent
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-border bg-white font-medium hover:bg-accent/50 transition w-full sm:w-auto">
            <span className="text-lg">+</span> Create folder
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {loadingFolders ? (
          <div className="text-sm text-muted-foreground">Đang tải thư mục...</div>
        ) : folders.length > 0 ? (
          folders.map((folder) => (
            <div key={folder.id} className="mb-8 md:mb-10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Folder className="h-5 w-5 text-teampal-500" />
                  <h2 
                    className="text-lg md:text-xl font-bold cursor-pointer hover:underline"
                    onClick={() => navigate(`/dashboard/folder/${folder.id}`)}
                  >
                    {folder.name}
                  </h2>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="rounded-full p-1.5 hover:bg-accent/50 focus:outline-none">
                      <MoreVertical className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleRenameClick(folder)}>
                      <Edit className="h-4 w-4 mr-2" /> Đổi tên
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handlePin(folder.name)}>
                      <Pin className="h-4 w-4 mr-2" /> Ghim
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeleteClick(folder)} className="text-red-600 focus:text-red-600">
                      <Trash className="h-4 w-4 mr-2" /> Xoá
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                <AgentsForFolder folderId={folder.id} />
                <Card 
                  className="bg-teampal-50/50 border-dashed border-2 border-teampal-200 rounded-xl hover:border-teampal-300 transition-colors cursor-pointer group"
                  onClick={() => {
                    setSelectedFolderId(folder.id);
                    setShowAddAgentDialog(true);
                  }}
                >
                  <CardContent className="flex flex-col items-center justify-center h-32 md:h-40 p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-teampal-100 flex items-center justify-center mb-3 group-hover:bg-teampal-200 transition-colors">
                      <Plus className="h-6 w-6 text-teampal-500" />
                    </div>
                    <p className="text-sm text-teampal-600 font-medium">Thêm agent mới</p>
                    <p className="text-xs text-teampal-500 mt-1">Chưa có agent nào trong thư mục này</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))
        ) : (
          <div className="text-sm text-muted-foreground">Chưa có thư mục nào</div>
        )}
      </div>

      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Đổi tên Folder</DialogTitle>
            <DialogDescription>
              Nhập tên mới cho folder "{folderToRename?.name}".
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-folder-name" className="text-right">
                Tên mới
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
            <Button variant="outline" onClick={() => setShowRenameDialog(false)} disabled={isRenaming}>Hủy</Button>
            <Button onClick={handleRenameFolder} disabled={!newFolderName.trim() || isRenaming}>
              {isRenaming ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showConfirmDeleteDialog} onOpenChange={setShowConfirmDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa Folder</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa folder "{folderToDelete?.name}"? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDeleteDialog(false)} disabled={isDeleting}>Hủy</Button>
            <Button variant="destructive" onClick={handleDeleteFolder} disabled={isDeleting}>
               {isDeleting ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddAgentDialog open={showAddAgentDialog} onOpenChange={setShowAddAgentDialog} folderId={selectedFolderId} />
    </div>
  );
};

// New component to fetch and display agents for a folder
const AgentsForFolder: React.FC<{ folderId: string }> = ({ folderId }) => {
  const { data: agentsData, isLoading: isLoadingAgents, error: agentsError } = useQuery({
    queryKey: ['agentsByFolder', folderId],
    queryFn: () => {
      return getAgentsByFolder(folderId);
    },
    enabled: !!folderId,
  });

  console.log('Rendering AgentsForFolder for folder', folderId, '; isLoading:', isLoadingAgents, '; agentsData:', agentsData); // Log on render

  if (isLoadingAgents) {
    return <Skeleton className="h-32 w-full" />;
  }

  if (agentsError) {
    console.error('Lỗi khi tải agents cho folder', folderId, ':', agentsError);
    return <div className="text-sm text-red-500">Lỗi tải agents.</div>;
  }

  const agents = agentsData?.data || [];

  return (
    <>
      {agents.map((agent: Agent) => (
        <Card key={agent.id} className="flex items-center p-4 space-x-4">
          <Avatar className="w-12 h-12">
             {/* Replace with actual agent avatar if available */}
            <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center text-blue-800 text-lg font-medium">
              {agent.name.charAt(0)}
            </div>
          </Avatar>
          <div>
            <CardTitle className="text-lg">{agent.name}</CardTitle>
            <CardDescription>{agent.role_description}</CardDescription>
          </div>
        </Card>
      ))}
    </>
  );
};

export default Dashboard;
