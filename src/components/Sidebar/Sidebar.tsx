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
  Cpu,
  Folder,
  Book,
  Key,
  Calendar,
  MessageSquare,
  Clock,
  Trash
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import './Sidebar.css';
import { useAuth } from '@/hooks/useAuth';
import { updateFolder, deleteFolder, clearAgentThreadHistory } from '@/services/api';
import { useSelectedWorkspace } from '@/hooks/useSelectedWorkspace';
import { useToast } from '@/components/ui/use-toast';
import { useFolders } from '@/contexts/FolderContext';
import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import gsap from 'gsap';
import { useAgentsByFolders } from '@/hooks/useAgentsByFolders';
import RunningTasksBadge from '../RunningTasksBadge';
import { createAvatar } from '@dicebear/core';
import { adventurer } from '@dicebear/collection';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';


interface SidebarProps {
    className?: string;
    isMobileDrawer?: boolean;
}

interface FolderType {
  id: string;
  name: string;
  workspace_id: string;
}

const Sidebar = React.memo(({ className, isMobileDrawer }: SidebarProps) => {
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

  // State cho dialog xác nhận xóa lịch sử chat agent
  const [showClearHistoryDialog, setShowClearHistoryDialog] = useState(false);
  const [agentIdToClear, setAgentIdToClear] = useState<string | null>(null);
  const [isClearingHistory, setIsClearingHistory] = useState(false);

  // Lấy danh sách agent theo folder_ids (by-folders)
  const folderIds = Array.isArray(folders) ? folders.map(f => f.id) : [];
  const { data: agentsData, isLoading: isLoadingAgents, error: errorAgents } = useAgentsByFolders(folderIds, 1, 1000);
  // Chỉ hiển thị mỗi agent 1 lần duy nhất (theo agent.id)
  const agents = Array.isArray(agentsData?.data)
    ? Array.from(
        new Map(
          agentsData.data
            .flatMap(folder =>
              Array.isArray(folder.agents)
                ? folder.agents.map(agent => ({
                    ...agent,
                    folderName: folder.name,
                    folderId: folder.id
                  }))
                : []
            )
            .filter(agent => agent && agent.id)
            .map(agent => [agent.id, agent])
        ).values()
      )
    : [];

  // Giữ lại hàm formatTimestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else {
      return date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });
    }
  };

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

  // Auto-fetch messages when threads data is available
  // ĐÃ BỎ auto-g/polling vì đã dùng WebSocket cho chat real-time

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
    // Thêm tab Scheduled Tasks
    { icon: Calendar, label: 'Task theo lịch trình', path: '/dashboard/scheduled-tasks' },
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

console.log(agents);

  // State for search functionality
  const [searchAgent, setSearchAgent] = useState('');

  // Filter agents based on search
  const filteredAgents = agents.filter(agent => {
    const nameMatch = agent.name.toLowerCase().includes(searchAgent.toLowerCase());
    const roleMatch = agent.role_description.toLowerCase().includes(searchAgent.toLowerCase());
    return nameMatch || roleMatch;
  })
  // Sắp xếp agents theo thời gian tin nhắn cuối cùng mới nhất
  .sort((a, b) => {
    // Nếu không có last_message_time thì đẩy xuống cuối
    if (!a.last_message_time) return 1;
    if (!b.last_message_time) return -1;
    // So sánh thời gian, mới nhất lên đầu
    return new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime();
  });

  // Hàm mở dialog xác nhận xóa lịch sử chat với agent
  const handleOpenClearHistoryModal = (agentId: string) => {
    setAgentIdToClear(agentId);
    setShowClearHistoryDialog(true);
  };

  const handleClearHistory = async () => {
    if (!agentIdToClear || !workspace?.id) return;
    setIsClearingHistory(true);
    try {
      await clearAgentThreadHistory(agentIdToClear, workspace.id);
      toast({
        title: t('success'),
        description: 'Đã xóa lịch sử trò chuyện của agent!',
      });
      setShowClearHistoryDialog(false);
      setAgentIdToClear(null);
    } catch (error: any) {
      toast({
        title: t('error'),
        description: 'Xóa lịch sử trò chuyện thất bại!',
        variant: 'destructive',
      });
    } finally {
      setIsClearingHistory(false);
    }
  };

  // TODO: Lấy số task thường chưa hoàn thành (ví dụ: todo, in-progress) từ API hoặc state
  const normalTasksCount = 0; // Thay bằng logic lấy số task thường chưa hoàn thành

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
        {isMobileDrawer ? (
          <div className="flex items-center w-full px-4 py-3">
            <div className={`p-2 ${isDark ? 'bg-gradient-to-br from-purple-600 to-pink-600' : 'bg-gradient-to-br from-purple-600 to-indigo-600'} rounded-lg shadow-lg`}>
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 2L3 14h8l-2 8 10-12h-8l2-8z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className={`font-bold text-xl ml-3 ${isDark ? 'text-white' : 'text-slate-800'}`}>SuperbAI</span>
          </div>
        ) : collapsed ? (
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
              {!collapsed && (
                <div className="flex items-center justify-between w-full">
                  <span>{item.label}</span>
                  {item.label === t('common.tasks') && normalTasksCount > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-destructive text-white rounded-full">
                      {normalTasksCount}
                    </span>
                  )}
                  {item.label === 'Task theo lịch trình' && <RunningTasksBadge showIcon={false} className="ml-2" />}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* === DANH SÁCH AGENT (CÓ THỂ CUỘN) === */}
        <div className="flex-1 min-h-0 flex flex-col">
          {!collapsed && (
            <div className="px-2 py-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase bg-transparent sticky top-0 z-10 flex items-center justify-between">
              <span>Agents</span>
            </div>
          )}
          <div className="px-2 pt-1 pb-0">
            {!collapsed && (
              <input
                type="text"
                placeholder="Tìm kiếm agent..."
                className="px-2 py-1 rounded border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary w-full"
                value={searchAgent}
                onChange={e => setSearchAgent(e.target.value)}
                style={{ marginTop: 4, marginBottom: 2 }}
              />
            )}
          </div>
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
            ) : filteredAgents.length === 0 ? (
              <div className="text-xs text-muted-foreground px-2">Không tìm thấy agent nào</div>
            ) : (
              filteredAgents
                .map(agent => {
                  const isSelected = location.pathname === `/dashboard/agents/${agent.id}`;
                  return (
                    <div
                      key={agent.id}
                      className={cn(
                        "flex items-start p-2 rounded-md hover:bg-muted cursor-pointer transition-colors relative",
                        isSelected && (isDark ? 'bg-purple-100 dark:bg-purple-900/20' : 'bg-purple-50')
                      )}
                    >
                      <div className="flex flex-1 min-w-0" onClick={() => navigate(`/dashboard/agents/${agent.id}`)}>
                        {agent?.avatar ? (
                          <div
                            className="w-8 h-8 mr-2 rounded-full flex-shrink-0"
                            style={{ width: 32, height: 32 }}
                            dangerouslySetInnerHTML={{ __html: agent?.avatar }}
                          />
                        ) : (
                          <div
                            className="w-8 h-8 mr-2 rounded-full flex-shrink-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
                            style={{ width: 32, height: 32 }}
                            dangerouslySetInnerHTML={{ __html: createAvatar(adventurer, { seed: agent.name || 'Agent' }).toString() }}
                          />
                        )}
                        {!collapsed && (
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-foreground truncate">{agent.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-muted-foreground truncate">{agent.role_description}</span>
                            </div>
                           
                          </div>
                        )}
                      </div>
                      {/* Icon xóa lịch sử chỉ hiện trên mobile */}
                      <button
                        className="ml-2 p-1 rounded hover:bg-destructive/10 md:hidden"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenClearHistoryModal(agent.id);
                        }}
                        aria-label="Xóa lịch sử"
                      >
                        <Trash className="h-4 w-4 text-destructive" />
                      </button>
                    </div>
                  );
                })
            )}
          </div>
        </div>

      </aside>

    

  

      {/* Dialog xác nhận xóa lịch sử chat agent */}
      <Dialog open={showClearHistoryDialog} onOpenChange={setShowClearHistoryDialog}>
        <DialogContent className="dark:bg-slate-900 dark:border-slate-700 p-3 md:p-6 max-w-xs w-80 mx-auto">
          {/* MOBILE UI */}
          <div className="md:hidden flex flex-col items-center justify-center">
            <Trash className="h-6 w-6 text-destructive mb-0.5" />
            <DialogHeader className="w-full items-center text-center">
              <DialogTitle className="text-sm font-bold text-destructive">Xác nhận xóa lịch sử trò chuyện</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5 mb-2">
                Bạn có chắc chắn muốn xóa toàn bộ lịch sử trò chuyện với agent này? Hành động này không thể hoàn tác.
              </DialogDescription>
            </DialogHeader>
            <div className="w-full flex flex-col gap-2 mt-1">
              <Button onClick={handleClearHistory} disabled={isClearingHistory} variant="destructive" className="w-full py-1.5 text-xs">
                {isClearingHistory ? 'Đang xóa...' : 'Xóa lịch sử'}
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="outline" className="w-full py-1.5 text-xs dark:border-slate-700 dark:text-white dark:hover:bg-slate-700">Hủy</Button>
              </DialogClose>
            </div>
          </div>
          {/* DESKTOP UI giữ nguyên */}
          <div className="hidden md:block">
            <DialogHeader>
              <DialogTitle className="dark:text-white">Xác nhận xóa lịch sử trò chuyện</DialogTitle>
              <DialogDescription className="dark:text-gray-400">
                Bạn có chắc chắn muốn xóa toàn bộ lịch sử trò chuyện với agent này? Hành động này không thể hoàn tác.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" className="dark:border-slate-700 dark:text-white dark:hover:bg-slate-700">Hủy</Button>
              </DialogClose>
              <Button onClick={handleClearHistory} disabled={isClearingHistory} variant="destructive">{isClearingHistory ? 'Đang xóa...' : 'Xóa lịch sử'}</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});

export default Sidebar;