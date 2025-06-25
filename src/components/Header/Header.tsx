/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { useLocation, Link, useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { Menu, X, LogOut, Clock, Bell, Users, Trash2, Puzzle, Share2, Loader2 } from "lucide-react";
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

import React from "react";
import { toast } from "sonner";
import './Header.css'; // <<<< Import file CSS mới
import { LanguageToggle } from "../LanguageToggle";

interface DetailedInvitation extends Invitation {
  WorkspaceName?: string;
  InviterEmail?: string;
}

// REFACTORED: To use the new semantic theme system
const Header = React.memo(() => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { workspace } = useSelectedWorkspace();
  const { agentId } = useParams<{ agentId: string; threadId?: string }>();

  const { data: agentData } = useQuery({
    queryKey: ['agent', agentId],
    queryFn: () => getAgentById(agentId!),
    enabled: !!agentId,
  });

  const currentAgent = agentData?.data || null;
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [isRemoveMemberModalOpen, setIsRemoveMemberModalOpen] = useState(false);
  const [memberToRemoveId, setMemberToRemoveId] = useState<string | null>(null);
  const workspaceIdForMembers = workspace?.id || null;

  const {
    data: invitationsData,
    isLoading: isLoadingInvitations,
    error: errorInvitations,
  } = useQuery<{ data: DetailedInvitation[] }, Error>({
      queryKey: ['userInvitations'],
      queryFn: getAllInvitations,
      enabled: isNotificationsOpen,
      staleTime: 60 * 1000,
  });

  const { data: membersData, isLoading: isLoadingMembers, error: membersError } = useQuery<{ data: WorkspaceMember[] }>({
    queryKey: ['workspaceMembers', workspaceIdForMembers],
    queryFn: () => getWorkspaceMembers(workspaceIdForMembers as string),
    enabled: !!workspaceIdForMembers && isMembersModalOpen,
  });

  const queryClient = useQueryClient();

  const handleAcceptInvitation = async (invitationId: string) => {
    try {
      await acceptInvitation(invitationId);
      toast.success("Đã chấp nhận lời mời.");
      queryClient.invalidateQueries({ queryKey: ['userInvitations'] });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    } catch (error) {
      toast.error("Không thể chấp nhận lời mời.");
    }
  };

  const handleRejectInvitation = async (invitationId: string) => {
    try {
      await rejectInvitation(invitationId);
      toast.success("Đã từ chối lời mời.");
      queryClient.invalidateQueries({ queryKey: ['userInvitations'] });
    } catch (error) {
      toast.error("Không thể từ chối lời mời.");
    }
  };

  const confirmRemoveMember = (memberId: string) => {
    setMemberToRemoveId(memberId);
    setIsRemoveMemberModalOpen(true);
  };

  const handleRemoveMember = async () => {
    if (!workspaceIdForMembers || !memberToRemoveId) return toast.error("Thông tin không hợp lệ.");
    try {
      await removeWorkspaceMember(workspaceIdForMembers, memberToRemoveId);
      toast.success("Đã xóa thành viên.");
      queryClient.invalidateQueries({ queryKey: ['workspaceMembers', workspaceIdForMembers] });
      setIsRemoveMemberModalOpen(false);
    } catch (error) {
      toast.error("Không thể xóa thành viên.");
      setIsRemoveMemberModalOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const pendingInvitations = invitationsData?.data?.filter(inv => inv.Status === 'pending') || [];
  const memberToConfirmRemoval = membersData?.data.find(member => member.user_id === memberToRemoveId);
  const isAgentChatPage = location.pathname.startsWith('/dashboard/agents/') && agentId;
  const isAgentsListPage = location.pathname === '/dashboard/agents';

  return (
    // CLEANED: Using `bg-background` for the header to match the layout.
    <header className="bg-background border-b border-border relative z-10 background-gradient-white">
      <div className="py-3 px-4 md:px-6 flex justify-between items-center">
        {/* --- LEFT SECTION --- */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {(isAgentChatPage || isAgentsListPage) ? (
            <div className="hidden md:flex">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem><BreadcrumbLink asChild><Link to="/dashboard">{t('common.dashboard')}</Link></BreadcrumbLink></BreadcrumbItem>
                  {user?.role !== 'user' && (
                    <>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem><BreadcrumbLink asChild><Link to="/dashboard/agents">{t('common.agents')}</Link></BreadcrumbLink></BreadcrumbItem>
                    </>
                  )}
                  {isAgentChatPage && (
                    <>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem><BreadcrumbPage>{currentAgent?.name || 'Agent'}</BreadcrumbPage></BreadcrumbItem>
                    </>
                  )}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          ) : (
            <div className="hidden md:block text-sm text-foreground">{t('common.dashboard')}</div>
          )}
        </div>
        
        {/* --- RIGHT SECTION --- */}
        <div className="flex items-center gap-2 md:gap-4">
          <Sheet open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
                <Bell className="h-5 w-5" />
                {pendingInvitations.length > 0 && (
                  // CLEANED: Using semantic destructive color for notification badge
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs font-bold">
                    {pendingInvitations.length}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[380px] sm:w-[450px] p-0 flex flex-col">
                <SheetHeader className="p-4 border-b"><SheetTitle>{t('common.notifications')}</SheetTitle></SheetHeader>
                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                    <h3 className="text-md font-semibold text-foreground">{t('common.invitations')}</h3>
                    {isLoadingInvitations && <div className="text-center py-6 text-muted-foreground">{t('common.loading')}</div>}
                    {/* CLEANED: Using semantic destructive color for error message */}
                    {errorInvitations && <div className="text-center py-6 text-destructive bg-destructive/10 p-3 rounded-md">{t('common.errorLoadingInvitations')}</div>}
                    {!isLoadingInvitations && pendingInvitations.length === 0 && <div className="text-sm text-muted-foreground py-6 text-center">{t('common.noInvitations')}</div>}
                    
                    <div className="space-y-3">
                        {pendingInvitations.map(invitation => (
                            <div key={invitation.ID} className="bg-card p-3 rounded-lg border">
                                <p className="text-sm font-medium text-foreground">
                                    Mời tham gia <span className="font-semibold text-primary">{invitation.WorkspaceName}</span>
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">Từ: {invitation.InviterEmail} - {t('common.role')}: {invitation.Role}</p>
                                <div className="flex gap-2 justify-end mt-3">
                                    <Button variant="outline" size="sm" onClick={() => handleRejectInvitation(invitation.ID)}>{t('common.reject')}</Button>
                                    <Button variant="default" size="sm" onClick={() => handleAcceptInvitation(invitation.ID)}>{t('common.accept')}</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </SheetContent>
          </Sheet>

          <LanguageToggle />
          
          {/* FIXED: Applied gradient classes as requested */}
          <Button variant="outline" size="sm" className="hidden md:inline-flex dark:hover:bg-primary hover:bg-gradient-to-r from-purple-600 to-indigo-600">
            {t('common.editBrand')}
          </Button>

          {workspace && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {/* CLEANED: Simplified hover state */}
                <div className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded ">
                  {/* CLEANED: Using primary color for avatar */}
                  <Avatar className="bg-primary text-primary-foreground w-8 h-8 flex items-center justify-center border">
                    <span className="font-bold text-sm">{workspace.name?.charAt(0).toUpperCase() || 'W'}</span>
                  </Avatar>
                  <span className="font-semibold hidden md:inline-flex md:text-sm text-foreground">
                    {workspace.name}
                  </span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {user?.email && (
                  <>
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium text-foreground leading-none">{user.name || "User"}</p>
                      <p className="text-xs text-muted-foreground leading-none mt-1">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={() => setIsMembersModalOpen(true)} className="cursor-pointer   hover:button-gradient-light p-2 dark:hover:button-gradient-dark ">
                  <Users className="mr-2 h-4 w-4" /> {t('common.viewMembers')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/workspace')} className="cursor-pointer  hover:button-gradient-light dark:hover:button-gradient-dark p-2">
                  {t('common.selectWorkspace')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
           <Button variant="secondary" size="icon" className="hidden md:inline-flex" onClick={handleLogout} aria-label="Logout">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>

   
      <div className={cn("md:hidden border-t border-border bg-background", mobileMenuOpen ? "block" : "hidden")}>
        <nav className="px-2 py-2 space-y-1">
          {['home', 'agents', 'tasks', 'settings'].map((item) => {
            const path = `/dashboard${item === 'home' ? '' : '/' + item}`;
            const isActive = location.pathname === path;
            return (
              <Link
                key={item}
                to={path}
                className={cn("mobile-nav-link", isActive ? "mobile-nav-link-active" : "mobile-nav-link-default")}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t(item)}
              </Link>
            );
          })}
        </nav>
      </div>

       {/* --- DIALOGS --- (No theme changes needed, they adapt automatically) */}
       <Dialog open={isMembersModalOpen} onOpenChange={setIsMembersModalOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Thành viên Workspace</DialogTitle></DialogHeader>
            <div className="py-4 max-h-[400px] overflow-y-auto">
              {isLoadingMembers && <div className="text-center"><Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" /></div>}
              {membersError && <div className="text-center text-destructive">{t('common.errorLoadingMembers')}</div>}
              {membersData?.data && (
                <div className="space-y-3">
                  {membersData.data.map(member => (
                    <div key={member.user_id} className="flex items-center gap-3 p-2 border rounded-md">
                      <Avatar className="w-8 h-8 flex items-center justify-center bg-muted text-muted-foreground font-semibold">{member.user_name.charAt(0).toUpperCase()}</Avatar>
                      <div className="flex-grow">
                        <p className="font-medium text-foreground">{member.user_name}</p>
                        <p className="text-xs text-muted-foreground">{member.user_email} - {member.role}</p>
                      </div>
                      {user?.id !== member.user_id && (
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => confirmRemoveMember(member.user_id)} aria-label="Xóa thành viên">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
       </Dialog>

       <Dialog open={isRemoveMemberModalOpen} onOpenChange={setIsRemoveMemberModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('common.confirmRemoveMember')}</DialogTitle>
            <DialogDescription>{t('common.confirmRemoveMemberDescription')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRemoveMemberModalOpen(false)}>{t('common.cancel')}</Button>
            <Button variant="destructive" onClick={handleRemoveMember}>{t('common.remove')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
});

export default Header;