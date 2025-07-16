/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { useLocation, Link, useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { Menu, X, LogOut, Clock, Bell, Users, Trash2, Puzzle, Share2, Loader2, Coins, Gift } from "lucide-react";
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
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { getNotifications, acceptInvitation, rejectInvitation, Notification, Invitation, getAllInvitations, getWorkspaceMembers, WorkspaceMember, removeWorkspaceMember, getAgentById } from "@/services/api";
import { useAgentsByFolders } from "@/hooks/useAgentsByFolders";

import React from "react";
import { toast } from "sonner";
import './Header.css'; // <<<< Import file CSS mới
import { LanguageToggle } from "../LanguageToggle";
import { ThemeToggle } from "../ThemeToggle";
import { CreditPurchaseDialog } from "@/components/CreditPurchaseDialog";
import RedeemGiftcodeDialog from "@/components/RedeemGiftcodeDialog";

interface DetailedInvitation extends Invitation {
  WorkspaceName?: string;
  InviterEmail?: string;
}

// REFACTORED: To use the new semantic theme system
const Header = React.memo(() => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const { t } = useLanguage();
  const { user, logout, updateUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { workspace } = useSelectedWorkspace();
  const { agentId, folderId } = useParams<{ agentId: string; threadId?: string; folderId?: string }>();

  const { data: agentData } = useQuery({
    queryKey: ['agent', agentId],
    queryFn: () => getAgentById(agentId!),
    enabled: !!user && !!agentId,
  });

  // Sử dụng useAgentsByFolders để lấy thông tin folder
  const folderIds = folderId ? [folderId] : [];
  const { data: agentsByFoldersData } = useAgentsByFolders(folderIds, 1, 1);
  const folderInfo = agentsByFoldersData?.data?.[0];

  const currentAgent = agentData?.data || null;
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [isRemoveMemberModalOpen, setIsRemoveMemberModalOpen] = useState(false);
  const [memberToRemoveId, setMemberToRemoveId] = useState<string | null>(null);
  const [showCreditPurchase, setShowCreditPurchase] = useState(false);
  const [showGiftcodeModal, setShowGiftcodeModal] = useState(false);
  const workspaceIdForMembers = workspace?.id || null;

  const {
    data: invitationsData,
    isLoading: isLoadingInvitations,
    error: errorInvitations,
  } = useQuery<{ data: DetailedInvitation[] }, Error>({
      queryKey: ['userInvitations'],
      queryFn: getAllInvitations,
      enabled: !!user && isNotificationsOpen,
      staleTime: 60 * 1000,
  });

  const { data: membersData, isLoading: isLoadingMembers, error: membersError } = useQuery<{ data: WorkspaceMember[] }>({
    queryKey: ['workspaceMembers', workspaceIdForMembers],
    queryFn: () => getWorkspaceMembers(workspaceIdForMembers as string),
    enabled: !!user && !!workspaceIdForMembers && isMembersModalOpen,
  });

  const queryClient = useQueryClient();

  const handleAcceptInvitation = async (invitationId: string) => {
    try {
      await acceptInvitation(invitationId);
      queryClient.invalidateQueries({ queryKey: ['userInvitations'] });
      toast.success('Đã chấp nhận lời mời');
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast.error('Không thể chấp nhận lời mời');
    }
  };

  const handleRejectInvitation = async (invitationId: string) => {
    try {
      await rejectInvitation(invitationId);
      queryClient.invalidateQueries({ queryKey: ['userInvitations'] });
      toast.success('Đã từ chối lời mời');
    } catch (error) {
      console.error('Error rejecting invitation:', error);
      toast.error('Không thể từ chối lời mời');
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemoveId || !workspace?.id) return;

    try {
      await removeWorkspaceMember(workspace.id, memberToRemoveId);
      queryClient.invalidateQueries({ queryKey: ['workspaceMembers', workspace.id] });
      setIsRemoveMemberModalOpen(false);
      toast.success('Đã xóa thành viên');
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Không thể xóa thành viên');
    }
  };

  const isHomePage = location.pathname === '/dashboard';
  const isAgentsPage = location.pathname.startsWith('/dashboard/agents');
  const isTasksPage = location.pathname.startsWith('/dashboard/tasks');
  const isScheduledTasksPage = location.pathname.startsWith('/dashboard/scheduled-tasks');
  const isKnowledgePage = location.pathname.startsWith('/dashboard/knowledge');
  const isSettingsPage = location.pathname.startsWith('/dashboard/settings');
  const isCredentialPage = location.pathname.startsWith('/dashboard/credential');
  const isFolderDetailPage = location.pathname.startsWith('/dashboard/folder/');

  return (
    // CLEANED: Using `bg-background` for the header to match the layout.
    <header className="bg-background border-b border-border relative z-10 background-gradient-white">
      <div className="py-3 px-4 md:px-6 flex justify-between items-center">
        {/* --- LEFT SECTION --- */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
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
              {/* Mobile Menu Content */}
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

          {/* Breadcrumb Navigation */}
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
                      <BreadcrumbItem><BreadcrumbPage>Task theo lịch trình</BreadcrumbPage></BreadcrumbItem>
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
                      <BreadcrumbItem><BreadcrumbPage>Credential</BreadcrumbPage></BreadcrumbItem>
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
          {/* Notifications */}
          <Dialog open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {invitationsData?.data && invitationsData.data.length > 0 && (
                  <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{t('common.notifications')}</DialogTitle>
                <DialogDescription>
                  {t('common.notificationsDescription')}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                {isLoadingInvitations ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : errorInvitations ? (
                  <div className="text-center text-red-500 py-4">
                    {t('common.errorLoadingNotifications')}
                  </div>
                ) : invitationsData?.data && invitationsData.data.length > 0 ? (
                  <div className="space-y-4">
                    {invitationsData.data.map((invitation) => (
                      <div key={invitation.ID} className="flex items-center justify-between gap-4 p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{t('common.invitations')}</p>
                          <p className="text-sm text-muted-foreground">
                            Workspace: {invitation.WorkspaceName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Từ: {invitation.InviterEmail}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAcceptInvitation(invitation.ID)}
                          >
                            {t('common.accept')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectInvitation(invitation.ID)}
                          >
                            {t('common.reject')}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    {t('common.noNotifications')}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Members Management */}
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
                        {/* Ẩn nút xóa nếu là chính mình */}
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

          {/* Confirm Remove Member Dialog */}
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

          {/* Credits */}
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