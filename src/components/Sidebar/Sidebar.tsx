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
  Key,
  MessageSquare,
  Clock
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
import { updateFolder, deleteFolder, getThreadMessages, getThreadByAgentId } from '@/services/api';
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
import { useAgentsByFolders } from '@/hooks/useAgentsByFolders';
import { ApiMessage, Thread } from '@/types';


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

  // State for agent messages
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [agentMessages, setAgentMessages] = useState<{[agentId: string]: ApiMessage[]}>({});
  const [loadingMessages, setLoadingMessages] = useState<{[agentId: string]: boolean}>({});

  // Lấy danh sách agent theo folder_ids (by-folders)
  const folderIds = Array.isArray(folders) ? folders.map(f => f.id) : [];
  const { data: agentsData, isLoading: isLoadingAgents, error: errorAgents } = useAgentsByFolders(folderIds);
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

  // Fetch threads for each agent
  const { data: threadsData, isLoading: isLoadingThreads } = useQuery({
    queryKey: ['agent-threads', agents.map(a => a.id)],
    queryFn: async () => {
      const threadsPromises = agents.map(async (agent) => {
        try {
          const response = await getThreadByAgentId(agent.id);
          return { agentId: agent.id, threads: response.data || [] };
        } catch (error) {
          console.error(`Error fetching threads for agent ${agent.id}:`, error);
          return { agentId: agent.id, threads: [] };
        }
      });
      return Promise.all(threadsPromises);
    },
    enabled: agents.length > 0,
  });

  // Function to fetch messages for a specific agent
  const fetchAgentMessages = async (agentId: string) => {
    if (loadingMessages[agentId]) return;
    
    setLoadingMessages(prev => ({ ...prev, [agentId]: true }));
    try {
      const agentThreads = threadsData?.find(t => t.agentId === agentId)?.threads || [];
      if (agentThreads.length === 0) {
        setAgentMessages(prev => ({ ...prev, [agentId]: [] }));
        return;
      }

      // Get the most recent thread
      const latestThread = agentThreads.sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      )[0];

      const messagesResponse = await getThreadMessages(latestThread.id);
      const messages = messagesResponse.data || [];
      
      setAgentMessages(prev => ({ ...prev, [agentId]: messages }));
    } catch (error) {
      console.error(`Error fetching messages for agent ${agentId}:`, error);
      setAgentMessages(prev => ({ ...prev, [agentId]: [] }));
    } finally {
      setLoadingMessages(prev => ({ ...prev, [agentId]: false }));
    }
  };

  // Function to get latest message preview for an agent
  const getLatestMessagePreview = (agentId: string) => {
    const messages = agentMessages[agentId] || [];
    if (messages.length === 0) return null;
    
    const latestMessage = messages.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];
    
    return {
      content: latestMessage.message_content,
      timestamp: latestMessage.created_at,
      senderType: latestMessage.sender_type
    };
  };

  // Function to count unread messages for an agent
  const getUnreadMessageCount = (agentId: string) => {
    const messages = agentMessages[agentId] || [];
    if (messages.length === 0) return 0;
    
    // Count messages from agent in the last 5 minutes
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    return messages.filter(msg => 
      msg.sender_type === 'agent' && 
      new Date(msg.created_at).getTime() > fiveMinutesAgo
    ).length;
  };

  // Function to format timestamp
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
  useEffect(() => {
    if (threadsData && agents.length > 0) {
      agents.forEach(agent => {
        if (!agentMessages[agent.id] && !loadingMessages[agent.id]) {
          fetchAgentMessages(agent.id);
        }
      });
    }
  }, [threadsData, agents]);

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
            <div className="px-2 py-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase bg-transparent sticky top-0 z-10 flex items-center justify-between">
              <span>Agents</span>
              <button
                onClick={() => {
                  filteredAgents.forEach(agent => {
                    if (!loadingMessages[agent.id]) {
                      fetchAgentMessages(agent.id);
                    }
                  });
                }}
                className="p-1 hover:bg-muted rounded transition-colors"
                title="Làm mới tin nhắn"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
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
                  const latestMessage = getLatestMessagePreview(agent.id);
                  const isSelected = location.pathname === `/dashboard/agents/${agent.id}`;
                  return (
                    <div
                      key={agent.id}
                      className={cn(
                        "flex items-start p-2 rounded-md hover:bg-muted cursor-pointer transition-colors relative",
                        isSelected && (isDark ? 'bg-purple-100 dark:bg-purple-900/20' : 'bg-purple-50')
                      )}
                      onClick={() => navigate(`/dashboard/agents/${agent.id}`)}
                    >
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
                            <div className="flex items-center gap-1">
                              {latestMessage && (
                                <span className="text-xs text-muted-foreground flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {formatTimestamp(latestMessage.timestamp)}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 mb-1">
                            <span className="text-xs text-muted-foreground truncate">{agent.role_description}</span>
                            {loadingMessages[agent.id] && (
                              <div className="w-3 h-3 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin"></div>
                            )}
                          </div>
                          
                          {latestMessage ? (
                            <div className="flex items-start gap-1">
                              <MessageSquare className="w-3 h-3 mt-0.5 flex-shrink-0 text-muted-foreground" />
                              <div className="flex-1 min-w-0">
                                <span className="text-xs text-muted-foreground truncate block">
                                  {latestMessage.senderType === 'user' ? 'Bạn: ' : `${agent.name}: `}
                                  {latestMessage.content.length > 50 
                                    ? `${latestMessage.content.substring(0, 50)}...` 
                                    : latestMessage.content
                                  }
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <MessageSquare className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">Chưa có tin nhắn</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
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