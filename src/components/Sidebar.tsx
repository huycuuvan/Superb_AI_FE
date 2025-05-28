/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Users, 
  CheckCircle, 
  Settings as SettingsIcon, 
  Search, 
  ChevronRight,
  Plus,
  Briefcase,
  Palette,
  ShoppingCart,
  Cpu,
  TrendingUp,
  Folder,
  MoreVertical,
  Edit,
  Pin,
  Trash,
  Book
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { workspaces } from '@/services/mockData';
import { AddFolderDialog } from '@/components/AddFolderDialog';
import { useLanguage } from '@/hooks/useLanguage';
import SettingsDropdown from '@/components/SettingsDropdown';
import { AddAgentDialog } from '@/components/AddAgentDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import './Sidebar.css';
import { useAuth } from '@/hooks/useAuth';
import { getFolders, updateFolder, deleteFolder } from '@/services/api';
import { useSelectedWorkspace } from '@/hooks/useSelectedWorkspace';
import { useToast } from '@/components/ui/use-toast';
import { useFolders } from '@/contexts/FolderContext';

interface SidebarProps {
  className?: string;
}

interface FolderType {
  id: string;
  name: string;
  workspace_id: string;
}

const Sidebar = ({ className }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const { t } = useLanguage();
  const [showAddFolderDialog, setShowAddFolderDialog] = useState(false);
  const [showAddAgentDialog, setShowAddAgentDialog] = useState<{open: boolean, folderId?: string}>({open: false, folderId: undefined});
  const { user } = useAuth();
  const { workspace, isLoading: isLoadingWorkspace } = useSelectedWorkspace();
  const { toast } = useToast();
  const { folders, loadingFolders, fetchFolders } = useFolders();

  // State for rename functionality
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [folderToRename, setFolderToRename] = useState<FolderType | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);

  // State for delete functionality
  const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<FolderType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (workspace?.id) {
      fetchFolders(workspace.id);
    }
  }, [workspace?.id, fetchFolders]);

  // Handle Rename action
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
      fetchFolders(workspace?.id); // Cập nhật danh sách folder sau khi đổi tên
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

  // Handle Delete action
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
      fetchFolders(workspace?.id); // Cập nhật danh sách folder sau khi xóa
      setShowConfirmDeleteDialog(false);
       // Redirect if currently viewing the deleted folder's detail page
      if (location.pathname === `/dashboard/folder/${folderToDelete.id}`) {
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

  console.log(user);
  const menuItems = [
    { icon: Home, label: t('home'), path: '/dashboard' },
    { icon: Users, label: t('agents'), path: '/dashboard/agents' },
    { icon: CheckCircle, label: t('tasks'), path: '/dashboard/tasks' },
    { icon: Book, label: 'Knowledge', path: '/dashboard/knowledge' },
    { icon: SettingsIcon, label: t('settings'), path: '/dashboard/settings' },
  ];

  return (
    <>
      <aside 
        className={cn(
          "relative flex flex-col h-full bg-white border-r border-border transition-all duration-300 dark:bg-slate-900 dark:border-slate-800",
          collapsed ? "w-16" : "w-64",
          className
        )}
      >
        <div className="flex items-center p-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <div className="bg-teampal-500 text-white p-1.5 rounded">
              <span className="font-bold text-sm">TP</span>
            </div>
            {!collapsed && (
              <span className="font-bold text-lg">Superb AI</span>
            )}
          </div>
          <button 
            className="ml-auto text-gray-500 hover:text-gray-700"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronRight className={cn("h-4 w-4 transition-transform", collapsed ? "" : "rotate-180")} />
          </button>
        </div>
        
        {!collapsed && (
          <div className="p-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder={t('search')}
                className="pl-8 bg-muted/50"
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between px-3 py-2 border-t border-b border-border">
          <div className="flex items-center space-x-2 max-w-[140px]">
            {workspace?.name.startsWith('AI') && (
              <div className="w-6 h-6 rounded-full bg-teampal-500 flex items-center justify-center text-white text-xs font-medium">
                AI
              </div>
            )}
            {!collapsed && (
              <div className="text-lg font-bold truncate max-w-[100px]">{workspace?.name}'s workspace</div>
            )}
          </div>
          {!collapsed && (
            <Button 
              variant="outline" 
              size="icon" 
              className="h-6 w-6 ml-1 border-teampal-500 text-teampal-500 hover:bg-teampal-100 hover:text-teampal-700"
              onClick={() => setShowAddFolderDialog(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="flex-1 min-h-0 overflow-y-auto py-2">
          {loadingFolders ? (
            <div className="px-3 py-2 text-muted-foreground text-sm">Đang tải thư mục...</div>
          ) : (
            folders?.map((folder) => (
              <div
                key={folder.id}
                className={cn(
                  "flex items-center px-3 py-2 mx-2 rounded-md text-sm cursor-pointer",
                  "hover:bg-accent hover:text-accent-foreground",
                  "transition-colors"
                )}
                onClick={() => navigate(`/dashboard/folder/${folder.id}`)}
              >
                <div className="flex items-center w-full">
                  <Folder className="sidebar-icon mr-2" />
                  {!collapsed && <span className="truncate flex-1">{folder.name}</span>}
                  {!collapsed && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="rounded-full p-1.5 hover:bg-accent/50 focus:outline-none ml-1" onClick={e => e.stopPropagation()}>
                          <MoreVertical className="sidebar-icon text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleRenameClick(folder)}>
                          <Edit className="sidebar-icon mr-2" /> Đổi tên
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => alert(`Pin ${folder.name}`)}>
                          <Pin className="sidebar-icon mr-2" /> Ghim
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteClick(folder)} className="text-red-600 focus:text-red-600">
                          <Trash className="sidebar-icon mr-2" /> Xoá
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* fixed in the bottom of the sidebar */}
        <div className="absolute bottom-0 left-0 w-full bg-white border-t border-border pt-2 pb-3 z-10">
          <div className="border-b border-border p-2 space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md text-sm",
                    isActive 
                      ? "bg-accent text-accent-foreground" 
                      : "hover:bg-accent/50 hover:text-accent-foreground",
                    "transition-colors"
                  )}
                >
                  <item.icon className="sidebar-icon mr-2" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
          <div className="p-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-teampal-200 flex items-center justify-center text-foreground">
                {user?.name ? user.name.charAt(0) : 'U'}
              </div>
              {!collapsed && (
                <div className="text-sm">{user?.name || 'Guest'}</div>
              )}
            </div>
            {!collapsed && <SettingsDropdown />}
          </div>
        </div>
      </aside>

      {/* Dialog: Rename Folder */}
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

      {/* Dialog: Confirm Delete Folder */}
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

      {/* Dialog: Add Folder (existing) */}
      {showAddFolderDialog && (
        <AddFolderDialog 
          open={showAddFolderDialog} 
          onOpenChange={setShowAddFolderDialog} 
          onSuccess={() => workspace?.id && fetchFolders(workspace.id)}
        />
      )}

      {/* Dialog: Add Agent (existing) */}
      {showAddAgentDialog.open && (
        <AddAgentDialog open={showAddAgentDialog.open} onOpenChange={open => setShowAddAgentDialog({open, folderId: undefined})} folderId={showAddAgentDialog.folderId} />
      )}
    </>
  );
};

export default Sidebar;

