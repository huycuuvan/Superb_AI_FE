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
import React from 'react';
import { useTheme } from '@/hooks/useTheme';


  interface SidebarProps {
    className?: string;
}

interface FolderType {
  id: string;
  name: string;
  workspace_id: string;
}

const Sidebar = React.memo(({ className }: SidebarProps) => {
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
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
      // fetchFolders(workspace.id); // Remove this line
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

  const menuItems = [
    { icon: Home, label: t('home'), path: '/dashboard' },
    { icon: Users, label: t('agents'), path: '/dashboard/agents' },
    { icon: CheckCircle, label: t('tasks'), path: '/dashboard/tasks' },
    { icon: Book, label: 'Knowledge', path: '/dashboard/knowledge' },
    { icon: SettingsIcon, label: t('settings'), path: '/dashboard/settings' },
  ];

  // Lọc menuItems dựa trên quyền hạn
  const filteredMenuItems = menuItems.filter(item => {
    // Ẩn mục Agent nếu user có role là 'user'
    if (item.label === t('agents') && user?.role === 'user') {
      return false; 
    }
    // Ẩn mục Tasks nếu user có role là 'user'
    if (item.label === t('tasks') && user?.role === 'user') {
      return false;
    }
    return true; // Hiển thị các mục khác hoặc user không có role là 'user'
  });

  return (
    <>
      <aside 
        className={cn(
          "relative flex flex-col h-full bg-white border-r border-border transition-all duration-300 dark:bg-slate-900 dark:border-slate-800",
          collapsed ? "w-16" : "w-64",
          className
        )}
      >
        <div className="flex items-center p-[14px] border-b border-border dark:border-slate-800">
          <div className="flex items-center space-x-2">
            
            {!collapsed && (
              <span className="font-bold text-lg text-foreground dark:text-white">Superb AI</span>
            )}
          </div>
          <button 
            className="ml-auto text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronRight className={cn("h-4 w-4 transition-transform", collapsed ? "" : "rotate-180")} />
          </button>
        </div>
        
        {!collapsed && (
          <div className="p-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground dark:text-gray-400" />
              <Input 
                type="search" 
                placeholder={t('search')}
                className="pl-8 bg-muted/50 dark:bg-slate-800 dark:text-white dark:placeholder-gray-400"
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between px-3 py-2 border-t border-b border-border dark:border-slate-800">
          <div className="flex items-center space-x-2 max-w-[140px]">
            {workspace?.name.startsWith('AI') && (
              <div className="w-6 h-6 rounded-full bg-teampal-500 flex items-center justify-center text-white text-xs font-medium">
                AI
              </div>
            )}
            {!collapsed && (
              <div className="text-lg font-bold truncate max-w-[100px] text-foreground dark:text-white">{workspace?.name}'s workspace</div>
            )}
          </div>
          {!collapsed && (
            <Button 
              variant="default" 
              size="icon" 
              className={`h-6 w-6 ml-1 ${isDark ? 'button-gradient-dark' : 'button-gradient-light'} text-white`}
              onClick={() => setShowAddFolderDialog(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="flex-1 min-h-0 overflow-y-auto py-2">
          {loadingFolders ? (
            <div className="px-3 py-2 text-muted-foreground text-sm">Loading...</div>
          ) : (
            folders?.map((folder) => (
              <div
                key={folder.id}
                className={cn(
                  "flex items-center px-3 py-2 mx-2 rounded-md text-sm cursor-pointer",
                  "transition-colors",
                  location.pathname === `/dashboard/folder/${folder.id}`
                    ? {
                        [isDark ? 'button-gradient-dark' : 'button-gradient-light']: true,
                        'text-white': true,
                      }
                    : {
                        'text-muted-foreground': true,
                        [isDark ? 'hover:button-gradient-dark' : 'hover:button-gradient-light']: true,
                        [isDark ? 'hover:text-white' : 'hover:text-gray-900']: true,
                      }
                )}
                onClick={() => navigate(`/dashboard/folder/${folder.id}`)}
              >
                <div className="flex items-center w-full">
                  <Folder className="sidebar-icon mr-2 text-muted-foreground" />
                  {!collapsed && <span className="truncate flex-1">{folder.name}</span>}
                  {!collapsed && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button 
                          className="rounded-full p-1.5 hover:bg-accent/50 focus:outline-none ml-1" 
                          onClick={e => e.stopPropagation()}
                        >
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
                        <DropdownMenuItem 
                          onClick={() => handleDeleteClick(folder)}
                          className="text-red-500 focus:text-red-500"
                        >
                          <Trash className="sidebar-icon mr-2" /> Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Thêm đường kẻ phân cách */}
          <div className="border-t border-border my-2 mx-2"></div>

         
        </div>
        
        <div className="absolute bottom-0 left-0 w-full  border-t border-border pt-2 pb-3 z-10">
          <div className="border-b border-border p-2 space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md text-sm",
                    "transition-colors",
                    isActive 
                      ? {
                          [isDark ? 'button-gradient-dark' : 'button-gradient-light']: true,
                          'text-white': true,
                        }
                      : {
                          'text-muted-foreground': true,
                          [isDark ? 'hover:button-gradient-dark' : 'hover:button-gradient-light']: true,
                          [isDark ? 'hover:text-white' : 'hover:text-gray-900']: true,
                        }
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

      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent className="dark:bg-slate-900 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Đổi tên thư mục</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Nhập tên mới cho thư mục "{folderToRename?.name}".
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-folder-name" className="text-right dark:text-white">
                Tên mới
              </Label>
              <Input
                id="new-folder-name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="col-span-3 dark:bg-slate-800 dark:text-white dark:border-slate-700"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" className="dark:border-slate-700 dark:text-white dark:hover:bg-slate-700">Hủy</Button>
            </DialogClose>
            <Button onClick={handleRenameFolder} disabled={isRenaming} className={`${isDark ? 'button-gradient-dark' : 'button-gradient-light'} text-white`}>{isRenaming ? 'Đang lưu...' : 'Lưu thay đổi'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showConfirmDeleteDialog} onOpenChange={setShowConfirmDeleteDialog}>
        <DialogContent className="dark:bg-slate-900 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Xác nhận xóa thư mục</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Bạn có chắc chắn muốn xóa thư mục "{folderToDelete?.name}" không? Thao tác này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
               <Button type="button" variant="outline" className="dark:border-slate-700 dark:text-white dark:hover:bg-slate-700">Hủy</Button>
            </DialogClose>
            <Button onClick={handleDeleteFolder} disabled={isDeleting} variant="destructive">{isDeleting ? 'Đang xóa...' : 'Xóa'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showAddFolderDialog && (
        <AddFolderDialog 
          open={showAddFolderDialog} 
          onOpenChange={setShowAddFolderDialog} 
          onSuccess={() => workspace?.id && fetchFolders(workspace.id)}
        />
      )}

      {showAddAgentDialog.open && (
        <AddAgentDialog open={showAddAgentDialog.open} onOpenChange={open => setShowAddAgentDialog({...showAddAgentDialog, open})} folderId={showAddAgentDialog.folderId} />
      )}
    </>
  );
});

export default Sidebar;
