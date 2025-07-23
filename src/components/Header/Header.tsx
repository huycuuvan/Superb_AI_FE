/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Button } from "@/components/ui/button";
import { useLocation, Link, useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { 
  Menu, X, LogOut, Clock, Bell, Users, Trash2, Puzzle, 
  Share2, Loader2, Coins, Gift, CheckCircle2, AlertCircle,
  Info, PlayCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useSelectedWorkspace } from "@/hooks/useSelectedWorkspace";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  getNotifications, 
  acceptInvitation, 
  rejectInvitation, 
  Notification, 
  Invitation, 
  getAllInvitations, 
  getWorkspaceMembers, 
  WorkspaceMember, 
  removeWorkspaceMember, 
  getAgentById,
  markAllNotificationsAsRead,
  markNotificationAsRead
} from "@/services/api";
import { useAgentsByFolders } from "@/hooks/useAgentsByFolders";
import { websocketService } from "@/services/websocket";
import { WS_URL } from "@/config/api";
import { toast } from "sonner";
import './Header.css';
import { LanguageToggle } from "../LanguageToggle";
import { ThemeToggle } from "../ThemeToggle";
import { CreditPurchaseDialog } from "@/components/CreditPurchaseDialog";
import RedeemGiftcodeDialog from "@/components/RedeemGiftcodeDialog";

interface DetailedInvitation extends Invitation {
  WorkspaceName?: string;
  InviterEmail?: string;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'scheduled_task_start':
      return <PlayCircle className="h-5 w-5 text-blue-500" />;
    case 'scheduled_task_complete':
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case 'scheduled_task_error':
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    case 'task_start':
      return <PlayCircle className="h-5 w-5 text-blue-500" />;
    case 'task_complete':
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case 'task_error':
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    case 'system':
      return <Info className="h-5 w-5 text-purple-500" />;
    default:
      return <Bell className="h-5 w-5 text-gray-500" />;
  }
};

const getNotificationStyle = (type: string) => {
  switch (type) {
    case 'scheduled_task_start':
    case 'task_start':
      return 'border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950/20';
    case 'scheduled_task_complete':
    case 'task_complete':
      return 'border-l-4 border-l-green-500 bg-green-50 dark:bg-green-950/20';
    case 'scheduled_task_error':
    case 'task_error':
      return 'border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950/20';
    case 'system':
      return 'border-l-4 border-l-purple-500 bg-purple-50 dark:bg-purple-950/20';
    default:
      return 'border-l-4 border-l-gray-500 bg-gray-50 dark:bg-gray-950/20';
  }
};

const formatNotificationTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Vừa xong';
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ trước`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} ngày trước`;
  
  return date.toLocaleDateString('vi-VN');
};

const Header = React.memo(() => {
  const location = useLocation();
  const { t } = useLanguage();
  const { user, logout, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState<{ [key: string]: boolean }>({});

  // Queries
  const { data: notificationsData, isLoading: isLoadingNotifications } = useQuery<{ data: Notification[] }>({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    enabled: !!user,
    staleTime: 60 * 1000,
  });

  const { data: invitationsData, isLoading: isLoadingInvitations } = useQuery<{ data: Invitation[] }>({
    queryKey: ['userInvitations'],
    queryFn: getAllInvitations,
    enabled: !!user,
    staleTime: 60 * 1000,
  });

  // Computed values
  const unreadCount = notificationsData?.data?.filter(n => !n.is_read).length || 0;
  const totalUnread = unreadCount + (invitationsData?.data?.length || 0);

  const displayedNotifications = showAllNotifications 
    ? notificationsData?.data 
    : notificationsData?.data?.slice(0, 5);

  // Handlers
  const handleMarkAsRead = async (notificationId: string) => {
    if (loadingNotifications[notificationId]) return;
    
    try {
      setLoadingNotifications(prev => ({ ...prev, [notificationId]: true }));
      await markNotificationAsRead(notificationId);
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(t('common.notificationMarkedAsRead'));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error(t('common.errorMarkingNotificationAsRead'));
    } finally {
      setLoadingNotifications(prev => ({ ...prev, [notificationId]: false }));
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(t('common.allNotificationsMarkedAsRead'));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error(t('common.errorMarkingNotificationsAsRead'));
    }
  };

  // WebSocket connection
  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const wsUrl = `${WS_URL}?token=${token}`;
    if (websocketService.getConnectionState() !== "open") {
      websocketService.connect(wsUrl);
    }

    const handleTaskStatus = (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };

    const handleTaskUpdate = (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };

    websocketService.handleScheduledTaskStatus(handleTaskStatus);
    websocketService.subscribe("scheduled_task_update", handleTaskUpdate);

    return () => {
      websocketService.unsubscribe("status", handleTaskStatus);
      websocketService.unsubscribe("scheduled_task_update", handleTaskUpdate);
    };
  }, [user, queryClient]);

  const isHomePage = location.pathname === '/dashboard';
  const isAgentsPage = location.pathname.startsWith('/dashboard/agents');
  const isTasksPage = location.pathname.startsWith('/dashboard/tasks');
  const isScheduledTasksPage = location.pathname.startsWith('/dashboard/scheduled-tasks');
  const isKnowledgePage = location.pathname.startsWith('/dashboard/knowledge');
  const isSettingsPage = location.pathname.startsWith('/dashboard/settings');
  const isCredentialPage = location.pathname.startsWith('/dashboard/credential');
  const isFolderDetailPage = location.pathname.startsWith('/dashboard/folder/');

  const { workspace } = useSelectedWorkspace();
  const { agentId, folderId } = useParams<{ agentId: string; threadId?: string; folderId?: string }>();

  const { data: agentData } = useQuery({
    queryKey: ['agent', agentId],
    queryFn: () => getAgentById(agentId!),
    enabled: !!user && !!agentId,
  });

  const folderIds = folderId ? [folderId] : [];
  const { data: agentsByFoldersData } = useAgentsByFolders(folderIds, 1, 1);
  const folderInfo = agentsByFoldersData?.data?.[0];

  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [isRemoveMemberModalOpen, setIsRemoveMemberModalOpen] = useState(false);
  const [memberToRemoveId, setMemberToRemoveId] = useState<string | null>(null);
  const [showCreditPurchase, setShowCreditPurchase] = useState(false);
  const [showGiftcodeModal, setShowGiftcodeModal] = useState(false);
  const workspaceIdForMembers = workspace?.id || null;

  const { data: membersData, isLoading: isLoadingMembers, error: membersError } = useQuery<{ data: WorkspaceMember[] }>({
    queryKey: ['workspaceMembers', workspaceIdForMembers],
    queryFn: () => getWorkspaceMembers(workspaceIdForMembers as string),
    enabled: !!user && !!workspaceIdForMembers && isMembersModalOpen,
  });

  const handleAcceptInvitation = async (invitationId: string) => {
    try {
      await acceptInvitation(invitationId);
      queryClient.invalidateQueries({ queryKey: ['userInvitations'] });
      toast.success(t('common.invitationAccepted'));
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast.error(t('common.errorAcceptingInvitation'));
    }
  };

  const handleRejectInvitation = async (invitationId: string) => {
    try {
      await rejectInvitation(invitationId);
      queryClient.invalidateQueries({ queryKey: ['userInvitations'] });
      toast.success(t('common.invitationRejected'));
    } catch (error) {
      console.error('Error rejecting invitation:', error);
      toast.error(t('common.errorRejectingInvitation'));
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemoveId || !workspace?.id) return;

    try {
      await removeWorkspaceMember(workspace.id, memberToRemoveId);
      queryClient.invalidateQueries({ queryKey: ['workspaceMembers', workspace.id] });
      setIsRemoveMemberModalOpen(false);
      toast.success(t('common.memberRemoved'));
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error(t('common.errorRemovingMember'));
    }
  };

  return (
    <header className="bg-background border-b border-border relative z-10 background-gradient-white">
      <div className="py-3 px-4 md:px-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <SheetHeader className="p-4 border-b">
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col p-4">
                <Button variant="ghost" className="justify-start" asChild>
                  <Link to="/dashboard">
                    <Clock className="mr-2 h-4 w-4" />
                    {t('common.dashboard')}
                  </Link>
                </Button>
                <Button variant="ghost" className="justify-start" asChild>
                  <Link to="/dashboard/agents">
                    <Users className="mr-2 h-4 w-4" />
                    {t('common.agents')}
                  </Link>
                </Button>
                <Button variant="ghost" className="justify-start" asChild>
                  <Link to="/dashboard/tasks">
                    <Puzzle className="mr-2 h-4 w-4" />
                    {t('common.tasks')}
                  </Link>
                </Button>
                <Button variant="ghost" className="justify-start" asChild>
                  <Link to="/dashboard/settings">
                    <Share2 className="mr-2 h-4 w-4" />
                    {t('common.settings')}
                  </Link>
                </Button>
              </div>
              <SheetFooter className="absolute bottom-0 left-0 right-0 p-4 border-t">
                <Button variant="ghost" className="w-full justify-start text-red-500" onClick={(e) => {
                  e.preventDefault();
                  logout();
                }}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('common.logout')}
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          {(() => {
            if (isHomePage) {
              return <div className="hidden md:block text-sm text-foreground">{t('common.dashboard')}</div>;
            }

            if (isAgentsPage) {
              return (
                <div className="hidden md:flex">
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem><BreadcrumbLink asChild><Link to="/dashboard">{t('common.dashboard')}</Link></BreadcrumbLink></BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem><BreadcrumbPage>{t('common.agents')}</BreadcrumbPage></BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
              );
            }

            if (isTasksPage) {
              return (
                <div className="hidden md:flex">
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem><BreadcrumbLink asChild><Link to="/dashboard">{t('common.dashboard')}</Link></BreadcrumbLink></BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem><BreadcrumbPage>{t('common.tasks')}</BreadcrumbPage></BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
              );
            }

            if (isScheduledTasksPage) {
              return (
                <div className="hidden md:flex">
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem><BreadcrumbLink asChild><Link to="/dashboard">{t('common.dashboard')}</Link></BreadcrumbLink></BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem><BreadcrumbPage>{t('common.scheduledTasks')}</BreadcrumbPage></BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
              );
            }

            if (isKnowledgePage) {
              return (
                <div className="hidden md:flex">
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem><BreadcrumbLink asChild><Link to="/dashboard">{t('common.dashboard')}</Link></BreadcrumbLink></BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem><BreadcrumbPage>{t('common.knowledge')}</BreadcrumbPage></BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
              );
            }

            if (isSettingsPage) {
              return (
                <div className="hidden md:flex">
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem><BreadcrumbLink asChild><Link to="/dashboard">{t('common.dashboard')}</Link></BreadcrumbLink></BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem><BreadcrumbPage>{t('common.settings')}</BreadcrumbPage></BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
              );
            }

            if (isCredentialPage) {
              return (
                <div className="hidden md:flex">
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem><BreadcrumbLink asChild><Link to="/dashboard">{t('common.dashboard')}</Link></BreadcrumbLink></BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem><BreadcrumbPage>{t('common.credential')}</BreadcrumbPage></BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
              );
            }

            if (isFolderDetailPage) {
              return (
                <div className="hidden md:flex">
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem><BreadcrumbLink asChild><Link to="/dashboard">{t('common.dashboard')}</Link></BreadcrumbLink></BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem><BreadcrumbPage>{folderInfo?.name}</BreadcrumbPage></BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
              );
            }

            return <div className="hidden md:block text-sm text-foreground">{t('common.dashboard')}</div>;
          })()}
        </div>
        
        {/* --- RIGHT SECTION --- */}
        <div className="flex items-center gap-2 md:gap-4">
          <Dialog open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {!isLoadingNotifications && !isLoadingInvitations && totalUnread > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs animate-in fade-in duration-300">
                    {totalUnread > 99 ? '99+' : totalUnread}
                  </span>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] md:max-w-[700px]">
              <div className="flex items-center justify-between border-b pb-4">
                <div className="space-y-1">
                  <DialogTitle>{t('common.notifications')}</DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground">
                    {t('common.notificationsDescription')}
                  </DialogDescription>
                </div>
                {totalUnread > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="flex items-center gap-2 mr-6"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {t('common.markAllAsRead')}
                  </Button>
                )}
              </div>

              <div className={cn(
                "py-4",
                showAllNotifications && "h-[500px] overflow-y-auto pr-4 no-scrollbar"
              )}>
                {isLoadingNotifications || isLoadingInvitations ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : displayedNotifications && displayedNotifications.length > 0 ? (
                  <div className="space-y-2">
                    {displayedNotifications.map((notification) => (
                      <TooltipProvider key={notification.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                              disabled={loadingNotifications[notification.id]}
                              className={cn(
                                "w-full text-left p-4 rounded-lg flex items-start gap-3",
                                "transition-all duration-200 ease-in-out",
                                "hover:bg-accent/50",
                                "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                "relative cursor-pointer",
                                !notification.is_read && "font-medium",
                                loadingNotifications[notification.id] && "opacity-70 cursor-wait",
                                notification.is_read && "opacity-80"
                              )}
                            >
                              <div className="flex-shrink-0 mt-1 relative">
                                {loadingNotifications[notification.id] ? (
                                  <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                  <Bell className="h-5 w-5" />
                                )}
                              </div>
                              <div className="flex-grow min-w-0">
                                <p className="text-sm truncate">{notification.content}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(notification.created_at).toLocaleTimeString()}
                                  </p>
                                  {!notification.is_read && (
                                    <span className="flex-shrink-0 h-2 w-2 rounded-full bg-blue-500" />
                                  )}
                                </div>
                              </div>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="left">
                            {notification.is_read 
                              ? t('common.alreadyRead')
                              : t('common.clickToMarkAsRead')
                            }
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}

                    {notificationsData?.data && notificationsData.data.length > 5 && (
                      <div className="flex justify-center mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAllNotifications(!showAllNotifications)}
                          className="min-w-[100px]"
                        >
                          {showAllNotifications 
                            ? t('common.showLess')
                            : `${t('common.viewAll')} (${notificationsData.data.length})`
                          }
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    {t('common.noNotifications')}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isMembersModalOpen} onOpenChange={setIsMembersModalOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Users className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{t('common.members')}</DialogTitle>
                <DialogDescription>
                  {t('common.membersDescription')}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                {isLoadingMembers ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : membersError ? (
                  <div className="text-center text-red-500 py-4">
                    {t('common.errorLoadingMembers')}
                  </div>
                ) : membersData?.data && membersData.data.length > 0 ? (
                  <div className="space-y-4">
                    {membersData.data.map((member) => (
                      <div key={member.user_id} className="flex items-center justify-between gap-4 p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{member.name || member.user_name}</p>
                          <p className="text-sm text-muted-foreground">{member.email || member.user_email}</p>
                          <p className="text-sm text-muted-foreground">Role: {member.role}</p>
                        </div>
                        {user?.id !== member.user_id && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => {
                              setMemberToRemoveId(member.user_id);
                              setIsRemoveMemberModalOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    {t('common.noMembers')}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isRemoveMemberModalOpen} onOpenChange={setIsRemoveMemberModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('common.removeMember')}</DialogTitle>
                <DialogDescription>
                  {t('common.removeMemberDescription')}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsRemoveMemberModalOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button variant="destructive" onClick={handleRemoveMember}>
                  {t('common.remove')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setShowCreditPurchase(true)}>
              <Coins className="h-5 w-5 text-yellow-400" />
            </Button>
            <span className="font-semibold text-yellow-400 text-sm min-w-[48px] text-center select-none">
              {user?.credit ?? 0}
            </span>
          </div>

          {/* Giftcode Button */}
          <Button variant="outline" size="icon" onClick={() => setShowGiftcodeModal(true)}>
            <Gift className="h-5 w-5" /> 
          </Button>
          <RedeemGiftcodeDialog
            open={showGiftcodeModal}
            onClose={() => setShowGiftcodeModal(false)}
            onSuccess={(credit) => {
              if (user && typeof credit === 'number') {
                updateUser({ ...user, credit: (user.credit ?? 0) + credit });
              }
              setShowGiftcodeModal(false);
            }}
          />

          {/* Language Toggle */}
          <LanguageToggle />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <img
                    src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.email}`}
                    alt="avatar"
                    className="rounded-full"
                  />
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuItem className="flex flex-col items-start">
                <div className="text-sm font-medium">{user?.name}</div>
                <div className="text-xs text-muted-foreground">{user?.email}</div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={(e) => {
                e.preventDefault();
                logout();
              }} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t('common.logout')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Credit Purchase Dialog */}
      <CreditPurchaseDialog isOpen={showCreditPurchase} onClose={() => setShowCreditPurchase(false)} />
    </header>
  );
});

export default Header;