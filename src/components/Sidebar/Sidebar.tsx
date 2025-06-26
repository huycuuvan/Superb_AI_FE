/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Users, 
  CheckCircle, 
  Settings as SettingsIcon, 
  ChevronRight,
  Plus,
  Cpu,
  Folder,
  MoreVertical,
  Edit,
  Pin,
  Trash,
  Book,
  Key
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AddFolderDialog } from '@/components/AddFolderDialog';
import { useLanguage } from '@/hooks/useLanguage';
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
import { updateFolder, deleteFolder, getAgents } from '@/services/api';
import { useSelectedWorkspace } from '@/hooks/useSelectedWorkspace';
import { useToast } from '@/components/ui/use-toast';
import { useFolders } from '@/contexts/FolderContext';
import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { Skeleton } from '../ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { createAvatar } from '@dicebear/core';
import { adventurer } from '@dicebear/collection';
import gsap from 'gsap';


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
  const { folders, loadingFolders } = useFolders();
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

  // Lấy danh sách agent thật từ API
  const { data: agentsData, isLoading: isLoadingAgents, error: errorAgents } = useQuery({
    queryKey: ['agents', workspace?.id],
    queryFn: () => getAgents(workspace?.id || ''),
    enabled: !!workspace?.id,
  });
  const agents = Array.isArray(agentsData?.data) ? agentsData.data : [];

  const asideRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (workspace?.id) {
// fetchFolders(workspace.id); // Remove this line
    }
  }, [workspace?.id]);

  useEffect(() => {
    if (asideRef.current) {
      gsap.to(asideRef.current, {
        width: collapsed ? 64 : 256, // 16 * 4 = 64px, 64 * 4 = 256px
        duration: 0.3,
        ease: 'power2.inOut',
      });
    }
  }, [collapsed]);

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
  title: t('success'),
  description: t('folderRenamed', { name: newFolderName.trim() }),
});
setShowRenameDialog(false);
    } catch (error: any) {
console.error('Lỗi khi đổi tên folder:', error);
      toast({
 title: t('error'),
 description: t('folderRenameFailed', { name: newFolderName.trim() }),
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
   title: t('success'),
   description: t('folderDeleted', { name: folderToDelete.name }),
 });
 setShowConfirmDeleteDialog(false);
 if (location.pathname === `/dashboard/folder/${folderToDelete.id}`) {
   navigate('/dashboard');
 }
    } catch (error: any) {
      console.error('Lỗi khi xóa folder:', error);
      toast({
        title: t('error'),
        description: t('folderDeleteFailed', { name: folderToDelete.name }),
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const menuItems = [
    { icon: Home, label: t('common.home'), path: '/dashboard' },
    {
      label: t('folder.departments'),
      icon: Folder,
      path: '/dashboard/departments',
    },
    { icon: Users, label: t('common.agents'), path: '/dashboard/agents' },
    { icon: CheckCircle, label: t('common.tasks'), path: '/dashboard/tasks' },
    { icon: Book, label: t('common.knowledge'), path: '/dashboard/knowledge' },
    { icon: SettingsIcon, label: t('common.settings'), path: '/dashboard/settings' },
    ...(user?.role === 'admin' || user?.role === 'super_admin' ? [
      { icon: Cpu, label: 'Prompt Templates', path: '/dashboard/prompts' }
    ] : []),
    {
      label: 'Credential',
 icon: Key,
      path: '/dashboard/credentials',
    },
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (item.label === t('common.agents') && user?.role === 'user') {
      return false; 
    }
    if (item.label === t('common.tasks') && user?.role === 'user') {
      return false;
    }
    return true;
  });

  return (
    <>
      <aside
        ref={asideRef}
        className={cn(
          "flex flex-col h-screen overflow-hidden dark:bg-primary-white border-r border-border",
          className
        )}
>
        {/* === HEADER (KHÔNG CUỘN) === */}
        {collapsed ? (
          <div className="flex gap-2 justify-center items-center h-20">
            <div className={`${isDark ? 'bg-gradient-to-br from-purple-600 to-pink-600' : 'bg-gradient-to-br from-purple-600 to-indigo-600'} rounded-lg shadow-lg p-2 ml-2`}>
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 2L3 14h8l-2 8 10-12h-8l2-8z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <button
              className=" text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              onClick={() => setCollapsed(false)}
            >
              <ChevronRight className={cn('h-5 w-5 transition-transform')} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full px-4 py-3">
            <div className="flex items-center space-x-3">
              <div className={`p-2 ${isDark ? 'bg-gradient-to-br from-purple-600 to-pink-600' : 'bg-gradient-to-br from-purple-600 to-indigo-600'} rounded-lg shadow-lg`}>
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 2L3 14h8l-2 8 10-12h-8l2-8z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className={`font-bold text-xl ${isDark ? 'text-white' : 'text-slate-800'}`}>SuperbAI</span>
            </div>
            <button
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 ml-auto"
              onClick={() => setCollapsed(true)}
            >
              <ChevronRight className={cn('h-5 w-5 transition-transform rotate-180')} />
            </button>
          </div>
        )}

        {/* === MENU ITEMS (KHÔNG CUỘN) === */}
        <nav className="p-2 space-y-1 border-b border-border dark:border-primary-white flex-shrink-0">
          {filteredMenuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className={({ isActive }) =>
                cn(
                  "flex items-center px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? (isDark ? 'button-gradient-dark text-white' : 'button-gradient-light text-white')
                    : 'text-muted-foreground ' + (isDark ? 'hover:button-gradient-dark hover:text-white' : 'hover:button-gradient-light hover:text-white')
                )
              }
            >
              {item.icon && React.createElement(item.icon, { className: cn("sidebar-icon", !collapsed && "mr-2") })}
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* === DANH SÁCH AGENT (CÓ THỂ CUỘN) === */}
        <div className="flex-1 min-h-0 flex flex-col">
          {!collapsed && (
            <div className="px-2 pt-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase bg-transparent sticky top-0 z-10">
              Agents
            </div>
          )}
          <div className="flex-1 overflow-y-auto agent-scrollbar space-y-2 p-2 pt-0">
            {/* AGENT LIST REAL DATA */}
            {isLoadingAgents ? (
              Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="flex items-center p-2 rounded-md">
                  <div className="w-8 h-8 mr-2 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse flex-shrink-0"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
                </div>
              ))
            ) : errorAgents ? (
              <div className="text-xs text-red-500 px-2">Lỗi tải danh sách agent</div>
            ) : agents.length === 0 ? (
              <div className="text-xs text-muted-foreground px-2">Chưa có agent nào</div>
            ) : (
              agents.map(agent => (
                <div
                  key={agent.id}
                  className="flex items-center p-2 rounded-md hover:bg-muted cursor-pointer"
                  onClick={() => navigate(`/dashboard/agents/${agent.id}`)}
                >
                  {agent.avatar ? (
                    <div
                      className="w-8 h-8 mr-2 rounded-full flex-shrink-0"
                      style={{ width: 32, height: 32 }}
                      dangerouslySetInnerHTML={{ __html: agent.avatar }}
                    />
                  ) : (
                    <div
                      className="w-8 h-8 mr-2 rounded-full flex-shrink-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
                      style={{ width: 32, height: 32 }}
                      dangerouslySetInnerHTML={{ __html: createAvatar(adventurer, { seed: agent.name || 'Agent' }).toString() }}
                    />
                  )}
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-foreground truncate">{agent.name}</span>
                    <span className="text-xs font-medium text-foreground truncate">{agent.position}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </aside>

      {/* DIALOGS - Không thay đổi */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent className="dark:bg-slate-900 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">{t('folder.renameFolderTitle')}</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              {t('folder.renameFolderDescription', { name: folderToRename?.name })}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-folder-name" className="text-right dark:text-white">
                {t('folder.newFolderName')}
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
              <Button type="button" variant="outline" className="dark:border-slate-700 dark:text-white dark:hover:bg-slate-700">{t('common.cancel')}</Button>
            </DialogClose>
            <Button onClick={handleRenameFolder} disabled={isRenaming} className={`${isDark ? 'button-gradient-dark' : 'button-gradient-light'} text-white`}>{isRenaming ? t('common.loading') : t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showConfirmDeleteDialog} onOpenChange={setShowConfirmDeleteDialog}>
        <DialogContent className="dark:bg-slate-900 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">{t('folder.deleteFolderConfirmation')}</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              {t('folder.deleteFolderConfirmationDescription', { name: folderToDelete?.name })}
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
          onSuccess={() => workspace?.id}
        />
      )}

      {showAddAgentDialog.open && (
        <AddAgentDialog open={showAddAgentDialog.open} onOpenChange={open => setShowAddAgentDialog({...showAddAgentDialog, open})} folderId={showAddAgentDialog.folderId} />
      )}
    </>
  );
});

export default Sidebar;